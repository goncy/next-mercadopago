import {revalidatePath} from "next/cache";

import MessageForm from "./message-form";

import api from "@/api";

// Queremos que esta página sea dinámica para siempre poder ver la información actualizada del usuario
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Obtenemos los mensajes de la base de datos
  const messages = await api.message.list();

  async function add(
    message: string,
    data: {amount: number; email: string; installments: number; token: string},
  ) {
    "use server";

    // Creamos el pago con los datos del brick
    const payment = await api.message.buy(data);

    // Añadimos el mensaje a la lista
    await api.message.add({text: message, id: payment.id!});

    // Revalidamos la ruta para poder ver el formulario de agregar mensaje
    revalidatePath("/");
  }

  return (
    <section className="grid gap-8">
      <MessageForm amount={100} onSubmitAction={add} />
      <ul>
        {messages.map((message) => (
          <li key={message.id}>{message.text}</li>
        ))}
      </ul>
    </section>
  );
}
