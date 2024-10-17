# Exponer puerto

En Mercado Pago no todos los medios de pago son "síncronos", por ende, es necesario configurar una URL de nuestra aplicación a la cual Mercado Pago nos notifique cuando un pago haya sido aprobado / rechazado / anulado / etc.

Como Mercado Pago no sabe que es `localhost:3000` (ni tampoco lo que es nuestro equipo local), vamos a tener que exponer el puerto donde corre nuestra aplicación en nuestro equipo local, a internet.

Una vez que tengamos la URL, independientemente de la herramienta que usemos para exponer nuestro puerto, vamos a agregarla a nuestro `.env.local` como `APP_URL`.

## Índice

- [Cloudflared Tunnel](#cloudflared-tunnel)
- [VSCode Dev Tunnels](#vscode-dev-tunnels)
- [Probando el link](#probando-el-link)

## Cloudflared Tunnel

Podemos instalar [Cloudflared Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/create-local-tunnel/#1-download-and-install-cloudflared) y usarlo para exponer nuestro puerto. Simplemente [descargá el binario correspondiente a tu sistema operativo](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) y corré el siguiente comando:

```bash
cloudflared tunnel --url http://localhost:3000
```

> [!NOTE]
> Asegurate de cerrar y abrir la terminal en caso de que no te reconozca el comando.

## VSCode Dev Tunnels

Yo estoy usando VSCode, por ende voy a usar `Dev Tunnels` para exponer el puerto. Si nos dirigimos a la sección de `Ports` y hacemos click en `Forward a Port`, podemos elegir un puerto (nuestra aplicación corre en el 3000) y nos dará una URL. Asegurate de cambiar la visibilidad de la URL a `Public` para que Mercado Pago pueda acceder a ella.

![image](./screenshots/port-forward.jpg)

> [!NOTE]
> Si no ves la sección de `Ports` en VSCode, presiona `ctrl + shift + p` (o `cmd + shift + p` en Mac) y busca `Forward a Port` (o en español asumo debe ser `Exponer un puerto`) y te mostrará la sección.

## Probando el link

Si corremos nuestra aplicación con `npm run dev` (habiendo hecho `npm install` previamente) y luego entramos a la URL que obtuvimos, deberíamos ver nuestra aplicación corriendo. Para asegurarte de que es pública, intentá de acceder con tu celular sin conectarte a la misma red wifi.

---

[Volver al inicio](../../README.md)
