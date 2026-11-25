import {MercadoPagoConfig, Preference} from "mercadopago";
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

      // Si ya existe un mensaje con ese id, lanzamos un error
      if (db.some((_message) => _message.id === message.id)) {
        throw new Error("Message already added");
      }

      // Agregamos el nuevo mensaje
      const draft = db.concat(message);

      // Guardamos los datos
      write("message", draft);
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
