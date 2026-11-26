import {MercadoPagoConfig, Order} from "mercadopago";
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

      // La búsqueda de orders acepta un rango de fechas de hasta un mes, así que buscamos las de los últimos 30 días
      const end = new Date();
      const begin = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Mercado Pago es nuestra base de datos: cada mensaje es una order procesada (pagada) con el texto en su `description`
      const {data = []} = await new Order(mercadopago).search({
        options: {
          external_reference: "message",
          status: "processed",
          begin_date: begin.toISOString(),
          end_date: end.toISOString(),
        },
      });

      // Devolvemos las orders como mensajes
      return data.map((order) => ({id: order.id!, text: order.description!}));
    },
    async submit(text: Message["text"]) {
      // Creamos la order incluyendo el monto, los items y la descripción. La información de `items` es standard de Mercado Pago. Orders no tiene `metadata`, así que guardamos el texto del mensaje en `description`.
      const order = await new Order(mercadopago).create({
        body: {
          // Checkout Pro usa orders `online` procesadas en modo `manual`: el comprador paga en Mercado Pago
          type: "online",
          processing_mode: "manual",
          // Los montos de Orders son strings
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
          // Marcamos la order como mensaje para poder buscarla después
          external_reference: "message",
          config: {
            online: {
              // Cuando el pago se aprueba, Mercado Pago vuelve solo a nuestra aplicación, a la ruta que verifica la order
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
};

export default api;
