import * as THREE from "three";
import { Environment } from "./environment.js";
import { Monkey } from "./monkey.js";
import { BananaManager } from "./banana.js";
import { ObstacleManager } from "./obstacles.js";
import { VineManager } from "./vines.js";

let scene, camera, renderer;
let monkey, bananas, obstacles, vines, score, gameRunning;
let backgroundMusic;
let environment;

const loadingManager = new THREE.LoadingManager();
loadingManager.onLoad = startGame;

function init() {
  scene = new THREE.Scene();

  // Add fog for depth - darker green color
  scene.fog = new THREE.Fog(0x2f4f2f, 20, 60);
  // Set background color to match fog - darker forest green
  scene.background = new THREE.Color(0x2f4f2f);

  backgroundMusic = new Audio("./assets/monkey-run-background.mp3");
  backgroundMusic.loop = true;
  backgroundMusic.volume = 0.5;
  backgroundMusic.play().catch((err) => console.log("Autoplay blocked:", err));

  // If user presses any key, attempt to resume
  document.addEventListener("keydown", () => {
    if (backgroundMusic.paused) {
      backgroundMusic.play();
    }
  });

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 5, 7);
  camera.lookAt(scene.position);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); // Slightly dimmer ambient light
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7); // Adjusted light intensity
  directionalLight.position.set(10, 10, 5);
  scene.add(directionalLight);

  environment = new Environment(scene, loadingManager);
  monkey = new Monkey(scene, loadingManager);
  bananas = new BananaManager(scene, loadingManager);
  obstacles = new ObstacleManager(scene, loadingManager);
  vines = new VineManager(scene, loadingManager);

  score = { value: 0 };
  gameRunning = false;

  document
    .getElementById("restart-button")
    .addEventListener("click", restartGame);

  animate();
}

const clock = new THREE.Clock();

function animate() {
  if (!gameRunning) return;
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();

  // Update monkey, bananas, obstacles, vines
  monkey.update(deltaTime);
  bananas.update(monkey, score);
  obstacles.update(monkey, scene, stopGame);
  vines.update(monkey);
  environment.update();

  renderer.render(scene, camera);
}

function startGame() {
  gameRunning = true;
  requestAnimationFrame(animate);
}

function stopGame() {
  gameRunning = false;
  document.getElementById("game-over").style.display = "block";
  backgroundMusic.pause();
}

function restartGame() {
  backgroundMusic.play();
  location.reload();
}

window.addEventListener("DOMContentLoaded", init);
