import * as THREE from 'three';
import { createEnvironment } from './environment.js';
import { createMonkey } from './monkey.js';

let scene, camera, renderer, monkey;

function init() {
  // Create scene
  scene = new THREE.Scene();

  // Create camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 2, 5);

  // Create renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Basic lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 10, 5);
  scene.add(directionalLight);

  // Environment
  const environment = createEnvironment();
  scene.add(environment);

  // Monkey placeholder mesh
  monkey = createMonkey();
  scene.add(monkey);

  // Handle window resizing
  window.addEventListener('resize', onWindowResize);

  // Start animation loop
  animate();
}

function animate() {
  requestAnimationFrame(animate);

  // Simple rotation to see something move
  monkey.rotation.y += 0.01;

  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Initialize scene once the DOM is ready
window.addEventListener('DOMContentLoaded', init);
