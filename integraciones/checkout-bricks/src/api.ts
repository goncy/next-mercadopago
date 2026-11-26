import {MercadoPagoConfig, Payment} from "mercadopago";
import {cacheLife} from "next/cache";
import {cookies} from "next/headers";

interface Message {
  id: number;
  text: string;
}

export const mercadopago = new MercadoPagoConfig({accessToken: process.env.MP_ACCESS_TOKEN!});

const api = {
  message: {
    async list(): Promise<Message[]> {
      // Leemos de la cookie los ids de los pagos aprobados
      const cookieStore = await cookies();
      const ids: number[] = JSON.parse(cookieStore.get("messages")?.value ?? "[]");

      // Obtenemos el mensaje de cada pago
      return Promise.all(ids.map((id) => api.message.get(id)));
    },
    async get(id: Message["id"]): Promise<Message> {
      // Cacheamos el mensaje, un pago aprobado no cambia
      "use cache";

      cacheLife("max");

      // Mercado Pago es nuestra base de datos: obtenemos el pago y devolvemos el texto de su `metadata`
      const payment = await new Payment(mercadopago).get({id});

      return {id: payment.id!, text: payment.metadata.text};
    },
    async buy(
      text: Message["text"],
      data: {amount: number; email: string; installments: number; token: string},
    ) {
      // Creamos el pago con los datos del brick
      const payment = await new Payment(mercadopago).create({
        body: {
          payer: {
            email: data.email,
          },
          token: data.token,
          transaction_amount: data.amount,
          installments: data.installments,
          // Guardamos el texto en la metadata para mostrarlo después
          metadata: {text},
        },
      });

      // Si el pago no se aprobó, no guardamos el mensaje
      if (payment.status !== "approved") return;

      // Guardamos el id del pago en una cookie que solo puede leer el servidor
      const cookieStore = await cookies();
      const ids: number[] = JSON.parse(cookieStore.get("messages")?.value ?? "[]");

      cookieStore.set("messages", JSON.stringify([...ids, payment.id]), {httpOnly: true});
    },
  },
};

export default api;
