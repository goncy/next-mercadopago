import {type NextRequest, NextResponse} from "next/server";

import api from "@/api";

// Mercado Pago redirige al comprador acá cuando el pago se aprueba, con el id del pago en `order_id`
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("order_id");

  if (id) {
    await api.payment.verify(id);
  }

  // Volvemos a la página de inicio, que ya muestra el mensaje nuevo
  return NextResponse.redirect(process.env.APP_URL!);
}

// Mercado Pago nos envía acá las notificaciones del webhook que configuramos en el panel
export async function POST(request: Request) {
  // Obtenemos el cuerpo de la petición que incluye información sobre la notificación
  const body: {data?: {id: string}; type?: string} = await request.json();

  // Solo nos interesan las notificaciones de pagos (`order`), ignoramos el resto
  if (body.type === "order" && body.data?.id) {
    await api.payment.verify(body.data.id);
  }

  // Respondemos con un estado 200 para indicarle que la notificación fue recibida
  return new Response(null, {status: 200});
}
