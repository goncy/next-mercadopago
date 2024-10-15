"use client";

import type {
  ICardPaymentBrickPayer,
  ICardPaymentFormData,
} from "@mercadopago/sdk-react/bricks/cardPayment/type";

import {useEffect} from "react";
import {initMercadoPago, CardPayment} from "@mercadopago/sdk-react";

export default function CardBrick({
  onSubmitAction,
  amount,
}: {
  onSubmitAction: (param: ICardPaymentFormData<ICardPaymentBrickPayer>) => Promise<void>;
  amount: number;
}) {
  useEffect(() => {
    // Inicializamos el SDK
    initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!);

    // Desmontamos el componente de bricks cuando se desmonte el componente
    return () => {
      window?.cardPaymentBrickController?.unmount();
    };
  }, []);

  // Renderizamos el componente de bricks
  return <CardPayment initialization={{amount}} onSubmit={onSubmitAction} />;
}
