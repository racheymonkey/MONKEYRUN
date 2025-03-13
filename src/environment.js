import * as THREE from 'three';

export class Environment {
    constructor(scene, loadingManager) {
        this.scene = scene;
        this.group = new THREE.Group();

        // Ground plane
        const textureLoader = new THREE.TextureLoader(loadingManager);
        const grassTexture = textureLoader.load('./assets/grass.jpg', () => {
            grassTexture.wrapS = THREE.RepeatWrapping;
            grassTexture.wrapT = THREE.RepeatWrapping;
            grassTexture.repeat.set(5, 35);
        });

        const planeGeometry = new THREE.PlaneGeometry(9, 200);
        const planeMaterial = new THREE.MeshStandardMaterial({
            map: grassTexture,
            side: THREE.DoubleSide
        });

        this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
        this.plane.rotation.x = -Math.PI / 2;
        this.plane.position.y = 0;
        this.plane.position.z = -50;
        this.group.add(this.plane);

        // Lane markers
        const lanePositions = [-3, 0, 3];
        lanePositions.forEach((xPos) => {
            const laneGeometry = new THREE.BoxGeometry(0.1, 0.1, 200);
            const laneMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
            const lane = new THREE.Mesh(laneGeometry, laneMaterial);
            lane.position.set(xPos, 0.01, 0);
            this.group.add(lane);
        });

        scene.add(this.group);
    }

    update() {
        const speed = 0.2;
        this.plane.position.z += speed;

        if (this.plane.position.z >= 0) {
            this.plane.position.z = -50;
        }
    }
}
