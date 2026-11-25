import {MercadoPagoConfig, Payment} from "mercadopago";
import {cacheLife, cacheTag} from "next/cache";

import {read, write} from "@/db";

interface Message {
  id: number;
  text: string;
}

const INITIAL_MESSAGES: Message[] = [
  {id: 1, text: "Espero ya te hayas suscrito a mi canal de YouTube"},
];

export const mercadopago = new MercadoPagoConfig({accessToken: process.env.MP_ACCESS_TOKEN!});

const api = {
  message: {
    async list(): Promise<Message[]> {
      // Cacheamos los mensajes hasta que los invalidemos con el tag "messages"
      "use cache";

      cacheLife("max");
      cacheTag("messages");

      // Leemos los mensajes guardados
      return read("message", INITIAL_MESSAGES);
    },
    async add(message: Message): Promise<void> {
      // Obtenemos los mensajes
      const db = await api.message.list();

      // Agregamos el nuevo mensaje
      const draft = db.concat(message);

      // Guardamos los datos
      write("message", draft);
    },
    async buy(data: {amount: number; email: string; installments: number; token: string}) {
      // Creamos el pago con los datos del brick
      const payment = await new Payment(mercadopago).create({
        body: {
          payer: {
            email: data.email,
          },
          token: data.token,
          transaction_amount: data.amount,
          installments: data.installments,
        },
      });

      // Devolvemos el pago
      return payment;
    },
  },
};

export default api;
