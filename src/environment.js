import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export class Environment {
  constructor(scene, loadingManager) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.trees = [];

    // Ground plane
    const textureLoader = new THREE.TextureLoader(loadingManager);
    const grassTexture = textureLoader.load("./assets/grass_2.jpg", () => {
      grassTexture.wrapS = THREE.RepeatWrapping;
      grassTexture.wrapT = THREE.RepeatWrapping;
      grassTexture.repeat.set(10, 70);
    });

    // Forest floor texture for the wider area
    const forestFloorTexture = textureLoader.load(
      "./assets/forest_floor.avif",
      () => {
        forestFloorTexture.wrapS = THREE.RepeatWrapping;
        forestFloorTexture.wrapT = THREE.RepeatWrapping;
        forestFloorTexture.repeat.set(40, 200);
      }
    );

    // Main track
    const planeGeometry = new THREE.PlaneGeometry(9, 200);
    const planeMaterial = new THREE.MeshStandardMaterial({
      map: grassTexture,
      side: THREE.DoubleSide,
    });

    this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
    this.plane.rotation.x = -Math.PI / 2;
    this.plane.position.y = 0;
    this.plane.position.z = -50;
    this.group.add(this.plane);

    // Wider forest floor
    const forestFloorGeometry = new THREE.PlaneGeometry(200, 400);
    const forestFloorMaterial = new THREE.MeshStandardMaterial({
      map: forestFloorTexture,
      side: THREE.DoubleSide,
    });

    this.forestFloor = new THREE.Mesh(forestFloorGeometry, forestFloorMaterial);
    this.forestFloor.rotation.x = -Math.PI / 2;
    this.forestFloor.position.y = -0.1;
    this.forestFloor.position.z = -100;
    this.group.add(this.forestFloor);

    // Lane markers
    const lanePositions = [-3, 0, 3];
    lanePositions.forEach((xPos) => {
      const laneGeometry = new THREE.BoxGeometry(0.1, 0.1, 200);
      const laneMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const lane = new THREE.Mesh(laneGeometry, laneMaterial);
      lane.position.set(xPos, 0.01, 0);
      this.group.add(lane);
    });

    // Load tree model
    const loader = new GLTFLoader(loadingManager);
    loader.load("./assets/tree.glb", (gltf) => {
      this.treeModel = gltf.scene;
      this.treeModel.scale.set(0.25, 0.25, 0.25);
      this.createForest();
    });

    scene.add(this.group);
  }

  createForest() {
    // Create trees on both sides of the track
    for (let z = -100; z < 100; z += 8) {
      // Left side trees
      for (let x = -15; x < -5; x += 2.5) {
        this.createTree(
          x + (Math.random() - 0.5) * 2,
          z + (Math.random() - 0.5) * 4
        );
      }
      // Right side trees - moved further away from track (starting at x=7 instead of x=5)
      for (let x = 7; x < 17; x += 2.5) {
        this.createTree(
          x + (Math.random() - 0.5) * 2,
          z + (Math.random() - 0.5) * 4
        );
      }

      // Background trees - left side
      for (let x = -40; x < -15; x += 3) {
        this.createTree(
          x + (Math.random() - 0.5) * 3,
          z + (Math.random() - 0.5) * 5
        );
      }
      // Background trees - right side - also moved further right
      for (let x = 17; x < 42; x += 3) {
        this.createTree(
          x + (Math.random() - 0.5) * 3,
          z + (Math.random() - 0.5) * 5
        );
      }
    }
  }

  createTree(x, z) {
    if (!this.treeModel) return;
    const tree = this.treeModel.clone();
    tree.position.set(x, 0, z);
    // Random rotation and scale variation
    tree.rotation.y = Math.random() * Math.PI * 2;
    // Larger scale variation for background trees
    const scale =
      x > 15 || x < -15
        ? 0.15 + Math.random() * 0.2 // Background trees
        : 0.2 + Math.random() * 0.15; // Foreground trees
    tree.scale.set(scale, scale, scale);
    this.scene.add(tree);
    this.trees.push(tree);
  }

  update() {
    const speed = 0.2;
    this.plane.position.z += speed;
    this.forestFloor.position.z += speed;

    // Update trees
    this.trees.forEach((tree) => {
      tree.position.z += speed;
      if (tree.position.z >= 20) {
        tree.position.z -= 120; // Move tree back to create endless forest
      }
    });

    if (this.plane.position.z >= 0) {
      this.plane.position.z = -50;
    }
    if (this.forestFloor.position.z >= -50) {
      this.forestFloor.position.z = -100;
    }
  }
}
