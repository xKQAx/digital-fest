# Digital Fest · WebAR

App estática en español con Three.js 0.187.0 y los tres GLB texturizados. Incluye cámara trasera cuando está disponible, cambio de figura, giro al arrastrar, control de tamaño, captura JPEG (cámara + modelo), descarga y compartir mediante Web Share API.

Es una superposición 3D sobre la cámara: la figura permanece en pantalla. No detecta superficies ni queda anclada al suelo. No requiere Unity, cuentas, backend, API keys ni servicios de pago. Las fotos se procesan en el navegador y no se suben.

## Probar en este computador

Abre un terminal en esta carpeta y ejecuta `npm start`. Después abre `http://127.0.0.1:4173`. El servidor usa Node.js y las bibliotecas de producción ya están incluidas: no necesitas instalar dependencias para abrirlo. Detén el servidor con Ctrl+C.

No abras `index.html` con doble clic: los módulos y modelos necesitan un servidor HTTP. La dirección localhost del computador no sirve desde el celular; para la prueba móvil usa la dirección HTTPS publicada.

## Publicar gratis en GitHub Pages

1. Crea un repositorio público, por ejemplo `digital-fest-webar`, y sube **el contenido de esta carpeta a la raíz**, incluyendo `models/`, `vendor/`, `.nojekyll` y `.github/`. No subas `node_modules/`, `test-results/` ni el resto de la instalación de Modly.
2. En el repositorio abre **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. En **Actions → Publicar en GitHub Pages → Run workflow**, ejecuta la publicación sobre `main`. El workflow también publica automáticamente al hacer push a `main`.
4. Abre la URL que aparece en **Settings → Pages**, normalmente `https://TU-USUARIO.github.io/digital-fest-webar/`. Puedes convertir ese enlace en un QR para el evento.

GitHub Pages es gratuito para repositorios públicos con GitHub Free. La publicación puede tardar varios minutos. Referencia: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

## Prueba final en el celular

- Abre el enlace HTTPS en Safari o Chrome, pulsa **Activar cámara** y permite el acceso. Gira el teléfono y comprueba que el encuadre sea correcto.
- Cambia entre caballero, robot y backend; arrastra para girar y ajusta el tamaño.
- Pulsa **Tomar foto**: se solicita la descarga y se abre la vista previa. Si el navegador bloquea la descarga automática, pulsa **Descargar**. En iPhone, si se abre la imagen, mantenla pulsada para guardarla o usa Compartir → Guardar imagen.
- Pulsa **Compartir** para abrir la hoja nativa. Si el navegador solo permite compartir enlaces, la app lo indica y comparte el enlace; descarga la foto para enviarla desde la galería. Si Web Share no existe, Descargar sigue disponible.
- Al apagar la cámara, cambiar a otra app o salir de la página se detienen las pistas de video. Al volver, pulsa Activar cámara otra vez.

## Verificación realizada

Pruebas automatizadas con Edge/Playwright: tres modelos distintos renderizados, diseño de 390 × 844, diseño horizontal, cámara simulada, JPEG compuesto y descargado, contenido del archivo enviado a una Web Share simulada, apagado de cámara y recuperación de permiso denegado. Sin errores JavaScript. Se inspeccionaron las capturas de pantalla y el JPEG generado.

La cámara física de un celular y la hoja nativa de compartir todavía necesitan la prueba manual anterior. No se ha creado un repositorio ni publicado una URL en esta entrega.

Para repetir las pruebas: `npm ci` y `npm test` (requiere Microsoft Edge instalado). Las dependencias de desarrollo no se publican.

## Archivos y rendimiento

- `index.html`, `style.css`, `app.js`: aplicación.
- `vendor/`: Three.js, cargador GLTF y utilidades con su licencia MIT.
- `models/`: caballero 2,84 MB, robot 2,60 MB, torre 2,47 MB; texturas embebidas de 1024 px, 50.000 triángulos por figura.
- Carga bajo demanda, caché de modelos, resolución limitada a 2× y renderizado cuando cambia la escena.
- Todas las rutas son relativas y funcionan bajo el subdirectorio del repositorio en GitHub Pages.

Las restricciones de HTTPS y compatibilidad provienen de las APIs del navegador:
https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share
