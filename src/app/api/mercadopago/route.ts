import {Payment, PreApproval} from "mercadopago";
import {revalidatePath} from "next/cache";

import api, {mercadopago} from "@/api";

async function handlePaymentNotification(body: {data: {id: string}}) {
  // Obtenemos el pago
  const payment = await new Payment(mercadopago).get({id: body.data.id});

  // Si se aprueba, agregamos el mensaje
  if (payment.status === "approved") {
    // Obtenemos los datos
    await api.message.add({id: payment.id!, text: payment.metadata.text});

    // Revalidamos la página de inicio para mostrar los datos actualizados
    revalidatePath("/");

    // Respondemos con un estado 200 para indicarle que la notificación fue recibida
    return new Response(null, {status: 200});
  } else {
    // Respondemos con un estado 400 para indicarle que la notificación no fue resuelta
    return new Response(null, {status: 400});
  }
}

async function handlePreapprovalNotification(body: {data: {id: string}}) {
  // Obtenemos la suscripción
  const preapproval = await new PreApproval(mercadopago).get({id: body.data.id});

  // Si se aprueba, actualizamos el usuario con el id de la suscripción
  if (preapproval.status === "authorized") {
    // Actualizamos el usuario con el id de la suscripción
    await api.user.update({suscription: preapproval.id});

    // Respondemos con un estado 200 para indicarle que la notificación fue recibida
    return new Response(null, {status: 200});
  } else {
    // Respondemos con un estado 400 para indicarle que la notificación no fue resuelta
    return new Response(null, {status: 400});
  }
}

export async function POST(request: Request) {
  // Obtenemos el cuerpo de la petición que incluye el tipo de notificación
  const body: {type: string; data: {id: string}} = await request.json();

  // Dependiendo del tipo de notificación, llamamos a la función correspondiente
  if (body.type.startsWith("payment")) {
    return handlePaymentNotification(body);
  } else if (body.type.startsWith("subscription")) {
    return handlePreapprovalNotification(body);
  } else {
    return new Response(null, {status: 400});
  }
}
