import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class BananaManager {
    constructor(scene) {
        this.scene = scene;
        this.lanePositions = [-3, 0, 3];
        this.bananas = [];

        this.eatSound = new Audio('./assets/banana-eat.mp3');
        this.eatSound.volume = 0.8;

        const loader = new GLTFLoader();
        loader.load('./assets/banana.glb', (gltf) => {
            this.model = gltf.scene;
            this.model.scale.set(0.025, 0.025, 0.025);
        });

        // Start generating bananas
        setInterval(() => this.spawnBanana(), 1500);
    }

    spawnBanana() {
        const lane = this.lanePositions[Math.floor(Math.random() * 3)];
        const y = 0.5;
        const z = -30; 

        const banana = this.model.clone();
        banana.position.set(lane, y, z);

        this.scene.add(banana);
        this.bananas.push(banana);
    }

    update(monkey, score) {
        this.bananas.forEach((banana, index) => {
            banana.position.z += 0.2;

            const distance = banana.position.distanceTo(monkey.mesh.position);
            if (distance < 0.6) {
                this.eatSound.currentTime = 0;
                this.eatSound.play();

                this.scene.remove(banana);
                this.bananas.splice(index, 1);
                score.value++;
                document.getElementById("score").innerText = `Bananas: ${score.value}`;
            }
        });

        this.bananas = this.bananas.filter(banana => banana.position.z < 10);
    }
}
