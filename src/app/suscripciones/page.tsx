import type {
  ICardPaymentBrickPayer,
  ICardPaymentFormData,
} from "@mercadopago/sdk-react/bricks/cardPayment/type";

import {revalidatePath} from "next/cache";

import CardBrick from "./card-brick";

import api from "@/api";

// Queremos que esta página sea dinámica para siempre poder ver la información actualizada del usuario
export const dynamic = "force-dynamic";

export default async function SuscripcionesPage() {
  // Obtenemos el usuario y los mensajes
  const user = await api.user.fetch();
  const messages = await api.message.list();

  // Creamos una función para agregar un mensaje
  async function add(formData: FormData) {
    "use server";

    // Obtenemos el mensaje del formulario
    const message = formData.get("text") as string;

    // Agregamos el mensaje a la base de datos
    await api.message.add({text: message, id: Date.now()});

    // Revalidamos la ruta para que se actualice la información
    revalidatePath("/suscripciones");
  }

  async function subscribe(data: ICardPaymentFormData<ICardPaymentBrickPayer>) {
    "use server";

    // Creamos una suscripción usando los datos que nos devolvió el Checkout Brick
    await api.user.subscribe(data.payer.email!, data.token);

    // Revalidamos la ruta para poder ver el formulario de agregar mensaje
    revalidatePath("/suscripciones");
  }

  return (
    <section className="grid gap-8">
      {user.suscription ? (
        <form action={add} className="grid gap-2">
          <textarea
            className="border-2 border-blue-400 p-2"
            name="text"
            placeholder="Hola perro"
            rows={3}
          />
          <button className="rounded bg-blue-400 p-2" type="submit">
            Enviar
          </button>
        </form>
      ) : (
        <CardBrick amount={100} onSubmitAction={subscribe} />
      )}
      <ul className="grid gap-2">
        {messages.map((message) => (
          <li key={message.id} className="rounded bg-blue-400/10 p-4">
            {message.text}
          </li>
        ))}
      </ul>
    </section>
  );
}
