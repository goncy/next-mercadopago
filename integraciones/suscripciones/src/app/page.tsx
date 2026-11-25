import {updateTag} from "next/cache";
import {redirect} from "next/navigation";

import api from "@/api";

// Queremos que esta página sea estática, invalidamos el usuario y los mensajes cuando cambian
export const ensureStatic = "navigation";

export default async function SuscripcionesPage() {
  const messages = await api.message.list();
  const user = await api.user.fetch();

  async function suscribe(formData: FormData) {
    "use server";

    const email = formData.get("email");
    const url = await api.user.suscribe(email as string);

    redirect(url);
  }

  async function add(formData: FormData) {
    "use server";

    const message = formData.get("message");

    await api.message.add(message as string);

    updateTag("messages");
  }

  return (
    <section className="grid gap-8">
      {user.suscription ? (
        <form action={add}>
          <textarea name="message" placeholder="Hola perro" rows={3} />
          <button type="submit">Enviar</button>
        </form>
      ) : (
        <form action={suscribe} className="sm:grid-cols-[1fr_auto]">
          <input
            defaultValue={user.email}
            name="email"
            placeholder="goncy@goncy.com"
            type="email"
          />
          <button className="justify-self-stretch" type="submit">
            Suscribirse
          </button>
        </form>
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
