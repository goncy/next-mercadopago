import {MercadoPagoConfig, PreApproval} from "mercadopago";
import {cacheLife, cacheTag} from "next/cache";

import {read, write} from "@/db";

interface Message {
  id: number;
  text: string;
}

interface User {
  id: number;
  name: string;
  suscription: string | null;
  email: string;
}

const INITIAL_MESSAGES: Message[] = [
  {id: 1, text: "Espero ya te hayas suscrito a mi canal de YouTube"},
];
const INITIAL_USER: User = {id: 1, name: "Goncy", suscription: null, email: ""};

export const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

const api = {
  user: {
    async suscribe(email: string) {
      const suscription = await new PreApproval(mercadopago).create({
        body: {
          back_url: process.env.APP_URL!,
          reason: "Suscripción a mensajes de muro",
          auto_recurring: {
            frequency: 1,
            frequency_type: "months",
            transaction_amount: 100,
            currency_id: "ARS",
          },
          payer_email: email,
          status: "pending",
        },
      });

      return suscription.init_point!;
    },
    async fetch(): Promise<User> {
      "use cache";

      cacheLife("max");
      cacheTag("user");

      return read("user", INITIAL_USER);
    },
    async update(data: Partial<User>) {
      const user = await api.user.fetch();

      write("user", {...user, ...data});
    },
  },
  message: {
    async add(message: string) {
      const messages = await api.message.list();

      messages.push({
        id: messages.length + 1,
        text: message,
      });

      write("message", messages);
    },
    async list(): Promise<Message[]> {
      "use cache";

      cacheLife("max");
      cacheTag("messages");

      return read("message", INITIAL_MESSAGES);
    },
  },
};

export default api;
