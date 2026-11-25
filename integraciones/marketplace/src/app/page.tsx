import {redirect} from "next/navigation";

import api from "@/api";

// Queremos que esta página sea estática, invalidamos el usuario y los mensajes cuando cambian
export const ensureStatic = "navigation";

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
    // Obtenemos el usuario en el servidor para no exponer su access token en el formulario
    const {marketplace} = await api.user.fetch();
    const url = await api.message.submit(message, marketplace!);

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
      <section className="grid gap-3">
        <h2>Mensajes</h2>
        <ul>
          {messages.map((message) => (
            <li key={message.id}>{message.text}</li>
          ))}
        </ul>
      </section>
    </section>
  );
}
