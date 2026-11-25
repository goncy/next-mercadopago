import {redirect} from "next/navigation";

import api from "@/api";

export default async function SuscripcionesPage() {
  // Verificamos si el usuario tiene una suscripción activa
  const active = await api.suscription.active();

  // Si está suscrito, mostramos el contenido exclusivo
  if (active) {
    return (
      <article className="grid gap-3">
        <h2>Contenido exclusivo</h2>
        <p>Gracias por suscribirte. Este contenido solo lo pueden ver los suscriptores.</p>
      </article>
    );
  }

  async function suscribe(formData: FormData) {
    "use server";

    const email = formData.get("email");
    const url = await api.suscription.create(email as string);

    redirect(url);
  }

  // Si no está suscrito, mostramos el formulario para suscribirse
  return (
    <form action={suscribe} className="sm:grid-cols-[1fr_auto]">
      <input name="email" placeholder="goncy@goncy.com" type="email" />
      <button className="justify-self-stretch" type="submit">
        Suscribirse
      </button>
    </form>
  );
}
