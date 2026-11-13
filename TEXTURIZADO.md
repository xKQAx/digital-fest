# Texturizado completado — 12 de noviembre de 2026

Los tres modelos finales están en `textured/`, con atlas de color de 1024 × 1024 integrado en cada GLB. Se generaron con Hunyuan3D Paint Turbo mediante el MCP de Modly, usando las imágenes originales y las mallas optimizadas. Se revisaron frente, lateral y espalda.

- Caballero: 2.842.908 bytes; trabajo `d9c8791e-0a78-47b5-8df7-0e568cfa7afe`.
- Robot: 2.604.552 bytes; trabajo `d46b1dfc-3ad8-4757-87dd-eb8ab4dae3e1`.
- Torre: 2.471.868 bytes; trabajo `2e4cf6cf-a55a-4c9d-b46a-94269c3e8c18`.

Cada archivo mantiene 50.000 triángulos, incluye normales y UV, mide un metro de alto y apoya en Y=0. El material PBR utiliza el atlas de color y factores uniformes de metal/rugosidad; no se generaron mapas independientes de normal o emisión.

## Entorno reproducible

- Extensión Lorchie/modly-hunyuan3d-paint-extension 1.0.0, commit `24dfc7ee55297e1b4f0a336363c8927fa275eb50`.
- Código oficial Tencent/Hunyuan3D-2 en `extensions/hunyuan3d-paint/vendor`, commit `f8db63096c8282cb27354314d896feba5ba6ff8a`.
- Pesos Tencent/Hunyuan3D-2, revisión `9cd649ba6913f7a852e3286bad86bfa9a2d83dcf`.
- PyTorch 2.7.0+cu128, Diffusers 0.39.0, Transformers 4.53.3, huggingface_hub 0.36.2.
- GPU: NVIDIA GeForce RTX 5070 Ti Laptop, 12 GB de VRAM.

## Correcciones locales necesarias

1. Priorizar el código oficial de hy3dgen: el wheel de la extensión no admite el argumento `subfolder` de Paint Turbo.
2. Importar torch antes de comprobar el rasterizador para registrar sus DLL en Windows.
3. Cargar el pipeline personalizado local con `trust_remote_code=True` y `local_files_only=True`.
4. Usar el checkpoint UNet `.bin` esperado por el pipeline. El `.safetensors` publicado contiene capas IP-adapter adicionales y NO es intercambiable. Se corrigió el script de descarga después de verificar esta diferencia.
5. Crear el UNet en el dispositivo `meta` y cargar sus pesos mediante `mmap=True`, `weights_only=True`, `assign=True`, manteniendo la comprobación estricta de claves. Esto reduce el pico de RAM.
6. Activar el procesamiento por partes del VAE para limitar VRAM.
7. Usar la implementación CPU nativa del mismo rasterizador, transfiriendo después sus resultados a CUDA. El wheel CUDA produjo `no kernel image is available` en SM120 a resolución real. Sus errores se reportaban después en atención y dieron una pista engañosa. Las modificaciones experimentales de atención se retiraron: la generación final usa atención normal de PyTorch.
8. Conservar la transparencia ya presente en las referencias.

La rasterización CPU se verificó a 1024 px, seguida de operaciones CUDA sin error. Los tres trabajos MCP terminaron correctamente. El problema previo de espacio se resolvió cuando el usuario liberó aproximadamente 110 GB.

## Parámetros y evidencias

Modelo MCP: `hunyuan3d-paint/paint-turbo`. Entrada adicional `params.mesh_path` verificada en `generator.py`. Resolución 1024; controles enviados: 30 pasos, guidance 5.5, semillas 411/412/413. El código upstream fija internamente algunos controles, incluida la semilla de vistas; los valores enviados no garantizan que todos tengan efecto. No se modificó la lógica de inferencia para fingir esos controles.

`runs/paint-*.json` registra los resultados terminales. `originals/textured/` conserva las salidas crudas de Paint. `tools/prepare_textured.py` (desde la raíz del proyecto) empaqueta los modelos y renderiza las vistas reales. `tools/validate_textured.py` verifica los GLB y escribe `textured-manifest.json`.

No se ha construido ni publicado todavía la app WebAR; esta entrega completa las tres figuras.
