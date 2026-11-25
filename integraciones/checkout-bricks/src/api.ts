import {MercadoPagoConfig, Payment} from "mercadopago";
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
    async buy(
      text: Message["text"],
      data: {amount: number; email: string; installments: number; token: string},
    ) {
      // Creamos el pago con los datos del brick
      await new Payment(mercadopago).create({
        body: {
          payer: {
            email: data.email,
          },
          token: data.token,
          transaction_amount: data.amount,
          installments: data.installments,
          // Guardamos el texto en la metadata y marcamos el pago como mensaje para poder buscarlo después
          metadata: {text},
          external_reference: "message",
        },
      });
    },
  },
};

export default api;
