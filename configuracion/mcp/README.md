# Configurar el MCP de Mercado Pago

Mercado Pago tiene un [servidor MCP](https://www.mercadopago.com.ar/developers/es/docs/mcp-server/overview) que conecta tu agente de IA con tu cuenta de Mercado Pago. Con el MCP, el agente puede crear aplicaciones, cuentas de prueba, completar tus credenciales y configurar webhooks por vos.

En cada paso que se puede hacer con el MCP vas a encontrar dos opciones: seguir los pasos a mano o copiar un prompt y pegarlo en tu agente.

## Índice

1. [Las dos cuentas](#las-dos-cuentas)
2. [Agregar los servidores](#agregar-los-servidores)
3. [Autorizar tu cuenta principal](#autorizar-tu-cuenta-principal)
4. [Autorizar la cuenta vendedora de prueba](#autorizar-la-cuenta-vendedora-de-prueba)
5. [Lo que el MCP no hace](#lo-que-el-mcp-no-hace)
6. [Probar la conexión](#probar-la-conexión)

## Las dos cuentas

Vas a configurar el MCP dos veces, con la misma URL y una cuenta distinta en cada una:

- `mercadopago-mcp-principal`, con **tu cuenta principal**: crea las aplicaciones productivas, interactúa con tus cuentas de prueba (por ejemplo, para cargarle saldo a la compradora) y completa las credenciales de prueba en tu proyecto. Lo usan todas las integraciones.
- `mercadopago-mcp-vendedor`, con **tu cuenta vendedora de prueba**: crea y configura las aplicaciones del entorno de prueba, como sus webhooks. Solo lo usan las integraciones que lo traen en su `.mcp.json`.

Cada MCP solo puede modificar las aplicaciones de la cuenta con la que lo autorizaste. En Checkout Pro y Suscripciones, las credenciales de prueba que trae el MCP son de una aplicación de la vendedora, así que todo lo que se configura en esa aplicación pasa por `mercadopago-mcp-vendedor`.

La cuenta compradora no necesita un MCP: solo la usás para pagar en el navegador.

## Agregar los servidores

Cada integración ya incluye un archivo `.mcp.json` con los servidores que necesita. Abrí la carpeta de la integración con tu agente y aceptá los servidores cuando te lo pregunte.

Si tu agente no lee `.mcp.json`, agregá esta configuración en el archivo de servidores MCP que use (`mercadopago-mcp-vendedor` solo si la integración lo usa):

```json
{
  "mcpServers": {
    "mercadopago-mcp-principal": {
      "type": "http",
      "url": "https://mcp.mercadopago.com/mcp"
    },
    "mercadopago-mcp-vendedor": {
      "type": "http",
      "url": "https://mcp.mercadopago.com/mcp"
    }
  }
}
```

## Autorizar tu cuenta principal

1. Iniciá la conexión de `mercadopago-mcp-principal` desde la sección de servidores MCP de tu agente.
2. Se abre una página de Mercado Pago. Elegí tu país, iniciá sesión con tu cuenta real (no con una cuenta de prueba) y autorizá la conexión.
3. Volvés a tu agente y el MCP ya está conectado.

## Autorizar la cuenta vendedora de prueba

Hacé este paso cuando el prompt de la integración te lo pida: para ese momento la cuenta vendedora de prueba ya existe.

1. Entrá al [panel de desarrolladores](https://www.mercadopago.com.ar/developers/panel/app) con tu cuenta principal, abrí la aplicación y andá a `Cuentas de prueba`. Copiá el usuario y la contraseña de la cuenta vendedora.
2. Abrí una ventana de incógnito, así no se mezcla con tu sesión principal.
3. Iniciá la conexión de `mercadopago-mcp-vendedor` desde tu agente y abrí el link de autorización en la ventana de incógnito.
4. Iniciá sesión con el usuario y la contraseña de la vendedora y autorizá la conexión.

## Lo que el MCP no hace

Estas limitaciones las encontramos usando el MCP con este repositorio:

- **`create_application` no aplica la URL de redirección.** La recibe, pero responde `Redirect URL Not Applied` y deja `https://www.mercadopago.com`. Para Marketplace la tenés que cargar a mano en `Configuración de la aplicación`, que además pide un captcha.
- **No deja elegir el tipo de API para Checkout Pro.** `api_type` (`orders` o `payments`) solo existe para Checkout API, y las aplicaciones de Checkout Pro que crea el MCP figuran como `integrated API: preferences`. Igual podés crear orders con sus credenciales.
- **`create_test_user` no anda con la vendedora de prueba.** Responde `FORBIDDEN_FOR_TRIAL_ACCOUNTS`: las cuentas de prueba se crean desde tu cuenta principal, en el panel o con `mercadopago-mcp-principal`.
- **El MCP no muestra las contraseñas de las cuentas de prueba.** Están en el panel, en `Cuentas de prueba`, que puede pedirte validar la sesión con un QR desde la app de Mercado Pago.

## Probar la conexión

Pegale este prompt a tu agente:

```text
Usando el MCP de Mercado Pago, listá mis aplicaciones.
```

Si ves tus aplicaciones (o un mensaje de que no tenés ninguna), ya está todo listo. Con `mercadopago-mcp-vendedor` vas a ver las aplicaciones de prueba que creó Mercado Pago, con nombres como `TestApp-525f7625`.

---

[Volver al inicio](../../README.md)
