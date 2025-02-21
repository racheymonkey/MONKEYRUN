import * as THREE from 'three';
import { createEnvironment } from './environment.js';
import { Monkey } from './monkey.js';
import { BananaManager } from './banana.js';
import { ObstacleManager } from './obstacles.js';

let scene, camera, renderer, monkey, bananas, obstacles, score, gameRunning;
let backgroundMusic;

function init() {
    scene = new THREE.Scene();

    backgroundMusic = new Audio('./assets/monkey-run-background.mp3');
    backgroundMusic.loop = true;  // Loop music indefinitely
    backgroundMusic.volume = 0.5;
    backgroundMusic.play().catch(err => console.log("Autoplay blocked:", err));

    const textureLoader = new THREE.TextureLoader();
    const backgroundTexture = textureLoader.load('./assets/monkey-run-background.png');
    scene.background = backgroundTexture;

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    const environment = createEnvironment();
    scene.add(environment);

    monkey = new Monkey();
    scene.add(monkey.mesh);

    bananas = new BananaManager(scene);
    obstacles = new ObstacleManager(scene);

    score = { value: 0 };
    gameRunning = true;

    document.getElementById("restart-button").addEventListener("click", restartGame);

    animate();
}

function animate() {
    if (!gameRunning) return;
    requestAnimationFrame(animate);
    monkey.update();
    bananas.update(monkey, score);
    obstacles.update(monkey, scene, stopGame);
    renderer.render(scene, camera);
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

window.addEventListener('DOMContentLoaded', init);
