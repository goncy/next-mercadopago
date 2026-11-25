import {MercadoPagoConfig, PreApproval} from "mercadopago";
import {cacheLife, cacheTag} from "next/cache";
import {cookies} from "next/headers";

export const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

const api = {
  suscription: {
    async create(email: string) {
      // Creamos una suscripción sin plan asociado y con pago pendiente
      const suscription = await new PreApproval(mercadopago).create({
        body: {
          back_url: process.env.APP_URL!,
          reason: "Suscripción a contenido exclusivo",
          auto_recurring: {
            frequency: 1,
            frequency_type: "months",
            transaction_amount: 100,
            currency_id: "ARS",
          },
          payer_email: email,
          status: "pending",
        },
      });

      // Guardamos el id de la suscripción en una cookie para saber de quién es
      const cookieStore = await cookies();

      cookieStore.set("suscription", suscription.id!, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      // Devolvemos el init point (url de pago) para que el usuario pueda pagar
      return suscription.init_point!;
    },
    async active() {
      // Leemos el id de la suscripción de la cookie
      const cookieStore = await cookies();
      const id = cookieStore.get("suscription")?.value;

      // Si no hay suscripción, no está activa
      if (!id) return false;

      // Mercado Pago es nuestra base de datos: le preguntamos el estado de la suscripción
      return (await api.suscription.status(id)) === "authorized";
    },
    async status(id: string) {
      // Cacheamos el estado hasta que el webhook nos avise que cambió
      "use cache";

      cacheLife("max");
      cacheTag(`suscription-${id}`);

      const suscription = await new PreApproval(mercadopago).get({id});

      return suscription.status;
    },
  },
};

export default api;
