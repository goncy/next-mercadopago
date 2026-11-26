import {Payment} from "mercadopago";
import {revalidateTag} from "next/cache";

import {mercadopago} from "@/api";

export async function POST(request: Request) {
  // Obtenemos el cuerpo de la petición que incluye información sobre la notificación
  const body: {data?: {id: string}; type?: string} = await request.json();

  // Solo nos interesan las notificaciones de pagos, ignoramos el resto (como las de `merchant_order`)
  if (body.type !== "payment" || !body.data?.id) {
    return new Response(null, {status: 200});
  }

  // Obtenemos el pago
  const payment = await new Payment(mercadopago).get({id: body.data.id});

  // Si se aprueba, invalidamos los mensajes para mostrar el nuevo pago
  if (payment.status === "approved") {
    revalidateTag("messages", {expire: 0});
  }

  // Respondemos con un estado 200 para indicarle que la notificación fue recibida
  return new Response(null, {status: 200});
}
