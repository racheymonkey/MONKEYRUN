import * as THREE from 'three';

export function createEnvironment() {
    const group = new THREE.Group();

    // Ground plane
    const planeGeometry = new THREE.PlaneGeometry(10, 80);
    const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    group.add(plane);

    // Lane markers
    const lanePositions = [-3, 0, 3];
    lanePositions.forEach((xPos) => {
        const laneGeometry = new THREE.BoxGeometry(0.1, 0.1, 80);
        const laneMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const lane = new THREE.Mesh(laneGeometry, laneMaterial);
        lane.position.set(xPos, 0.01, 0);
        group.add(lane);
    });

    return group;
}
