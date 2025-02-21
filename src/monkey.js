import * as THREE from 'three';

export class Monkey {
    constructor() {
        this.laneIndex = 1;
        this.lanePositions = [-3, 0, 3];
        this.isMoving = false;
        this.isJumping = false;
        this.jumpVelocity = 0;
        this.gravity = -0.008;

        const textureLoader = new THREE.TextureLoader();
        const monkeyTexture = textureLoader.load('./assets/monkey.png'); 

        monkeyTexture.wrapS = THREE.RepeatWrapping; 
        monkeyTexture.wrapT = THREE.RepeatWrapping; 
        monkeyTexture.repeat.set(2, 2);

        const geometry = new THREE.SphereGeometry(0.75, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            map: monkeyTexture,
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(0, 0.5, 0);

        document.addEventListener("keydown", (e) => this.handleInput(e));
    }

    handleInput(event) {
        if (event.key === "a" || event.key === "ArrowLeft") {
            if (this.laneIndex > 0) this.laneIndex--;
        } else if (event.key === "d" || event.key === "ArrowRight") {
            if (this.laneIndex < 2) this.laneIndex++;
        } else if ((event.key === "w" || event.key === "ArrowUp") && !this.isJumping) {
            this.isJumping = true;
            this.jumpVelocity = 0.2;
        }

        this.isMoving = true;
        setTimeout(() => (this.isMoving = false), 200);
    }

    update() {
        this.mesh.position.x = this.lanePositions[this.laneIndex];

        // Handle jumping physics
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
