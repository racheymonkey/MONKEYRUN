import * as THREE from 'three';

export function createEnvironment() {
  const group = new THREE.Group();

  // Ground plane
  const planeGeometry = new THREE.PlaneGeometry(50, 50);
  const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2; //horizontal
  group.add(plane);

  return group;
}
