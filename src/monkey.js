import * as THREE from 'three';

export function createMonkey() {

  const geometry = new THREE.SphereGeometry(0.5, 16, 16);
  const material = new THREE.MeshStandardMaterial({ color: 0xffaa00 });
  const monkeyMesh = new THREE.Mesh(geometry, material);

  //keeps monkey above ground 
  monkeyMesh.position.set(0, 0.5, 0);

  return monkeyMesh;
}
