# Configurar el MCP de Mercado Pago

Mercado Pago tiene un [servidor MCP](https://www.mercadopago.com.ar/developers/es/docs/mcp-server/overview) que conecta tu agente de IA con tu cuenta de Mercado Pago. Con el MCP, el agente puede crear aplicaciones, cuentas de prueba, completar tus credenciales y configurar webhooks por vos.

En cada paso que se puede hacer con el MCP vas a encontrar dos opciones: seguir los pasos a mano o copiar un prompt y pegarlo en tu agente.

## Índice

1. [Agregar el servidor](#agregar-el-servidor)
2. [Autorizar el acceso](#autorizar-el-acceso)
3. [Probar la conexión](#probar-la-conexión)

## Agregar el servidor

Cada integración ya incluye un archivo `.mcp.json` con el servidor de Mercado Pago. Abrí la carpeta de la integración con tu agente y aceptá el servidor cuando te lo pregunte.

Si tu agente no lee `.mcp.json`, agregá esta configuración en el archivo de servidores MCP que use:

```json
{
  "mcpServers": {
    "mercadopago-mcp-server": {
      "type": "http",
      "url": "https://mcp.mercadopago.com/mcp"
    }
  }
}
```

## Autorizar el acceso

1. Iniciá la conexión desde la sección de servidores MCP de tu agente.
2. Se abre una página de Mercado Pago. Elegí tu país y autorizá la conexión.
3. Volvés a tu agente y el MCP ya está conectado.

## Probar la conexión

Pegale este prompt a tu agente:

```text
Usando el MCP de Mercado Pago, listá mis aplicaciones.
```

Si ves tus aplicaciones (o un mensaje de que no tenés ninguna), ya está todo listo.

---

[Volver al inicio](../../README.md)
