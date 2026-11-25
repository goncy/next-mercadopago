import {revalidateTag} from "next/cache";
import {NextRequest, NextResponse} from "next/server";

import api from "@/api";

export async function GET(request: NextRequest) {
  // Obtenemos el code de la request
  const code = request.nextUrl.searchParams.get("code");

  // Conectamos al usuario con el code y obtenemos las credenciales
  const credentials = await api.user.connect(code!);

  // Actualizamos las credenciales del usuario
  await api.user.update({marketplace: credentials.access_token});

  // Invalidamos el usuario para mostrar el formulario de mensajes
  revalidateTag("user", {expire: 0});

  // Redirigimos al usuario a la página del marketplace
  return NextResponse.redirect(process.env.APP_URL!);
}
