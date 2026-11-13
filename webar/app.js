import * as THREE from 'three';
import { GLTFLoader } from './vendor/loaders/GLTFLoader.js';

const $ = (id) => document.getElementById(id);
const stage = $('stage'), viewport = $('viewport'), video = $('camera');
const models = [
  { name: 'Caballero oscuro', file: 'caballero-oscuro.glb' },
  { name: 'Robot programador', file: 'robot-programador.glb' },
  { name: 'Torre backend', file: 'torre-backend.glb' },
];
let renderer, scene, camera, figure, currentModel, stream, pendingCamera = false;
let selection = 0, ticket = 0, photoURL, photoFile, drag;
const cache = new Map();
const status = (message) => { $('status').textContent = message; };

function init() {
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: false });
  } catch {
    status('Tu navegador no pudo iniciar 3D. Prueba con Safari o Chrome actualizado.');
    $('camera-button').disabled = true;
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  viewport.appendChild(renderer.domElement);
  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-1, 1, .78, -.78, .1, 20);
  camera.position.set(0, .5, 3);
  camera.lookAt(0, .5, 0);
  figure = new THREE.Group();
  figure.position.y = .5;
  scene.add(figure);
  scene.add(new THREE.HemisphereLight(0xe7f8ff, 0x58616a, 2.5));
  const light = new THREE.DirectionalLight(0xffffff, 3);
  light.position.set(-2, 3, 4);
  scene.add(light);
  new ResizeObserver(resize).observe(stage);
  resize();
  selectModel(0);
  renderer.domElement.addEventListener('webglcontextlost', (event) => {
    event.preventDefault(); $('capture').disabled = true;
    status('Se interrumpió la vista 3D. Recarga la página para continuar.');
  });
}
function render() { if (renderer && currentModel) renderer.render(scene, camera); }
function resize() {
  const { width, height } = stage.getBoundingClientRect();
  if (!width || !height || !renderer) return;
  const aspect = width / height;
  camera.left = -.78 * aspect; camera.right = .78 * aspect;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  render();
}
async function selectModel(index) {
  if (!renderer) return;
  const mine = ++ticket;
  selection = index;
  $('capture').disabled = true;
  $('selected-name').textContent = models[index].name;
  $('model-number').textContent = `0${index + 1} / 03`;
  document.querySelectorAll('[data-model]').forEach((button) => {
    const selected = Number(button.dataset.model) === index;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  status(`Cargando ${models[index].name.toLowerCase()}…`);
  try {
    if (!cache.has(index)) {
      cache.set(index, new GLTFLoader().loadAsync(`./models/${models[index].file}`));
    }
    const gltf = await cache.get(index);
    if (mine !== ticket) return;
    figure.clear();
    currentModel = gltf.scene;
    currentModel.position.set(0, -.5, 0);
    figure.add(currentModel);
    reset();
    $('capture').disabled = false;
    status('');
  } catch (error) {
    cache.delete(index);
    if (mine !== ticket) return;
    status('No se pudo cargar la figura. Comprueba la conexión y vuelve a elegirla.');
    console.error(error);
  }
}
function reset() {
  if (!figure) return;
  figure.rotation.set(0, 0, 0); figure.position.set(0, .5, 0); figure.scale.setScalar(1);
  $('size').value = '1'; render();
}
document.querySelectorAll('[data-model]').forEach((button) => button.addEventListener('click', () => selectModel(Number(button.dataset.model))));
$('size').addEventListener('input', () => { if (figure) { figure.scale.setScalar(Number($('size').value)); render(); } });
$('reset').addEventListener('click', reset);
viewport.addEventListener('pointerdown', (event) => {
  if (!figure || !event.isPrimary) return;
  drag = { x: event.clientX, rotation: figure.rotation.y };
  viewport.setPointerCapture(event.pointerId);
});
viewport.addEventListener('pointermove', (event) => {
  if (!drag || !figure || !event.isPrimary) return;
  figure.rotation.y = drag.rotation + (event.clientX - drag.x) * .012;
  render();
});
for (const name of ['pointerup','pointercancel','lostpointercapture']) viewport.addEventListener(name, () => { drag = null; });

function stopCamera() {
  stream?.getTracks().forEach((track) => track.stop()); stream = null;
  video.srcObject = null; stage.classList.remove('live');
  $('camera-button').textContent = 'Activar cámara'; $('mode').textContent = '● Vista 3D';
}
$('camera-button').addEventListener('click', async () => {
  if (stream) { stopCamera(); return; }
  if (pendingCamera) return;
  if (!isSecureContext || !navigator.mediaDevices?.getUserMedia) {
    status('La cámara necesita HTTPS. Abre el enlace publicado de GitHub Pages en Safari o Chrome.'); return;
  }
  pendingCamera = true; $('camera-button').disabled = true;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } } });
    if (document.hidden) { stopCamera(); return; }
    video.srcObject = stream;
    await video.play();
    stage.classList.add('live'); $('mode').textContent = '● Cámara activa';
    $('camera-button').textContent = 'Apagar cámara'; status('');
    stream.getVideoTracks()[0].addEventListener('ended', () => { stopCamera(); status('La cámara se desconectó. Puedes volver a activarla.'); });
  } catch (error) {
    stopCamera();
    status(error.name === 'NotAllowedError' ? 'Permite el acceso a la cámara en el navegador y vuelve a intentarlo.' : error.name === 'NotFoundError' ? 'No se encontró una cámara. Puedes explorar y guardar la vista 3D.' : 'No se pudo abrir la cámara. Cierra otras apps que la estén usando y reintenta.');
  } finally { pendingCamera = false; $('camera-button').disabled = false; }
});
document.addEventListener('visibilitychange', () => { if (document.hidden) stopCamera(); });
window.addEventListener('pagehide', stopCamera);

