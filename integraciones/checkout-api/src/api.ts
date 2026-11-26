import {MercadoPagoConfig, Payment} from "mercadopago";
import {cookies} from "next/headers";
import {connection} from "next/server";

export const mercadopago = new MercadoPagoConfig({accessToken: process.env.MP_ACCESS_TOKEN!});

const api = {
  message: {
    async last() {
      // Leemos de la cookie el id del último pago
      const cookieStore = await cookies();
      const id = cookieStore.get("payment")?.value;

      // Si todavía no pagamos, no hay nada para mostrar
      if (!id) return null;

      // Consultamos el pago en cada visita, su estado puede cambiar
      await connection();

      // Mercado Pago es nuestra base de datos: obtenemos el pago
      return new Payment(mercadopago).get({id});
    },
    async buy(
      text: string,
      data: {amount: number; email: string; installments: number; token: string},
    ) {
      // Creamos el pago con los datos del formulario
      const payment = await new Payment(mercadopago).create({
        body: {
          payer: {
            email: data.email,
          },
          token: data.token,
          transaction_amount: data.amount,
          installments: data.installments,
          // Guardamos el mensaje como referencia del pago
          external_reference: text,
        },
      });

      // Guardamos el id del pago en una cookie que solo puede leer el servidor
      const cookieStore = await cookies();

      cookieStore.set("payment", String(payment.id), {httpOnly: true});
    },
  },
};

export default api;
