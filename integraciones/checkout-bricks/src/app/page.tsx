import api from "@/api";

import MessageForm from "./message-form";

// La página lee una cookie, así que se renderiza en cada visita y no necesita ser instantánea
export const instant = false;

export default async function HomePage() {
  // Obtenemos el último pago
  const payment = await api.message.last();

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
      {payment ? (
        <section className="grid gap-3">
          <h2>Último pago</h2>
          <ul>
            <li>Mensaje: {payment.text}</li>
            <li>Estado: {payment.status}</li>
            <li>Monto: ${payment.amount}</li>
          </ul>
        </section>
      ) : null}
    </section>
  );
}
