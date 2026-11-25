import {updateTag} from "next/cache";

import api from "@/api";

import MessageForm from "./message-form";

// Queremos que esta página sea estática, invalidamos los mensajes cuando agregamos uno nuevo
export const ensureStatic = "navigation";

export default async function HomePage() {
  // Obtenemos los mensajes de la base de datos
  const messages = await api.message.list();

  async function add(
    message: string,
    data: {amount: number; email: string; installments: number; token: string},
  ) {
    "use server";

    // Creamos el pago con los datos del formulario
    const payment = await api.message.buy(data);

    // Añadimos el mensaje a la lista
    await api.message.add({text: message, id: payment.id!});

    // Invalidamos los mensajes para ver el nuevo mensaje en la lista
    updateTag("messages");
  }

  return (
    <section className="grid gap-8">
      <MessageForm amount={100} onSubmitAction={add} />
      <section className="grid gap-3">
        <h2>Mensajes</h2>
        <ul>
          {messages.map((message) => (
            <li key={message.id}>{message.text}</li>
          ))}
        </ul>
      </section>
    </section>
  );
}
