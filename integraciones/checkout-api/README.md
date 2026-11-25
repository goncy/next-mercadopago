# Integración de Mercado Pago con Checkout API

En este documento vamos a aprender a agregar pagos a nuestra aplicación utilizando Mercado Pago Checkout API. Los usuarios van a poder agregar mensajes a una lista de mensajes pagando por cada mensaje.

Antes de continuar, asegurate de haber [clonado el proyecto](../../configuracion/clonar-aplicacion/README.md), [creado una aplicación en Mercado Pago](../../configuracion/crear-aplicacion/README.md) y copiado las [`credenciales de prueba`](../../configuracion/credenciales/README.md) a tu archivo `.env.example` y renombrarlo a `.env.local`.

## Índice

1. [Revisando nuestra aplicación](#revisando-nuestra-aplicación)
2. [Crear el formulario de pago](#crear-el-formulario-de-pago)
3. [Efectivizar el pago](#efectivizar-el-pago)
4. [Probar la integración](#probar-la-integración)
5. [Consideraciones](#consideraciones)

## Revisando nuestra aplicación

En la página de inicio de nuestra aplicación (`/src/app/page.tsx`) se renderiza un formulario llamado `MessageForm` que incluye un campo para escribir el mensaje y un formulario con campos de número de tarjeta, fecha de vencimiento y código de seguridad para realizar el pago. Adicionalmente se pide nombre e email los cuales son usados para generar un token de pago para luego efectivizar el pago. Al hacer submit de este formulario, se ejecuta un Server Action que recibe el mensaje y la información del pago y crea el pago con el mensaje en su `metadata`:

```tsx
import {updateTag} from "next/cache";

import MessageForm from "./message-form";

import api from "@/api";

// Queremos que esta página sea estática, invalidamos los mensajes cuando agregamos uno nuevo
export const ensureStatic = "navigation";

export default async function HomePage() {
  // Obtenemos los mensajes
  const messages = await api.message.list();

  async function add(
    message: string,
    data: {amount: number; email: string; installments: number; token: string},
  ) {
    "use server";

    // Creamos el pago con el mensaje y los datos del formulario
    await api.message.buy(message, data);

    // Invalidamos los mensajes para ver el nuevo mensaje en la lista
    updateTag("messages");
  }

  return (
    <section className="grid gap-8">
      <MessageForm amount={100} onSubmitAction={add} />
      <ul>
        {messages.map((message) => (
          <li key={message.id}>
            {message.text}
          </li>
        ))}
      </ul>
    </section>
  );
}
```

> [!NOTE]
> La página es estática (`ensureStatic = "navigation"` hace que el build falle si algo la vuelve dinámica). `api.message.list` usa `"use cache"` con el tag `messages`, así que cuando creamos un pago invalidamos ese tag con `updateTag` y la lista se actualiza al instante.

## Crear el formulario de pago

Nuestro formulario de pago (`src/app/message-form.tsx`) va a encargarse de capturar el mensaje del usuario, los datos de pago y enviarlos al servidor. Para eso usamos la librería `@mercadopago/sdk-react` y los componentes `CardNumber`, `SecurityCode` y `ExpirationDate`. También usamos la función `createCardToken`:

```tsx
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

  // Renderizamos el formulario con los campos de pago
  return (
    <Form action={handleSubmit}>
      <textarea
        required
        name="message"
        placeholder="Hola perro"
        rows={3}
      />
      <CardNumber placeholder="1234 1234 1234 1234" />
      <SecurityCode placeholder="123" />
      <ExpirationDate placeholder="12/2025" />
      <input name="name" placeholder="Nombre" type="text" />
      <input name="email" placeholder="Email" type="email" />
      <button type="submit">Pagar</button>
    </Form>
  );
}
```

## Efectivizar el pago

Dentro de `/src/api.ts`, la función `buy` en `message` se encarga de tomar los datos del formulario y crear un pago en Mercado Pago:

```ts
const api = {
  message: {
    async buy(
      text: Message["text"],
      data: {amount: number; email: string; installments: number; token: string},
    ) {
      // Creamos el pago con los datos del formulario
      const payment = await new Payment(mercadopago).create({
        body: {
          payer: {
            email: data.email,
          },
          token: data.token,
          transaction_amount: data.amount,
          installments: data.installments,
          // Guardamos el texto en la metadata y marcamos el pago como mensaje para poder buscarlo después
          metadata: {text},
          external_reference: "message",
        },
      });

      // Devolvemos el pago
      return payment;
    },
  },
};
```

> [!NOTE]
> Cuando el usuario hizo submit del formulario, en realidad no pagó, sino que generamos un token de pago para posteriormente (una vez que validemos los datos desde el servidor) podamos efectivizar el pago como hacemos ahora.

## Listar los mensajes

No tenemos una base de datos: Mercado Pago ya guarda cada pago con el texto en su `metadata`. Dentro de `/src/api.ts`, la función `list` en `message` busca los pagos aprobados marcados como mensaje y los devuelve como mensajes:

```ts
const api = {
  message: {
    async list(): Promise<Message[]> {
      // Cacheamos los mensajes hasta que los invalidemos con el tag "messages"
      "use cache";

      cacheLife("max");
      cacheTag("messages");

      // Mercado Pago es nuestra base de datos: cada mensaje es un pago aprobado con el texto en su `metadata`
      const {results = []} = await new Payment(mercadopago).search({
        options: {
          external_reference: "message",
          status: "approved",
          sort: "date_created",
          criteria: "asc",
        },
      });

      // Devolvemos los pagos como mensajes
      return results.map((payment) => ({id: Number(payment.id), text: payment.metadata.text}));
    },
  },
};
```

## Probar la integración

Ahora vamos a nuestra aplicación, cargamos un mensaje, llenamos el formulario con los datos que tenemos en `Tarjetas de prueba` en nuestra aplicación de Mercado Pago y presionamos `Pagar`. Después de unos segundos deberíamos ver la página actualizada con nuestro nuevo mensaje.

## Consideraciones

Siempre asegurate de validar los montos y estado de los pagos. En una aplicación real no estaría de más [configurar un webhook para recibir notificaciones](../../configuracion/webhook/README.md) sobre los pagos de tu aplicación para tener más control sobre el estado y validez de los pagos. Podés ver un ejemplo de como [recibir notificaciones de un webhook de pago](../checkout-pro/README.md#recibir-notificaciones) en la sección de Checkout Pro.

---

[Volver al inicio](../../README.md)
