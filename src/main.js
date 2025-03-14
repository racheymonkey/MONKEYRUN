import * as THREE from "three";
import { Environment } from "./environment.js";
import { Monkey } from "./monkey.js";
import { BananaManager } from "./banana.js";
import { ObstacleManager } from "./obstacles.js";
import { VineManager } from "./vines.js";
import { WeatherManager } from "./weather.js";

let scene, camera, renderer;
let monkey, bananas, obstacles, vines, score, gameRunning;
let backgroundMusic;
let environment;
let weather;

const loadingManager = new THREE.LoadingManager();
loadingManager.onLoad = startGame;

function init() {
  scene = new THREE.Scene();

  // Change fog and background color to light blue
  scene.fog = new THREE.Fog(0xadd8e6, 20, 60); // Light blue fog
  scene.background = new THREE.Color(0xadd8e6); // Light blue background

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

  // Initialize score object first so it can be passed to other components
  score = { value: 0 };

  bananas = new BananaManager(scene, loadingManager);
  obstacles = new ObstacleManager(scene, loadingManager);
  // Pass score object to VineManager
  vines = new VineManager(scene, score);

  // Initialize weather system
  weather = new WeatherManager(scene);

  // Connect weather and monkey for sliding during rain
  weather.setMonkey(monkey);

  gameRunning = false;

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

  // Update weather effects
  weather.update();

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

  // Re-attach event listener when game over screen is shown
  const restartBtn = document.getElementById("restart-button");
  if (restartBtn) {
    restartBtn.onclick = () => {
      console.log("Restart clicked");
      backgroundMusic.play();
      window.location.reload();
    };
  }
}

function restartGame() {
  console.log("Restart function called");
  backgroundMusic.play();
  window.location.reload();
}

document.addEventListener("DOMContentLoaded", () => {
  init();

  // Add event listener to restart button
  const restartBtn = document.getElementById("restart-button");
  if (restartBtn) {
    restartBtn.onclick = () => {
      console.log("Restart clicked");
      backgroundMusic.play();
      window.location.reload();
    };
  }
});
