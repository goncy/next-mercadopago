import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";

import api from "@/api";

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

    revalidatePath("/");
  }

  return (
    <div className="grid gap-8">
      {user.suscription ? (
        <form action={add}>
          <textarea name="message" rows={4} />
          <button type="submit">Submit</button>
        </form>
      ) : (
        <form action={suscribe}>
          <input
            defaultValue={user.email}
            name="email"
            placeholder="goncy@goncy.com"
            type="email"
          />
          <button type="submit">Suscribirse</button>
        </form>
      )}
      <ul>
        {messages.map((message) => (
          <li key={message.id}>
            <p>{message.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
