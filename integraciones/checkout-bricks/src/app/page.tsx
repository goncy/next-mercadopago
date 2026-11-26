import api from "@/api";

import MessageForm from "./message-form";

// La página lee una cookie, así que se renderiza en cada visita y no necesita ser instantánea
export const instant = false;

export default async function HomePage() {
  // Obtenemos los mensajes
  const messages = await api.message.list();

  async function add(
    message: string,
    data: {amount: number; email: string; installments: number; token: string},
  ) {
    "use server";

    // Creamos el pago con el mensaje y los datos del brick
    await api.message.buy(message, data);
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
