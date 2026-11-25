"use client";

import type {
  ICardPaymentBrickPayer,
  ICardPaymentFormData,
} from "@mercadopago/sdk-react/esm/bricks/cardPayment/type";

import {initMercadoPago, CardPayment} from "@mercadopago/sdk-react";
import {useEffect, useRef} from "react";

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
  // Nos guardamos una referencia del formulario para obtener los datos cuando se haga submit
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(data: ICardPaymentFormData<ICardPaymentBrickPayer>) {
    // Obtenemos los datos del formulario
    const formData = new FormData(formRef.current!);
    const message = formData.get("message") as string;

    // Enviamos los datos al servidor, incluyendo el mensaje del usuario
    await onSubmitAction(message, {
      amount,
      email: data.payer.email!,
      installments: data.installments,
      token: data.token,
    });
  }

  useEffect(() => {
    // Inicializamos el SDK
    initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!, {locale: "es-AR"});

    // Desmontamos el componente de bricks cuando se desmonte el componente
    return () => {
      window?.cardPaymentBrickController?.unmount();
    };
  }, []);

  // Renderizamos el componente de bricks
  return (
    <form ref={formRef}>
      <textarea required name="message" placeholder="Hola perro" rows={3} />
      <CardPayment
        customization={{
          paymentMethods: {maxInstallments: 1, minInstallments: 1},
          // Usamos el tema oscuro con los colores de la aplicación
          visual: {
            style: {
              theme: "dark",
              customVariables: {
                baseColor: "#fff",
                buttonTextColor: "#000",
                formBackgroundColor: "#000",
                inputBackgroundColor: "#0a0a0a",
                outlinePrimaryColor: "#262626",
                formPadding: "0px",
              },
            },
          },
        }}
        initialization={{amount}}
        onSubmit={handleSubmit}
      />
    </form>
  );
}
