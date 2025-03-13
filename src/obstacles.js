import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class ObstacleManager {
    constructor(scene) {
        this.scene = scene;
        this.lanePositions = [-3, 0, 3];
        this.obstacles = [];

        this.collisionSound = new Audio('./assets/monkey-run-collision.mp3');
        this.collisionSound.volume = 0.8;

        const loader = new GLTFLoader();
        loader.load('./assets/rock.glb', (gltf) => {
            this.model = gltf.scene;
            this.model.scale.set(0.5, 0.5, 0.5);
        });

        setInterval(() => this.spawnObstacle(), 2500);
    }

    spawnObstacle() {
        const lane = this.lanePositions[Math.floor(Math.random() * 3)];
        const y = 0.4;
        const z = -30; 

        const obstacle = this.model.clone();
        obstacle.position.set(lane, y, z);

        this.scene.add(obstacle);
        this.obstacles.push(obstacle);
    }

    update(monkey, scene, stopGame) {
        const raycaster = new THREE.Raycaster();
        const direction = new THREE.Vector3(0, 0, 1);
    
        this.obstacles.forEach((obstacle, index) => {
            obstacle.position.z += 0.2;

            const obstacleBox = new THREE.Box3().setFromObject(obstacle);
            const monkeyBox = new THREE.Box3().setFromObject(monkey.mesh);
    
            if (obstacleBox.intersectsBox(monkeyBox)) {
                this.collisionSound.currentTime = 0;
                this.collisionSound.play();
                stopGame();
            }
        });
    
        this.obstacles = this.obstacles.filter(obstacle => obstacle.position.z < 13);
    }
}    
