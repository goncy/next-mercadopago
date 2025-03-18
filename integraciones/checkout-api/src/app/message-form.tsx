"use client";

import {
  initMercadoPago,
  CardNumber,
  ExpirationDate,
  SecurityCode,
  createCardToken,
} from "@mercadopago/sdk-react";
import Form from "next/form";

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
    const token = await createCardToken({cardholderName: name});

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
    <Form action={handleSubmit}>
      <textarea required name="message" placeholder="Hola perro" rows={3} />
      <CardNumber placeholder="1234 1234 1234 1234" />
      <SecurityCode placeholder="123" />
      <ExpirationDate placeholder="12/2025" />
      <input name="name" placeholder="Nombre" type="text" />
      <input name="email" placeholder="Email" type="email" />
      <button type="submit">Pagar</button>
    </Form>
  );
}
