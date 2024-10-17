# Integración de Mercado Pago en Next.js

En este respositorio vamos a aprender a integrar Mercado Pago en una aplicación de comentarios utilizando Next.js con App Router. El fin de la aplicación es poder agregar mensajes a una lista de mensajes.

## Índice

Vamos a tener diferentes carpetas y aplicaciones para cada tipo de integración, así mantenemos el código simple y podemos enfocarnos en lo que nos interesa.

1. Integraciones
    1. [Checkout Pro](./integraciones/checkout-pro/README.md): Los usuarios van a tener que pagar para poder agregar un mensaje a la lista. Usamos [Checkout Pro](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/landing) para crear una preferencia de pago y redirigir al usuario a Mercado Pago para que pueda pagar. Configuramos un webhook para recibir notificaciones del pago y verificar la autenticidad de la notificación.
    2. [Suscripciones](./integraciones/suscripciones/README.md): Los usuarios van a tener que suscribirse para poder agregar un mensaje a la lista. Usamos [Suscripciones sin plan asociado con pago pendiente](https://www.mercadopago.com.ar/developers/es/docs/subscriptions/integration-configuration/subscription-no-associated-plan/pending-payments). Configuramos un webhook para recibir notificaciones de suscripción y verificar la autenticidad de la notificación.
    3. [Checkout Bricks](./integraciones/checkout-bricks/README.md): Los usuarios van a tener que pagar para poder agregar un mensaje a la lista. Usamos [Checkout Bricks](https://www.mercadopago.com.ar/developers/es/docs/checkout-bricks/landing) para tomar los datos de pago dentro de nuestra aplicación.
    4. [Marketplace](./integraciones/marketplace/README.md): Vamos a ser el intermediario entre un usuario de nuestra aplicación que quiere recibir mensajes en su muro y un usuario que quiere pagar para escribir en ese muro. Vamos a usar Checkout Pro con la integración de [Marketplace](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/how-tos/integrate-marketplace) para quedarnos con una ganancia por cada mensaje.
2. Configuración
    1. [Crear una aplicación en Mercado Pago](./configuracion/crear-aplicacion/README.md): Como entrar al panel de desarrolladores de Mercado Pago y crear una aplicación.
    2. [Cuentas de prueba](./configuracion/cuentas-de-prueba/README.md): Como crear cuentas de prueba y usar tarjetas de prueba.
    3. [Credenciales](./configuracion/credenciales/README.md): Que son y que tipo de credenciales existen, cuando y como usarlas.
    4. [Exponer un puerto públicamente](./configuracion/exponer-puerto/README.md): Como hacer que Mercado Pago se pueda comunicar con nuestra aplicación mientras corre en local, muy útil para recibir notificaciones de pago y suscripciones durante el desarrollo.
    5. [Recibir notificaciones de pago y suscripciones](./configuracion/webhook/README.md): Como configurar un webhook en nuestra aplicación para recibir notificaciones de pago y suscripciones.

---

Si te gusta mi contenido, seguime en [Twitter](https://twitter.gonzalopozzo.com), en [Twitch](https://twitch.gonzalopozzo.com), en [YouTube](https://youtube.gonzalopozzo.com), doname un [Cafecito](https://cafecito.gonzalopozzo.com) o volvete [sponsor en github](https://github.com/sponsors/goncy) ✨
