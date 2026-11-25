import {MercadoPagoConfig, OAuth, Payment, Preference} from "mercadopago";
import {cacheLife, cacheTag} from "next/cache";
import {cookies} from "next/headers";

interface Message {
  id: number;
  text: string;
}

export const mercadopago = new MercadoPagoConfig({accessToken: process.env.MP_ACCESS_TOKEN!});

const api = {
  user: {
    async token() {
      // Leemos el access token del vendedor de la cookie que guardamos al conectar su cuenta
      const cookieStore = await cookies();

      return cookieStore.get("marketplace")?.value;
    },
    async authorize() {
      // Obtenemos la url de autorización
      const url = new OAuth(mercadopago).getAuthorizationURL({
        options: {
          client_id: process.env.NEXT_PUBLIC_MP_CLIENT_ID,
          redirect_uri: `${process.env.APP_URL}/api/mercadopago/connect`,
        },
      });

      // Devolvemos la url
      return url;
    },
    async connect(code: string) {
      // Obtenemos las credenciales del usuario usando el code que obtuvimos de oauth
      const credentials = await new OAuth(mercadopago).create({
        body: {
          client_id: process.env.NEXT_PUBLIC_MP_CLIENT_ID,
          client_secret: process.env.MP_CLIENT_SECRET,
          code,
          redirect_uri: `${process.env.APP_URL}/api/mercadopago/connect`,
        },
      });

      // Guardamos el access token en una cookie que solo puede leer el servidor
      const cookieStore = await cookies();

      cookieStore.set("marketplace", credentials.access_token!, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: credentials.expires_in,
      });
    },
  },
  message: {
    async list(marketplace: string): Promise<Message[]> {
      // Cacheamos los mensajes de cada vendedor hasta que los invalidemos con el tag "messages"
      "use cache";

      cacheLife("max");
      cacheTag("messages");

      // Mercado Pago es nuestra base de datos: cada mensaje es un pago aprobado en la cuenta del vendedor con el texto en su `metadata`
      const {results = []} = await new Payment(
        new MercadoPagoConfig({accessToken: marketplace}),
      ).search({
        options: {
          external_reference: "message",
          status: "approved",
          sort: "date_created",
          criteria: "asc",
        },
      });

      // Devolvemos los pagos como mensajes
      return results.map((payment) => ({id: Number(payment.id), text: payment.metadata.text}));
    },
    async submit(text: Message["text"], marketplace: string) {
      // Creamos el cliente de Mercado Pago usando el access token del Marketplace
      const client: MercadoPagoConfig = new MercadoPagoConfig({accessToken: marketplace});

      // Creamos la preferencia incluyendo el precio, titulo y metadata. La información de `items` es standard de Mercado Pago. La información que nosotros necesitamos para nuestra DB debería vivir en `metadata`.
      const preference = await new Preference(client).create({
        body: {
          items: [
            {
              id: "message",
              unit_price: 100,
              quantity: 1,
              title: "Mensaje de muro",
            },
          ],
          metadata: {
            text,
          },
          // Marcamos el pago como mensaje para poder buscarlo después
          external_reference: "message",
          // Le agregamos ARS 5 de comisión
          marketplace_fee: 5,
        },
      });

      // Devolvemos el init point (url de pago) para que el usuario pueda pagar
      return preference.init_point!;
    },
  },
};

export default api;
