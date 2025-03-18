# Clonar la aplicación inicial

Cada uno de los tutoriales sobre integraciones posee una aplicación Next.js con código inicial para que puedas clonarla y empezar a trabajar.

## Índice

1. [Pre-requisitos](#pre-requisitos)
2. [Clonar el repositorio](#clonar-el-repositorio)
3. [Abrir el proyecto en tu editor de código](#abrir-el-proyecto-en-tu-editor-de-código)
4. [Instalar las dependencias](#instalar-las-dependencias)
5. [Correr la aplicación](#correr-la-aplicación)

## Pre-requisitos

Para poder correr el proyecto vamos a necesitar:

- Tener [Git](https://git-scm.com/downloads) instalado.
- Tener [Node.js](https://nodejs.org/en/download/) instalado.
- Tener [algún editor de código instalado](https://code.visualstudio.com/download).

## Clonar el repositorio

Abrimos la terminal y nos paramos en la carpeta donde queremos clonar el repositorio. Y ejecutamos:

```bash
git clone https://github.com/goncy/next-mercadopago.git
```

Una vez clonado el repositorio, accedemos a la carpeta:

```bash
cd next-mercadopago
```

Luego, nos movemos a la carpeta del proyecto que queremos ejecutar. Cada integración posee su propia carpeta:

```bash
# Si queremos implementar Checkout Pro
cd integraciones/checkout-pro

# Si queremos implementar Suscripciones
cd integraciones/suscripciones

# Si queremos implementar Checkout Bricks
cd integraciones/checkout-bricks

# Si queremos implementar Marketplace
cd integraciones/marketplace
```

## Abrir el proyecto en tu editor de código

Ahora vamos a abrir nuestro editor de código y abrir la carpeta del proyecto. Asegurate de abrir la carpeta del proyecto, no el repositorio completo.

## Instalar las dependencias

Ahora vamos a instalar las dependencias ejecutando:

```bash
npm install
```

> [!NOTE]
> Podes usar `pnpm` u otro gestor de paquetes en vez de `npm` para instalar las dependencias si querés.

## Correr la aplicación

Ahora para correr la aplicación ejecutamos:

```bash
npm run dev
```

Si vamos al navegador y accedemos a `http://localhost:3000` deberíamos ver la aplicación funcionando.

> [!NOTE]
> Algunas integraciones como `Checkout Bricks` o `Checkout API` necesitan correr en una conexión segura (HTTPS). Los proyectos ya están configurados usando el flag [`--experimental-https` de Next.js](https://nextjs.org/docs/app/api-reference/cli/next#using-https-during-development). En esos casos recordá ingresar a `https://localhost:3000` en vez de `http://localhost:3000`. También recordalo a la hora de [exponer el puerto](../exponer-puerto/README.md) o cualquier cosa que refiera a localhost.

---

[Volver al inicio](../../README.md)
