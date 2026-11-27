import {redirect} from "next/navigation";

import api from "@/api";

export default async function MarketplacePage() {
  // Obtenemos el access token del vendedor
  const marketplace = await api.user.token();

  // Si no autorizó la integración, mostramos un botón para redirigirlo a Mercado Pago a autorizar
  if (!marketplace) {
    const authorizationUrl = await api.user.authorize();

    return <a href={authorizationUrl}>Conectar Mercado Pago</a>;
  }

  // Obtenemos los mensajes del vendedor
  const messages = await api.message.list(marketplace);

  // Creamos el pago y redirigimos al usuario a Mercado Pago
  async function add(formData: FormData) {
    "use server";

    const message = formData.get("text") as string;
    // Leemos el access token en el servidor para no exponerlo en el formulario
    const marketplace = await api.user.token();
    const url = await api.message.submit(message, marketplace!);

    redirect(url);
  }

  return (
    <section className="grid gap-8">
      <form action={add}>
        <textarea maxLength={150} name="text" placeholder="Hola perro" rows={3} />
        <button type="submit">Enviar</button>
      </form>
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
