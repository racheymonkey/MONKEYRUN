import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class Monkey {
    constructor(scene, loadingManager) {
        this.laneIndex = 1;
        this.lanePositions = [-3, 0, 3];
        this.targetX = this.lanePositions[this.laneIndex];
        this.isMoving = false;
        this.isJumping = false;
        this.jumpVelocity = 0;
        this.gravity = -0.008;

        // If true, lane movement and jumping are disabled
        this.isAttached = false;

        // Add transition speed property - can be adjusted for tuning
        this.groundTransitionSpeed = 0.2; // Original speed for ground movement
        this.airTransitionSpeed = 0.08;   // Slower speed for air movement

        this.mesh = new THREE.Group(); // Placeholder for the loaded model

        const loader = new GLTFLoader(loadingManager);
        loader.load('./assets/monkey.glb', (gltf) => {
            this.mesh = gltf.scene;
            this.mesh.scale.set(0.9, 0.9, 0.9);
            this.mesh.position.set(0, 0.5, 0);

            this.mesh.rotation.y = Math.PI;
            scene.add(this.mesh);

            if (gltf.animations.length > 0) {
                this.mixer = new THREE.AnimationMixer(this.mesh);
                const action = this.mixer.clipAction(gltf.animations[0]);
                action.setEffectiveTimeScale(2.0);
                action.play();
            }
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

    update(deltaTime) {
        if (this.mixer) {
            this.mixer.update(deltaTime);
        }

        // when attached vine manager will control monkey movement
        if (this.isAttached) return;

        // Use different transition speeds for ground vs air
        const transitionSpeed = this.isJumping ? this.airTransitionSpeed : this.groundTransitionSpeed;
        
        // Smoother lane-based horizontal movement
        const currentX = this.mesh.position.x;
        const targetX = this.targetX;
        const distance = targetX - currentX;
        
        // Apply easing to make the movement more natural
        // Use a cubic easing formula for smoother acceleration/deceleration
        let moveStep;
        if (Math.abs(distance) > 0.1) {
            // For larger distances, use cubic easing
            moveStep = distance * transitionSpeed * (0.5 + Math.abs(distance) * 0.1);
        } else {
            // For small distances, use linear movement to snap to position
            moveStep = distance * 0.5;
        }
        
        this.mesh.position.x += moveStep;
        
        // Add slight rotation to give a more natural feeling to lane changes
        if (Math.abs(distance) > 0.05) {
            // Tilt in the direction of movement
            const targetTilt = -Math.sign(distance) * Math.min(0.1, Math.abs(distance) * 0.05);
            this.mesh.rotation.z = targetTilt;
        } else {
            // Reset tilt when close to target
            this.mesh.rotation.z = 0;
        }

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
