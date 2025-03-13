import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class Monkey {
    constructor(scene) {
        this.laneIndex = 1;
        this.lanePositions = [-3, 0, 3];
        this.targetX = this.lanePositions[this.laneIndex];
        this.isMoving = false;
        this.isJumping = false;
        this.jumpVelocity = 0;
        this.gravity = -0.008;

        // If true, lane movement and jumping are disabled
        this.isAttached = false;

        this.mesh = new THREE.Group(); // Placeholder for the loaded model

        const loader = new GLTFLoader();
        loader.load('./assets/monkey.glb', (gltf) => {
            this.mesh = gltf.scene;
            this.mesh.scale.set(0.35, 0.35, 0.35);
            this.mesh.position.set(0, 0.5, 0);

            this.mesh.rotation.y = 0;
            scene.add(this.mesh);
        });

        document.addEventListener("keydown", (e) => this.handleInput(e));
    }

    handleInput(event) {
        if (this.isAttached) return;  // no movement while on vine

        // move between lanes
        if (event.key === "a" || event.key === "ArrowLeft") {
            if (this.laneIndex > 0) {
                this.laneIndex--;
                this.targetX = this.lanePositions[this.laneIndex];
            }
        } else if (event.key === "d" || event.key === "ArrowRight") {
            if (this.laneIndex < 2) {
                this.laneIndex++;
                this.targetX = this.lanePositions[this.laneIndex];
            }
        }        

        // jump with w or up arrow
        if ((event.key === "w" || event.key === "ArrowUp") && !this.isJumping) {
            this.isJumping = true;
            this.jumpVelocity = 0.2;
        }

        this.isMoving = true;
        setTimeout(() => (this.isMoving = false), 200);
    }

    update() {
        // when attached vine manager will control monkey movement
        if (this.isAttached) return;

        // lane-based horizontal move
        this.mesh.position.x += (this.targetX - this.mesh.position.x) * 0.2;

        // jumping physics for the monkey
        if (this.isJumping) {
            this.mesh.position.y += this.jumpVelocity;
            this.jumpVelocity += this.gravity;

            if (this.mesh.position.y <= 0.5) {
                this.mesh.position.y = 0.5;
                this.isJumping = false;
            }
        }
    }
}
