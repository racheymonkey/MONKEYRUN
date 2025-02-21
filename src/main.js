import * as THREE from 'three';
import { createEnvironment } from './environment.js';
import { createMonkey } from './monkey.js';

let scene, camera, renderer, monkey;
const keys = { w: false, a: false, s: false, d: false }; // Track which keys are held

function init() {
  // Scene setup
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 2, 5);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 10, 5);
  scene.add(directionalLight);

  // Environment
  const environment = createEnvironment();
  scene.add(environment);

  // Monkey
  monkey = createMonkey();
  scene.add(monkey);

  // Key Listeners
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  // Window resize listener
  window.addEventListener('resize', onWindowResize);

  // Start loop
  animate();
}

function animate() {
  requestAnimationFrame(animate);

  // Rotate the monkey a bit (for visual effect)
  monkey.rotation.y += 0.01;

  // Handle movement
  handleMovement();

  // Render the scene
  renderer.render(scene, camera);
}

function handleMovement() {
  const speed = 0.05; // Movement speed

  // W: move forward (negative Z)
  if (keys.w) {
    monkey.position.z -= speed;
  }
  // S: move backward (positive Z)
  if (keys.s) {
    monkey.position.z += speed;
  }
  // A: move left (negative X)
  if (keys.a) {
    monkey.position.x -= speed;
  }
  // D: move right (positive X)
  if (keys.d) {
    monkey.position.x += speed;
  }
}

function onKeyDown(event) {
  const key = event.key.toLowerCase();
  if (keys.hasOwnProperty(key)) {
    keys[key] = true;
  }
}

function onKeyUp(event) {
  const key = event.key.toLowerCase();
  if (keys.hasOwnProperty(key)) {
    keys[key] = false;
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('DOMContentLoaded', init);
