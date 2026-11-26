# Integración de Mercado Pago con Checkout Bricks

En este documento vamos a aprender a agregar pagos a nuestra aplicación utilizando Mercado Pago Checkout Bricks. Los usuarios van a escribir un mensaje y pagarlo, y la página les va a mostrar su último pago.

Podés preparar todo de dos formas:

- **A mano**: asegurate de haber [clonado el proyecto](../../configuracion/clonar-aplicacion/README.md), [creado una aplicación en Mercado Pago](../../configuracion/crear-aplicacion/README.md) y copiado las [`credenciales de prueba`](../../configuracion/credenciales/README.md) a tu archivo `.env.example` y renombrarlo a `.env.local`.
- **Con el MCP**: configurá el [MCP de Mercado Pago](../../configuracion/mcp/README.md) con tu cuenta principal y copiá este prompt en tu agente. Antes, [cloná el proyecto](../../configuracion/clonar-aplicacion/README.md).

```text
Usando el MCP de Mercado Pago, prepará este proyecto para desarrollo:
1. Creá una aplicación de Checkout Bricks llamada <tu usuario>-next-mercadopago-checkout-bricks. Mostrame el resumen antes de crearla.
2. Copiá .env.example a .env.local y completá MP_ACCESS_TOKEN y NEXT_PUBLIC_MP_PUBLIC_KEY con las credenciales de prueba. No me muestres las credenciales y no agregues el archivo a git.
3. Mostrame las tarjetas de prueba de mi país y qué nombre de titular usar para un pago aprobado y uno rechazado.
```

## Índice

1. [Revisando nuestra aplicación](#revisando-nuestra-aplicación)
2. [Crear el formulario de pago](#crear-el-formulario-de-pago)
3. [Efectivizar el pago](#efectivizar-el-pago)
4. [Mostrar el último pago](#mostrar-el-último-pago)
5. [Probar la integración](#probar-la-integración)
6. [Consideraciones](#consideraciones)

## Revisando nuestra aplicación

En la página de inicio de nuestra aplicación (`/src/app/page.tsx`) se renderiza un formulario llamado `MessageForm` que incluye un campo para escribir el mensaje y un formulario de Mercado Pago para realizar el pago. Al hacer submit de este formulario, se ejecuta un Server Action que recibe el mensaje y la información del pago y crea el pago con el mensaje como referencia:

```tsx
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
```

> [!NOTE]
> Como la página lee una cookie, se renderiza en cada visita (`instant = false`). Cuando el Server Action guarda la cookie, Next.js vuelve a renderizar la página y el último pago aparece al instante.

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
        maxLength={255}
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

Dentro de `/src/api.ts`, la función `buy` en `message` se encarga de tomar los datos del formulario y crear un pago en Mercado Pago. Guardamos el mensaje como referencia del pago (`external_reference`, hasta 255 caracteres, por eso el campo tiene `maxLength`) y el id del pago en una cookie para mostrarlo después:

```ts
const api = {
  message: {
    async buy(
      text: Message["text"],
      data: {amount: number; email: string; installments: number; token: string},
    ) {
      // Creamos el pago con los datos del brick
      const payment = await new Payment(mercadopago).create({
        body: {
          payer: {
            email: data.email,
          },
          token: data.token,
          transaction_amount: data.amount,
          installments: data.installments,
          // Guardamos el mensaje como referencia del pago
          external_reference: text,
        },
      });

      // Guardamos el id del pago en una cookie que solo puede leer el servidor
      const cookieStore = await cookies();

      cookieStore.set("payment", String(payment.id), {httpOnly: true});
    },
  },
};
```

> [!NOTE]
> Cuando el usuario hizo submit del formulario, en realidad no pagó, sino que generó un token de pago para posteriormente (una vez que validemos los datos desde el servidor) podamos efectivizar el pago como hacemos ahora.

## Mostrar el último pago

No tenemos una base de datos: Mercado Pago ya guarda cada pago con el mensaje como referencia. Dentro de `/src/api.ts`, la función `last` en `message` lee el id del último pago de la cookie y le pide el pago a Mercado Pago:

```ts
const api = {
  message: {
    async last(): Promise<Message | null> {
      // Leemos de la cookie el id del último pago
      const cookieStore = await cookies();
      const id = cookieStore.get("payment")?.value;

      // Si todavía no pagamos, no hay mensaje
      if (!id) return null;

      // Consultamos el pago en cada visita, su estado puede cambiar
      await connection();

      // Mercado Pago es nuestra base de datos: obtenemos el pago y el mensaje de su referencia
      const payment = await new Payment(mercadopago).get({id});

      return {
        id: payment.id!,
        text: payment.external_reference!,
        status: payment.status!,
        amount: payment.transaction_amount!,
      };
    },
  },
};
```

Así, si el pago se rechaza también lo vemos, con su estado `rejected`.

## Probar la integración

Ahora vamos a nuestra aplicación, cargamos un mensaje, llenamos el formulario con los datos que tenemos en `Tarjetas de prueba` en nuestra aplicación de Mercado Pago y presionamos `Pagar`. Después de unos segundos deberíamos ver nuestro mensaje en `Último pago`, con su estado.

## Consideraciones

Siempre asegurate de validar los montos y estado de los pagos. En una aplicación real no estaría de más [configurar un webhook para recibir notificaciones](../../configuracion/webhook/README.md) sobre los pagos de tu aplicación para tener más control sobre el estado y validez de los pagos. Podés ver un ejemplo de como [recibir notificaciones de un webhook de pago](../checkout-pro/README.md#recibir-notificaciones) en la sección de Checkout Pro.

---

[Volver al inicio](../../README.md)
