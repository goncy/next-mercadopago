import {revalidateTag} from "next/cache";

export async function POST(request: Request) {
  // Obtenemos el cuerpo de la petición que incluye el tipo de notificación
  const body: {data: {id: string}; type: string} = await request.json();

  // Solo nos interesan las notificaciones de suscripciones
  if (body.type === "subscription_preapproval") {
    // Invalidamos el estado de la suscripción para mostrar el contenido actualizado
    revalidateTag(`suscription-${body.data.id}`, {expire: 0});
  }

  // Respondemos con un estado 200 para indicarle que la notificación fue recibida
  return new Response(null, {status: 200});
}
