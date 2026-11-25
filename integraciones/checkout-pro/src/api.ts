import {MercadoPagoConfig, Payment, Preference} from "mercadopago";
import {cacheLife, cacheTag} from "next/cache";

interface Message {
  id: string;
  text: string;
}

export const mercadopago = new MercadoPagoConfig({accessToken: process.env.MP_ACCESS_TOKEN!});

const api = {
  message: {
    async list(): Promise<Message[]> {
      // Cacheamos los mensajes hasta que los invalidemos con el tag "messages"
      "use cache";

      cacheLife("max");
      cacheTag("messages");

      // Mercado Pago es nuestra base de datos: cada mensaje es un pago aprobado con el texto en su `metadata`
      const {results = []} = await new Payment(mercadopago).search({
        options: {external_reference: "message", status: "approved"},
      });

      // Devolvemos los pagos como mensajes
      return results.map((payment) => ({id: payment.id!, text: payment.metadata.text}));
    },
    async submit(text: Message["text"]) {
      // Creamos la preferencia incluyendo el precio, titulo y metadata. La información de `items` es standard de Mercado Pago. La información que nosotros necesitamos para nuestra DB debería vivir en `metadata`.
      const preference = await new Preference(mercadopago).create({
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
          // Le pedimos a Mercado Pago que nos notifique los cambios del pago en nuestro webhook
          notification_url: `${process.env.APP_URL}/api/mercadopago`,
          // Volvemos a nuestra aplicación después de pagar, automáticamente si el pago se aprueba
          back_urls: {
            success: process.env.APP_URL,
            pending: process.env.APP_URL,
            failure: process.env.APP_URL,
          },
          auto_return: "approved",
        },
      });

      // Devolvemos el init point (url de pago) para que el usuario pueda pagar
      return preference.init_point!;
    },
  },
};

export default api;
