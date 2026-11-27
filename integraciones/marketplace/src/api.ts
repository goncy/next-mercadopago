import {MercadoPagoConfig, OAuth, Order} from "mercadopago";
import {cacheLife, cacheTag, revalidateTag} from "next/cache";
import {cookies} from "next/headers";

interface Message {
  id: string;
  text: string;
}

const mercadopago = new MercadoPagoConfig({accessToken: process.env.MP_ACCESS_TOKEN!});

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

      cookieStore.set("marketplace", credentials.access_token!, {httpOnly: true});
    },
  },
  message: {
    async list(marketplace: string): Promise<Message[]> {
      // Cacheamos los mensajes de cada vendedor hasta que los invalidemos con el tag "messages"
      "use cache";

      cacheLife("max");
      cacheTag("messages");

      // Creamos el cliente de Mercado Pago usando el access token del vendedor
      const client = new MercadoPagoConfig({accessToken: marketplace});

      // La búsqueda pide un rango de fechas de hasta 30 días: buscamos los pagos de los últimos 30 días
      const now = Date.now();

      // Mercado Pago es nuestra base de datos: cada mensaje es un pago procesado (aprobado) en la cuenta del vendedor con el texto en su `description`
      const {data = []} = await new Order(client).search({
        options: {
          external_reference: "message",
          status: "processed",
          begin_date: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(now).toISOString(),
        },
      });

      // Devolvemos los pagos como mensajes
      return data.map((order) => ({id: order.id!, text: order.description!}));
    },
    async submit(text: Message["text"], marketplace: string) {
      // Creamos el cliente de Mercado Pago usando el access token del vendedor
      const client = new MercadoPagoConfig({accessToken: marketplace});

      // Creamos el pago incluyendo el monto, los items y la descripción. La información de `items` es standard de Mercado Pago. El texto del mensaje lo guardamos en `description`.
      const order = await new Order(client).create({
        body: {
          // En Checkout Pro el pago es `online` y se procesa en modo `manual`: el comprador paga en Mercado Pago
          type: "online",
          processing_mode: "manual",
          // Los montos van como strings
          total_amount: "100.00",
          items: [
            {
              external_code: "message",
              unit_price: "100.00",
              quantity: 1,
              title: "Mensaje de muro",
            },
          ],
          description: text,
          // Marcamos el pago como mensaje para poder buscarlo después
          external_reference: "message",
          // Le agregamos ARS 5 de comisión
          marketplace_fee: "5.00",
          config: {
            online: {
              // Cuando el pago se aprueba, Mercado Pago vuelve solo a nuestra aplicación, a la ruta que verifica el pago
              success_url: `${process.env.APP_URL}/api/mercadopago`,
              auto_return: "approved",
            },
          },
        },
      });

      // Devolvemos la url del checkout para que el usuario pueda pagar
      return order.checkout_url!;
    },
  },
  payment: {
    async verify(id: string, marketplace: string) {
      // Creamos el cliente de Mercado Pago usando el access token del vendedor, porque el pago es suyo
      const client = new MercadoPagoConfig({accessToken: marketplace});

      // Obtenemos el pago desde Mercado Pago para no confiar en el id que nos llega
      const order = await new Order(client).get({id});

      // Si se procesó (el pago se aprobó), invalidamos los mensajes para mostrar el nuevo mensaje
      if (order.status === "processed") {
        revalidateTag("messages", {expire: 0});
      }
    },
  },
};

export default api;
