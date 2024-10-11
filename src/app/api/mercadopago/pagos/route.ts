import api from "@/api";

export async function POST(req: Request) {
  // Obtenemos el cuerpo de la petición que incluye el id del pago
  const body: {data: {id: string}} = await req.json();

  // Enviamos el id del pago para obtener los datos y agregar el mensaje
  await api.message.add(body.data.id);

  // Respondemos con un estado 200 para indicarle que la notificación fue recibida
  return new Response(null, {status: 200});
}