$('capture').addEventListener('click', async () => {
  if (!currentModel || $('capture').disabled) return;
  $('capture').disabled = true;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = renderer.domElement.width; canvas.height = renderer.domElement.height;
    const context = canvas.getContext('2d');
    if (stream && video.readyState >= 2 && video.videoWidth) {
      // Match object-fit: cover exactly, including portrait/landscape crops.
      const scale = Math.max(canvas.width / video.videoWidth, canvas.height / video.videoHeight);
      const width = video.videoWidth * scale, height = video.videoHeight * scale;
      context.drawImage(video, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
    } else {
      context.fillStyle = '#182b32'; context.fillRect(0,0,canvas.width,canvas.height);
    }
    // Render and copy in the same task; no persistent WebGL drawing buffer needed.
    render(); context.drawImage(renderer.domElement,0,0);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve,'image/jpeg',.94));
    if (!blob) throw new Error('Empty image');
    if (photoURL) URL.revokeObjectURL(photoURL);
    photoURL = URL.createObjectURL(blob);
    photoFile = new File([blob], `digital-fest-${models[selection].file.replace('.glb','')}-${Date.now()}.jpg`, { type: 'image/jpeg' });
    $('photo-preview').src = photoURL;
    $('download').href = photoURL; $('download').download = photoFile.name;
    $('photo-status').textContent = stream ? 'Tu foto está lista para guardar o compartir.' : 'Vista 3D lista. Activa la cámara para incluir tu entorno.';
    $('share').disabled = !navigator.share;
    $('share').textContent = navigator.share ? 'Compartir' : 'Compartir no disponible';
    $('photo-dialog').showModal();
    // Request the download on capture; the persistent link supports mobile retries.
    $('download').click();
  } catch (error) { status('No se pudo crear la foto. Inténtalo de nuevo.'); console.error(error); }
  finally { $('capture').disabled = false; }
});
$('close-photo').addEventListener('click', () => $('photo-dialog').close());
$('share').addEventListener('click', async () => {
  if (!photoFile || !navigator.share) return;
  try {
    if (navigator.canShare?.({ files: [photoFile] })) {
      await navigator.share({ files: [photoFile], title: 'Mi foto del Digital Fest' });
    } else {
      $('photo-status').textContent = 'Este navegador comparte el enlace. Descarga la foto para enviarla desde tu galería.';
      await navigator.share({ title: 'Digital Fest · WebAR', url: location.href });
    }
  } catch (error) { if (error.name !== 'AbortError') $('photo-status').textContent = 'No se pudo compartir. Puedes descargar la foto y enviarla desde tu galería.'; }
});
init();
