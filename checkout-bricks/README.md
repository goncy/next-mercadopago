# Integración de Mercado Pago con Checkout Bricks

En este documento vamos a aprender a agregar pagos a nuestra aplicación utilizando Mercado Pago Checkout Bricks. Los usuarios van a poder agregar mensajes a una lista de mensajes pagando por cada mensaje.

Antes de continuar, asegurate de haber [creado una aplicación en Mercado Pago](https://www.mercadopago.com.ar/developers/panel/app) y copiado las `credenciales de prueba` a tu archivo `.env.local`.

## Indice

1. [Revisando nuestra aplicación](#revisando-nuestra-aplicación)
2. [Crear una preferencia de pago](#crear-una-preferencia-de-pago)
3. [Realizar un pago de prueba](#realizar-un-pago-de-prueba)
4. [Configurar un webhook de pagos](#configurar-un-webhook-de-pagos)
5. [Recibir notificaciones de pagos](#recibir-notificaciones-de-pagos)
6. [Verificar la autenticidad del pago](#verificar-la-autenticidad-del-pago)
7. [Realizar otro pago de prueba](#realizar-otro-pago-de-prueba)

## Revisando nuestra aplicación

En la página de inicio de nuestra aplicación (`/src/app/page.tsx`) se renderiza un formulario llamado `MessageForm` que incluye un campo para escribir el mensaje y un formulario de Mercado Pago para realizar el pago. Al hacer submit de este formulario, se ejecuta un Server Action que recibe el mensaje y la información del pago y agrega el mensaje a la lista:

```tsx
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
```

## Crear el formulario de pago

Nuestro formulario de pago (`src/app/message-form.tsx`) va a encargarse de capturar el mensaje del usuario, los datos de pago y enviarlos al servidor. Para eso usamos la librería `@mercadopago/sdk-react` y el componente `CardPayment`:

```tsx
"use client";

import type {
  ICardPaymentBrickPayer,
  ICardPaymentFormData,
} from "@mercadopago/sdk-react/bricks/cardPayment/type";

import {useEffect, useRef} from "react";
import {initMercadoPago, CardPayment} from "@mercadopago/sdk-react";

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
    initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!);

    // Desmontamos el componente de bricks cuando se desmonte el componente
    return () => {
      window?.cardPaymentBrickController?.unmount();
    };
  }, []);

  // Renderizamos el componente de bricks
  return (
    <form ref={formRef}>
      <textarea
        required
        className="w-full border-2 border-blue-400 p-2"
        name="message"
        placeholder="Hola perro"
        rows={3}
      />
      <CardPayment
        customization={{paymentMethods: {maxInstallments: 1, minInstallments: 1}}}
        initialization={{amount}}
        onSubmit={handleSubmit}
      />
    </form>
  );
}
```

## Efectivizar el pago

Dentro de `/src/api.ts`, la función `buy` en `message` se encarga de tomar los datos del formulario y crear un pago en Mercado Pago:

```ts
const api = {
  message: {
    async buy(data: {amount: number; email: string; installments: number; token: string}) {
      // Creamos el pago con los datos del brick
      const payment = await new Payment(mercadopago).create({
        body: {
          payer: {
            email: data.email,
          },
          token: data.token,
          transaction_amount: data.amount,
          installments: data.installments,
        },
      });

      // Devolvemos el pago
      return payment;
    },
  },
};
```

> [!NOTE]
> Cuando el usuario hizo submit del formulario, en realidad no pagó, sino que generó un token de pago para posteriormente (una vez que validemos los datos desde el servidor) podamos efectivizar el pago como hacemos ahora.

## Realizar un pago de prueba

Ahora vamos a nuestra aplicación, cargamos un mensaje, llenamos el formulario con los datos que tenemos en `Tarjetas de prueba` en nuestra aplicación de Mercado Pago y presionamos `Pagar`. Después de unos segundos deberíamos ver la página actualizada con nuestro nuevo mensaje.

## Consideraciones

Siempre asegurate de validar los montos y estado de los pagos. En una aplicación real no estaría de más [configurar un webhook para recibir notificaciones](../webhook/README.md) sobre los pagos de tu aplicación para tener más control sobre el estado y validez de los pagos. Podés ver un ejemplo de como [configurar un webhook de pago](../checkout-pro/README.md#recibir-notificaciones) en la sección de Checkout Pro.

---

[Volver al inicio](../README.md)
