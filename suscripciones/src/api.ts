import fs from "node:fs";

import {MercadoPagoConfig, PreApproval} from "mercadopago";

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
      const user = fs.readFileSync("db/user.db", "utf-8");

      return JSON.parse(user);
    },
    async update(data: Partial<User>) {
      const user = await api.user.fetch();

      fs.writeFileSync("db/user.db", JSON.stringify({...user, ...data}));
    },
  },
  message: {
    async add(message: string) {
      const messages = await api.message.list();

      messages.push({
        id: messages.length + 1,
        text: message,
      });

      fs.writeFileSync("db/message.db", JSON.stringify(messages));
    },
    async list(): Promise<Message[]> {
      const messages = fs.readFileSync("db/message.db", "utf-8");

      return JSON.parse(messages);
    },
  },
};

export default api;
