# Configurar el MCP de Mercado Pago

Mercado Pago tiene un [servidor MCP](https://www.mercadopago.com.ar/developers/es/docs/mcp-server/overview) que conecta tu agente de IA (Claude Code, Cursor, VS Code, etc.) con tu cuenta de Mercado Pago. Con el MCP, el agente puede crear aplicaciones, cuentas de prueba, completar tus credenciales y configurar webhooks por vos.

En cada paso que se puede hacer con el MCP vas a encontrar dos opciones: seguir los pasos a mano o copiar un prompt y pegarlo en tu agente.

## Índice

1. [Agregar el servidor](#agregar-el-servidor)
2. [Autorizar el acceso](#autorizar-el-acceso)
3. [Probar la conexión](#probar-la-conexión)

## Agregar el servidor

Este repositorio ya incluye el archivo `.mcp.json` en la raíz, así que si abrís el repositorio con Claude Code el servidor aparece solo: aceptalo cuando te lo pregunte.

Para otros agentes, agregá la misma configuración en su archivo:

**Cursor** (`.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "mercadopago-mcp-server": {
      "url": "https://mcp.mercadopago.com/mcp"
    }
  }
}
```

**VS Code** (`.vscode/mcp.json`)

```json
{
  "servers": {
    "mercadopago-mcp-server": {
      "type": "http",
      "url": "https://mcp.mercadopago.com/mcp"
    }
  }
}
```

## Autorizar el acceso

1. Iniciá la conexión desde tu agente: en Claude Code con `/mcp`, en Cursor con `Connect` en `Cursor Settings > Tools & MCP` y en VS Code con `Start` en el archivo `mcp.json`.
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
