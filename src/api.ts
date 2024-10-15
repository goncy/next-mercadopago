import {readFileSync, writeFileSync} from "node:fs";

import {MercadoPagoConfig, Preference, PreApproval} from "mercadopago";

interface Message {
  id: number;
  text: string;
}

interface User {
  suscription: string | null;
  name: string;
  id: number;
}

export const mercadopago = new MercadoPagoConfig({accessToken: process.env.MP_ACCESS_TOKEN!});

const api = {
  user: {
    async fetch(): Promise<User> {
      // Leemos el archivo de la base de datos del usuario
      const db = readFileSync("db/user.db");

      // Devolvemos los datos como un objeto
      return JSON.parse(db.toString());
    },
    async update(data: Partial<User>): Promise<void> {
      // Obtenemos los datos del usuario
      const db = await api.user.fetch();

      // Extendemos los datos con los nuevos datos
      const draft = {...db, ...data};

      // Guardamos los datos
      writeFileSync("db/user.db", JSON.stringify(draft, null, 2));
    },
    async subscribe(email: string, token: string) {
      // Creamos la suscripción con todos sus datos
      const suscription = await new PreApproval(mercadopago).create({
        body: {
          back_url: process.env.APP_URL!,
          reason: "Suscripción a mensajes de muro",
          auto_recurring: {
            frequency: 1,
            frequency_type: "months",
            transaction_amount: 100,
            currency_id: "ARS",
            start_date: new Date().toISOString(),
            end_date: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30).toISOString(),
          },
          payer_email: email,
          card_token_id: token,
          status: "authorized",
        },
      });

      // Guardamos el id de la suscripción en la base de datos del usuario
      await api.user.update({suscription: suscription.id});
    },
  },
  message: {
    async list(): Promise<Message[]> {
      // Leemos el archivo de la base de datos de los mensajes
      const db = readFileSync("db/message.db");

      // Devolvemos los datos como un array de objetos
      return JSON.parse(db.toString());
    },
    async add(message: Message): Promise<void> {
      // Obtenemos los mensajes
      const db = await api.message.list();

      // Si ya existe un mensaje con ese id, lanzamos un error
      if (db.some((_message) => _message.id === message.id)) {
        throw new Error("Message already added");
      }

      // Agregamos el nuevo mensaje
      const draft = db.concat(message);

      // Guardamos los datos
      writeFileSync("db/message.db", JSON.stringify(draft, null, 2));
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
        },
      });

      // Devolvemos el init point (url de pago) para que el usuario pueda pagar
      return preference.init_point!;
    },
  },
};

export default api;
