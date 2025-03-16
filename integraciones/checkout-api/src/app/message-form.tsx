"use client";

import {initMercadoPago, CardNumber, ExpirationDate, SecurityCode, createCardToken} from "@mercadopago/sdk-react";
import Form from "next/form"

// Inicializamos el SDK
initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!);

export default function MessageForm({
  onSubmitAction,
  amount,
}: {
  onSubmitAction: (
    message: string,
    data: {amount: number; email: string; installments: number; token: string},
  ) => Promise<void>;
  amount: number;
}) {
  async function handleSubmit(formData: FormData) {
    const message = formData.get("message") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;

    // Creamos un token de tarjeta para poder procesar el pago desde el servidor
    const token = await createCardToken({cardholderName: name})

    // Enviamos todos los datos al servidor
    await onSubmitAction(message, {
      amount,
      email,
      installments: 1,
      token: token!.id,
    });
  }

  // Renderizamos el componente de bricks
  return (
    <Form action={handleSubmit} className="flex flex-col gap-4">
      <textarea
        required
        className="w-full border-2 border-blue-400 p-2"
        name="message"
        placeholder="Hola perro"
        rows={3}
      />
      <CardNumber placeholder="1234 1234 1234 1234" />
      <SecurityCode placeholder="123" />
      <ExpirationDate placeholder="12/2025" />
      <input className="border-2 border-blue-400 p-2" name="name" type="text" placeholder="Nombre" />
      <input className="border-2 border-blue-400 p-2" name="email" type="email" placeholder="Email" />
      <button className="rounded bg-blue-400 p-2" type="submit">Pagar</button>
    </Form>
  );
}
