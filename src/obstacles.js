import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class ObstacleManager {
    constructor(scene) {
        this.scene = scene;
        this.lanePositions = [-3, 0, 3];
        this.obstacles = [];

        this.collisionSound = new Audio('./assets/monkey-run-collision.mp3');
        this.collisionSound.volume = 0.8;

        this.models = { rock: null, tree: null };

        const loader = new GLTFLoader();

        loader.load('./assets/rock.glb', (gltf) => {
            this.models.rock = gltf.scene;
            this.models.rock.scale.set(0.5, 0.5, 0.5);
        });
        loader.load('./assets/tree.glb', (gltf) => {
            this.models.tree = gltf.scene;
            this.models.tree.scale.set(0.25, 0.25, 0.25);
        });

        setInterval(() => this.spawnObstacle(), 2500);
    }

    spawnObstacle() {
        const lane = this.lanePositions[Math.floor(Math.random() * 3)];
        const y = 0.4;
        const z = -30; 

        const obstacleType = Math.random() < 0.5 ? 'rock' : 'tree';
        const obstacle = this.models[obstacleType].clone();
        
        obstacle.position.set(lane, y, z);
        obstacle.name = obstacleType === 'tree' ? "banana_tree" : "rock";

        this.scene.add(obstacle);
        this.obstacles.push(obstacle);
    }

    update(monkey, scene, stopGame) {
        this.obstacles.forEach((obstacle, index) => {
            obstacle.position.z += 0.2;
    
            const obstacleBox = new THREE.Box3().setFromObject(obstacle);
            const monkeyBox = new THREE.Box3().setFromObject(monkey.mesh);
    
            if (obstacle.name === "banana_tree") {
                const monkeyLaneX = monkey.mesh.position.x;
                const obstacleLaneX = obstacle.position.x;
    
                if (Math.abs(monkeyLaneX - obstacleLaneX) < 0.1) { // Same lane
                    const distanceZ = Math.abs(monkey.mesh.position.z - obstacle.position.z);
                    if (distanceZ < 1.2) { // Adjust Z distance threshold
                        this.collisionSound.currentTime = 0;
                        this.collisionSound.play();
                        stopGame();
                    }
                }
            }

            else if (obstacle.name === "rock" && obstacleBox.intersectsBox(monkeyBox)) {
                this.collisionSound.currentTime = 0;
                this.collisionSound.play();
                stopGame();
            }
        });
    
        this.obstacles = this.obstacles.filter(obstacle => obstacle.position.z < 13);
    }    
}    
