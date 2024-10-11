import {readFileSync, writeFileSync} from "node:fs";

import {MercadoPagoConfig, Preference, Payment} from "mercadopago";
import {revalidatePath} from "next/cache";

interface Message {
  id: number;
  text: string;
}

const mercadopago = new MercadoPagoConfig({accessToken: process.env.MP_ACCESS_TOKEN!});

const api = {
  message: {
    async list(): Promise<Message[]> {
      const db = readFileSync("data.db");

      // Devolvemos los datos como un array de objetos
      return JSON.parse(db.toString());
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
    async add(id: string): Promise<void> {
      // Obtenemos el pago
      const payment = await new Payment(mercadopago).get({id});

      // Si se aprueba, agregamos el mensaje
      if (payment.status === "approved") {
        // Obtenemos los datos
        const db = await this.list();

        // Si ya existe un mensaje con el id del pago, lanzamos un error
        if (db.some((message) => message.id === payment.id)) {
          throw new Error("Payment already added");
        }

        // Agregamos el nuevo mensaje
        db.push({id: payment.id!, text: payment.metadata.text});

        // Guardamos los datos
        writeFileSync("data.db", JSON.stringify(db, null, 2));

        // Revalidamos la página de inicio para mostrar los datos actualizados
        revalidatePath("/");
      }
    },
  },
};

export default api;
