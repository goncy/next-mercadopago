import api from "@/api";

import MessageForm from "./message-form";

export default async function HomePage() {
  // Obtenemos el último pago
  const payment = await api.message.last();

  async function add(
    message: string,
    data: {amount: number; email: string; installments: number; token: string},
  ) {
    "use server";

    // Creamos el pago con el mensaje y los datos del formulario
    await api.message.buy(message, data);
  }

  return (
    <section className="grid gap-8">
      <MessageForm amount={100} onSubmitAction={add} />
      {payment ? (
        <article className="grid gap-1 rounded-lg border border-neutral-800 px-4 py-3 text-sm">
          <h2>Último pago</h2>
          <p>{payment.external_reference || "<mensaje vacío>"}</p>
          <p className="text-neutral-400">
            {payment.status} · ${payment.transaction_amount}
          </p>
        </article>
      ) : null}
    </section>
  );
}
