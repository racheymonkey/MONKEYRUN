import * as THREE from 'three';

export class BananaManager {
    constructor(scene) {
        this.scene = scene;
        this.lanePositions = [-3, 0, 3];
        this.bananas = [];

        // Start generating bananas
        setInterval(() => this.spawnBanana(), 1500);
    }

    spawnBanana() {
        const lane = this.lanePositions[Math.floor(Math.random() * 3)];
        const y = 0.5;
        const z = -30; 

        const geometry = new THREE.SphereGeometry(0.3, 8, 8);
        const material = new THREE.MeshStandardMaterial({ color: 0xffff00 });
        const banana = new THREE.Mesh(geometry, material);
        banana.position.set(lane, y, z);

        this.scene.add(banana);
        this.bananas.push(banana);
    }

    update(monkey, score) {
        this.bananas.forEach((banana, index) => {
            banana.position.z += 0.2;

            // Check collision
            const distance = banana.position.distanceTo(monkey.mesh.position);
            if (distance < 0.6) {
                this.scene.remove(banana);
                this.bananas.splice(index, 1);
                score.value++;
                document.getElementById("score").innerText = `Bananas: ${score.value}`;
            }
        });

        this.bananas = this.bananas.filter(banana => banana.position.z < 10);
    }
}
