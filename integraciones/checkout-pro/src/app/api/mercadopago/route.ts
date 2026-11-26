import {Order} from "mercadopago";
import {revalidateTag} from "next/cache";
import {type NextRequest, NextResponse} from "next/server";

import {mercadopago} from "@/api";

async function verify(id: string) {
  // Obtenemos la order desde Mercado Pago para no confiar en lo que nos llega en la petición
  const order = await new Order(mercadopago).get({id});

  // Si se procesó (el pago se aprobó), invalidamos los mensajes para mostrar el nuevo mensaje
  if (order.status === "processed") {
    revalidateTag("messages", {expire: 0});
  }
}

// Mercado Pago redirige al comprador acá cuando el pago se aprueba, con el id de la order en `order_id`
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("order_id");

  if (id) {
    await verify(id);
  }

  // Volvemos a la página de inicio, que ya muestra el mensaje nuevo
  return NextResponse.redirect(process.env.APP_URL!);
}

// Mercado Pago nos envía acá las notificaciones del webhook que configuramos en el panel
export async function POST(request: Request) {
  // Obtenemos el cuerpo de la petición que incluye información sobre la notificación
  const body: {data?: {id: string}; type?: string} = await request.json();

  // Solo nos interesan las notificaciones de orders, ignoramos el resto
  if (body.type === "order" && body.data?.id) {
    await verify(body.data.id);
  }

  // Respondemos con un estado 200 para indicarle que la notificación fue recibida
  return new Response(null, {status: 200});
}
