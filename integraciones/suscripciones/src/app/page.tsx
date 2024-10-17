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

    revalidatePath("/suscripciones");
  }

  return (
    <div className="grid gap-12">
      {user.suscription ? (
        <form action={add} className="grid gap-4">
          <textarea className="border border-blue-400 p-2" name="message" rows={4} />
          <button className="rounded-md bg-blue-400 px-4 py-2 text-white" type="submit">
            Submit
          </button>
        </form>
      ) : (
        <form action={suscribe} className="grid gap-4">
          <input
            className="border border-blue-400 p-2"
            defaultValue={user.email}
            name="email"
            placeholder="goncy@goncy.com"
            type="email"
          />
          <button className="rounded-md bg-blue-400 px-4 py-2 text-white" type="submit">
            Suscribirse
          </button>
        </form>
      )}
      <ul className="grid gap-4">
        {messages.map((message) => (
          <li key={message.id} className="bg-white/5 p-4">
            <p>{message.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
