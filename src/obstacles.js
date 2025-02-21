import * as THREE from 'three';

export class ObstacleManager {
    constructor(scene) {
        this.scene = scene;
        this.lanePositions = [-3, 0, 3];
        this.obstacles = [];

        setInterval(() => this.spawnObstacle(), 2500);
    }

    spawnObstacle() {
        const lane = this.lanePositions[Math.floor(Math.random() * 3)];
        const y = 0.5;
        const z = -30; 

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const obstacle = new THREE.Mesh(geometry, material);
        obstacle.position.set(lane, y, z);

        this.scene.add(obstacle);
        this.obstacles.push(obstacle);
    }

    update(monkey, scene, stopGame) {
        this.obstacles.forEach((obstacle, index) => {
            obstacle.position.z += 0.2;

            const distance = obstacle.position.distanceTo(monkey.mesh.position);
            if (distance < 0.8 && monkey.mesh.position.y <= 1) {
                stopGame();
            }
        });

        this.obstacles = this.obstacles.filter(obstacle => obstacle.position.z < 10);
    }
}
