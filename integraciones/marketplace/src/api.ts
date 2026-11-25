import {MercadoPagoConfig, Preference, OAuth} from "mercadopago";
import {cacheLife, cacheTag} from "next/cache";

import {read, write} from "@/db";

interface Message {
  id: number;
  text: string;
}

interface User {
  id: number;
  name: string;
  marketplace: string | null;
}

const INITIAL_MESSAGES: Message[] = [
  {id: 1, text: "Espero ya te hayas suscrito a mi canal de YouTube"},
];
const INITIAL_USER: User = {id: 1, name: "Goncy", marketplace: null};

export const mercadopago = new MercadoPagoConfig({accessToken: process.env.MP_ACCESS_TOKEN!});

const api = {
  user: {
    async fetch(): Promise<User> {
      // Cacheamos el usuario hasta que lo invalidemos con el tag "user"
      "use cache";

      cacheLife("max");
      cacheTag("user");

      // Leemos el usuario guardado
      return read("user", INITIAL_USER);
    },
    async update(data: Partial<User>): Promise<void> {
      // Obtenemos los datos del usuario
      const db = await api.user.fetch();

      // Extendemos los datos con los nuevos datos
      const draft = {...db, ...data};

      // Guardamos los datos
      write("user", draft);
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

      // Devolvemos las credenciales
      return credentials;
    },
  },
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
