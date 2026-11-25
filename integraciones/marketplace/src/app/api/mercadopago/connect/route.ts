import {NextRequest, NextResponse} from "next/server";

import api from "@/api";

export async function GET(request: NextRequest) {
  // Obtenemos el code de la request
  const code = request.nextUrl.searchParams.get("code");

  // Conectamos al usuario con el code y guardamos su access token en una cookie
  await api.user.connect(code!);

  // Redirigimos al usuario a la página del marketplace
  return NextResponse.redirect(process.env.APP_URL!);
}
