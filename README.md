# Digital Fest — figuras desde imágenes

Referencias generadas con la herramienta integrada de imágenes el 11 de noviembre de 2026:

- `references/caballero-oscuro.png`: jefe oscuro original de armadura de hierro y detalles de bronce.
- `references/robot-programador.png`: robot de programación con símbolo de código.
- `references/torre-backend.png`: torre de servidores que representa backend, arquitectura y bases de datos.

Los tres modelos GLB finales, con texturas integradas, están en `textured/`. La geometría se generó con Hunyuan3D 2 Mini y el texturizado con Hunyuan3D Paint Turbo, ambos mediante el MCP de Modly. `models/` conserva las versiones anteriores sin texturas.

## Entregables — 12 de noviembre de 2026

- `textured/caballero-oscuro.glb`: 2.842.908 bytes, 50.000 triángulos.
- `textured/robot-programador.glb`: 2.604.552 bytes, 50.000 triángulos.
- `textured/torre-backend.glb`: 2.471.868 bytes, 50.000 triángulos.

Cada GLB es autocontenido: incluye geometría, normales, coordenadas UV y un atlas de color de 1024 × 1024 px. Usa material PBR con valores uniformes de metal y rugosidad; no incluye mapas independientes de normal, emisión, metal o rugosidad. Los detalles cian y naranja forman parte del color y no emiten luz por sí solos.

Los modelos están centrados horizontalmente, con la base en Y=0 y altura de un metro según glTF. El texturizado mantiene los 50.000 triángulos de cada malla; las costuras UV duplican algunos vértices. Las vistas PNG muestran el GLB real desde el frente, a 40 grados y desde atrás, con su textura aplicada. No son ilustraciones de referencia.

`originals/` conserva las salidas de geometría y `originals/textured/` las salidas de Paint. La optimización de geometría se hizo con PyMeshLab. `../../tools/prepare_textured.py` prepara y renderiza los GLB finales, y `../../tools/validate_textured.py` verifica tamaño, UV, textura embebida y correspondencia con la geometría original.

Parámetros de generación: 30 pasos, resolución octree 256, guidance 5.5, remesh none; semillas 411, 412 y 413, respectivamente.

Trabajos MCP:
- Caballero: `ae4e9ebc-c06a-43ee-970e-fb9a36f5aaab`. Archivo recuperado de `Default/1794419190_02664ead.glb` tras reiniciar Modly; el historial temporal del trabajo ya no estaba disponible. Identidad confirmada por inspección visual de la geometría.
- Robot: `af927cd0-6d58-4c38-b479-8b8446f8f078`, terminado correctamente.
- Torre: `2cc276f3-7dfb-403a-b218-2d28a34c4453`, terminado correctamente.

El MCP `modly-cli-mcp` está instalado globalmente, registrado como `modly` en Codex y conectado al chat. El cliente de diagnóstico `../../tools/modly-mcp-client.mjs` también permite llamar su protocolo stdio desde el terminal. La consulta `modly.health` respondió correctamente.

Trabajos MCP de texturizado, todos terminados correctamente:
- Caballero: `d9c8791e-0a78-47b5-8df7-0e568cfa7afe`.
- Robot: `d46b1dfc-3ad8-4757-87dd-eb8ab4dae3e1`.
- Torre: `2e4cf6cf-a55a-4c9d-b46a-94269c3e8c18`.

El paquete `digital-fest-texturizados.zip` contiene los tres GLB finales, sus vistas y el manifiesto de validación. Los tres pesan menos de 5 MB cada uno. La creación y el texturizado de las figuras están completos.

La app WebAR está implementada en `webar/` y empaquetada en `digital-fest-webar.zip`: cámara, selector de modelos, giro, tamaño, foto compuesta, descarga y compartir. Incluye instrucciones y workflow de GitHub Pages. Se probó en navegador con cámara simulada; queda la prueba en un celular real y publicar el repositorio. Consulta `webar/README.md`.
