# Integración de Mercado Pago con Checkout Bricks

En este documento vamos a aprender a agregar pagos a nuestra aplicación utilizando Mercado Pago Checkout Bricks. Los usuarios van a poder agregar mensajes a una lista de mensajes pagando por cada mensaje.

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
4. [Probar la integración](#probar-la-integración)
5. [Consideraciones](#consideraciones)

## Revisando nuestra aplicación

En la página de inicio de nuestra aplicación (`/src/app/page.tsx`) se renderiza un formulario llamado `MessageForm` que incluye un campo para escribir el mensaje y un formulario de Mercado Pago para realizar el pago. Al hacer submit de este formulario, se ejecuta un Server Action que recibe el mensaje y la información del pago y crea el pago con el mensaje en su `metadata`:

```tsx
import MessageForm from "./message-form";

import api from "@/api";

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
> Como la lista lee una cookie, la página se renderiza en cada visita (`instant = false`). Cuando el Server Action guarda la cookie, Next.js vuelve a renderizar la página y el mensaje nuevo aparece al instante.

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

Dentro de `/src/api.ts`, la función `buy` en `message` se encarga de tomar los datos del formulario y crear un pago en Mercado Pago. Si el pago se aprueba, guardamos su id en una cookie para mostrar el mensaje en la lista:

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
          // Guardamos el texto en la metadata para mostrarlo después
          metadata: {text},
        },
      });

      // Si el pago no se aprobó, no guardamos el mensaje
      if (payment.status !== "approved") return;

      // Guardamos el id del pago en una cookie que solo puede leer el servidor
      const cookieStore = await cookies();
      const ids: number[] = JSON.parse(cookieStore.get("messages")?.value ?? "[]");

      cookieStore.set("messages", JSON.stringify([...ids, payment.id]), {httpOnly: true});
    },
  },
};
```

> [!NOTE]
> Cuando el usuario hizo submit del formulario, en realidad no pagó, sino que generó un token de pago para posteriormente (una vez que validemos los datos desde el servidor) podamos efectivizar el pago como hacemos ahora.

## Listar los mensajes

No tenemos una base de datos: Mercado Pago ya guarda cada pago con el texto en su `metadata`. Dentro de `/src/api.ts`, la función `list` en `message` lee de la cookie los ids de los pagos aprobados, y `get` obtiene cada pago y devuelve su texto:

```ts
const api = {
  message: {
    async list(): Promise<Message[]> {
      // Leemos de la cookie los ids de los pagos aprobados
      const cookieStore = await cookies();
      const ids: number[] = JSON.parse(cookieStore.get("messages")?.value ?? "[]");

      // Obtenemos el mensaje de cada pago
      return Promise.all(ids.map((id) => api.message.get(id)));
    },
    async get(id: Message["id"]): Promise<Message> {
      // Cacheamos el mensaje, un pago aprobado no cambia
      "use cache";

      cacheLife("max");

      // Mercado Pago es nuestra base de datos: obtenemos el pago y devolvemos el texto de su `metadata`
      const payment = await new Payment(mercadopago).get({id});

      return {id: payment.id!, text: payment.metadata.text};
    },
  },
};
```

Como guardamos los ids en una cookie, cada visitante ve los mensajes que pagó desde su navegador.

## Probar la integración

Ahora vamos a nuestra aplicación, cargamos un mensaje, llenamos el formulario con los datos que tenemos en `Tarjetas de prueba` en nuestra aplicación de Mercado Pago y presionamos `Pagar`. Después de unos segundos deberíamos ver la página actualizada con nuestro nuevo mensaje.

## Consideraciones

Siempre asegurate de validar los montos y estado de los pagos. En una aplicación real no estaría de más [configurar un webhook para recibir notificaciones](../../configuracion/webhook/README.md) sobre los pagos de tu aplicación para tener más control sobre el estado y validez de los pagos. Podés ver un ejemplo de como [recibir notificaciones de un webhook de pago](../checkout-pro/README.md#recibir-notificaciones) en la sección de Checkout Pro.

---

[Volver al inicio](../../README.md)
