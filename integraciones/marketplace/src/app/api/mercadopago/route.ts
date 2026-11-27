import {MercadoPagoConfig, Order} from "mercadopago";
import {revalidateTag} from "next/cache";
import {type NextRequest, NextResponse} from "next/server";

import api from "@/api";

// Mercado Pago redirige al comprador acá cuando el pago se aprueba, con el id del pago en `order_id`
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("order_id");
  // El pago es del vendedor, así que lo obtenemos con su access token
  const marketplace = await api.user.token();

  if (id && marketplace) {
    // Obtenemos el pago desde Mercado Pago para no confiar en lo que nos llega en la URL
    const order = await new Order(new MercadoPagoConfig({accessToken: marketplace})).get({id});

    // Si se procesó (el pago se aprobó), invalidamos los mensajes para mostrar el nuevo mensaje
    if (order.status === "processed") {
      revalidateTag("messages", {expire: 0});
    }
  }

  // Volvemos a la página del marketplace, que ya muestra el mensaje nuevo
  return NextResponse.redirect(process.env.APP_URL!);
}

// Mercado Pago nos envía acá las notificaciones del webhook que configuramos en el panel
export async function POST(request: Request) {
  // Obtenemos el cuerpo de la petición que incluye información sobre la notificación
  const body: {data?: {id: string}; type?: string} = await request.json();

  // El pago es del vendedor y acá no tenemos su access token, así que no lo podemos obtener. Invalidamos los mensajes y la lista los vuelve a buscar en Mercado Pago con el token del vendedor, que solo devuelve los pagos procesados
  if (body.type === "order" && body.data?.id) {
    revalidateTag("messages", {expire: 0});
  }

  // Respondemos con un estado 200 para indicarle que la notificación fue recibida
  return new Response(null, {status: 200});
}
