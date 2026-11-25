# Configurar el MCP de Mercado Pago

Mercado Pago tiene un [servidor MCP](https://www.mercadopago.com.ar/developers/es/docs/mcp-server/overview) que conecta tu agente de IA con tu cuenta de Mercado Pago. Con el MCP, el agente puede crear aplicaciones, cuentas de prueba, completar tus credenciales y configurar webhooks por vos.

En cada paso que se puede hacer con el MCP vas a encontrar dos opciones: seguir los pasos a mano o copiar un prompt y pegarlo en tu agente.

## Índice

1. [Las dos cuentas](#las-dos-cuentas)
2. [Agregar los servidores](#agregar-los-servidores)
3. [Autorizar tu cuenta principal](#autorizar-tu-cuenta-principal)
4. [Autorizar la cuenta vendedora de prueba](#autorizar-la-cuenta-vendedora-de-prueba)
5. [Probar la conexión](#probar-la-conexión)

## Las dos cuentas

Cuando el MCP crea una aplicación en tu cuenta, Mercado Pago también crea una cuenta vendedora de prueba con su propia aplicación, y una cuenta compradora de prueba. Las credenciales de prueba que te da el MCP son las de la aplicación de la vendedora: los pagos de prueba los cobra ella, y Mercado Pago le manda las notificaciones al webhook de esa aplicación.

El MCP solo puede modificar las aplicaciones de la cuenta con la que lo autorizaste. Por eso usamos dos servidores, con la misma URL y distinta cuenta:

- `mercadopago-mcp-server`, con tu cuenta principal: crea la aplicación, carga saldo a la compradora y completa las credenciales. Lo usan todas las integraciones.
- `mercadopago-vendedor`, con la cuenta vendedora de prueba: configura el webhook en la aplicación de la vendedora. Solo lo usan las integraciones que lo traen en su `.mcp.json`.

La compradora no necesita un MCP: solo la usás para pagar en el navegador.

## Agregar los servidores

Cada integración ya incluye un archivo `.mcp.json` con los servidores que necesita. Abrí la carpeta de la integración con tu agente y aceptá los servidores cuando te lo pregunte.

Si tu agente no lee `.mcp.json`, agregá esta configuración en el archivo de servidores MCP que use (`mercadopago-vendedor` solo si la integración lo usa):

```json
{
  "mcpServers": {
    "mercadopago-mcp-server": {
      "type": "http",
      "url": "https://mcp.mercadopago.com/mcp"
    },
    "mercadopago-vendedor": {
      "type": "http",
      "url": "https://mcp.mercadopago.com/mcp"
    }
  }
}
```

## Autorizar tu cuenta principal

1. Iniciá la conexión de `mercadopago-mcp-server` desde la sección de servidores MCP de tu agente.
2. Se abre una página de Mercado Pago. Elegí tu país, iniciá sesión con tu cuenta real (no con una cuenta de prueba) y autorizá la conexión.
3. Volvés a tu agente y el MCP ya está conectado.

## Autorizar la cuenta vendedora de prueba

La cuenta vendedora de prueba existe recién cuando creaste tu primera aplicación con el MCP, así que hacé este paso cuando el prompt de la integración te lo pida.

1. Entrá al [panel de desarrolladores](https://www.mercadopago.com.ar/developers/panel/app) con tu cuenta principal, abrí la aplicación y andá a `Cuentas de prueba`. Copiá el usuario y la contraseña de la cuenta vendedora.
2. Abrí una ventana de incógnito, así no se mezcla con tu sesión principal.
3. Iniciá la conexión de `mercadopago-vendedor` desde tu agente y abrí el link de autorización en la ventana de incógnito.
4. Iniciá sesión con el usuario y la contraseña de la vendedora y autorizá la conexión.

## Probar la conexión

Pegale este prompt a tu agente:

```text
Usando el MCP de Mercado Pago, listá mis aplicaciones.
```

Si ves tus aplicaciones (o un mensaje de que no tenés ninguna), ya está todo listo. Con `mercadopago-vendedor` vas a ver las aplicaciones de prueba que creó Mercado Pago, con nombres como `TestApp-525f7625`.

---

[Volver al inicio](../../README.md)
