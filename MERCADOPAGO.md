# Mercado Pago module
Instructions on how to setup Mercado Pago on the app.

## 1. Create the Mercado Pago project
[Create a new Mercado Pago integration](https://www.mercadopago.com.ar/developers/panel/app) and copy the `Access Token` to the `.env.local` file:

```bash
MP_ACCESS_TOKEN=
```

## 2. Install Mercado Pago dependencies
Install the Mercado Pago dependency:

```bash
pnpm add mercadopago
```

## 3. Create a preference
From the server, you can create a preference (a description of something you want to sell), using the `@/payment/api` helper:

```ts
import {redirect} from "next/navigation";

import api from "@/payment/api";

function createTicket(title: string, amount: number) {
  const initPoint = await api.preference({
    items: [
      {
        id: "some-ticket",
        title,
        quantity: 1,
        unit_price: amount,
      },
    ],
  });

  redirect(initPoint);
}
```

## 4. Verify payments
Head to your Mercado Pago integration and in the `Webhooks` section, set the URL to be `https://your-app.com/payment` and select `Payments` on events.

> You can use [`cloudflared`](https://github.com/cloudflare/cloudflared) (cloudflared --url localhost:3000) to test the webhook locally. Your webhook URL will be `https://your-cloudflared-url.com/payment`.

Then, create a `app/payment/route.ts` file with the following content:

```ts
import type {NextRequest} from "next/server";

import api from "@/payment/api";

export async function POST(request: NextRequest) {
  const body = await request.json().then((data) => data as {data: {id: string}});

  await api.validate(body.data.id);

  return Response.json({success: true});
}
```
> This route will receive payment notifications from Mercado Pago and validate that the payment exists. In production you should include a validation with the `secret` provided when creating the webhook.
