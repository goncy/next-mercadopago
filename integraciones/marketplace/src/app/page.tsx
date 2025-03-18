import {redirect} from "next/navigation";

import api from "@/api";

// Queremos que esta página sea dinámica para saber el estado del marketplace
export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  // Obtenemos el usuario y los mensajes
  const user = await api.user.fetch();
  const messages = await api.message.list();

  // Obtenemos la URL de autorización
  const authorizationUrl = await api.user.authorize();

  // Creamos una preferencia de pago y redirigimos al usuario a Mercado Pago
  async function add(formData: FormData) {
    "use server";

    const message = formData.get("text") as string;
    const url = await api.message.submit(message, user.marketplace!);

    redirect(url);
  }

  return (
    <section className="grid gap-8">
      {/* Si el usuario ya autorizó la integración, mostramos el formulario */}
      {user.marketplace ? (
        <form action={add}>
          <textarea name="text" placeholder="Hola perro" rows={3} />
          <button type="submit">Enviar</button>
        </form>
      ) : (
        // Si no autorizó la integración, mostramos un botón para redirigirlo a Mercado Pago a autorizar
        <a href={authorizationUrl}>Conectar Mercado Pago</a>
      )}
      <ul>
        {messages.map((message) => (
          <li key={message.id}>{message.text}</li>
        ))}
      </ul>
    </section>
  );
}
