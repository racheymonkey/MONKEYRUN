import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export class BananaManager {
  constructor(scene, loadingManager) {
    this.scene = scene;
    this.lanePositions = [-3, 0, 3];
    this.bananas = [];
    this.lastLane = 0;
    this.lastZ = -30;

    this.eatSound = new Audio("./assets/banana-eat.mp3");
    this.eatSound.volume = 0.8;

    const loader = new GLTFLoader(loadingManager);
    loader.load("./assets/banana.glb", (gltf) => {
      this.model = gltf.scene;
      this.model.scale.set(0.025, 0.025, 0.025);

      // Pre-modify materials on the template model
      // This is more efficient than modifying each clone
      this.model.traverse((object) => {
        if (object.isMesh && object.material) {
          // Handle both single and array materials
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];

          materials.forEach((material) => {
            // Clone the material to avoid affecting other instances
            const newMaterial = material.clone();
            // Add subtle emissive glow - much cheaper than lights
            newMaterial.emissive = new THREE.Color(0xffcc00);
            newMaterial.emissiveIntensity = 0.3;

            // Replace the original material
            if (!Array.isArray(object.material)) {
              object.material = newMaterial;
            }
          });
        }
      });
    });

    // Start generating bananas
    setInterval(() => this.spawnBananaPath(), 250);
  }

  randomChoice(choices) {
    return choices[Math.floor(Math.random() * choices.length)];
  }
  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  spawnBananaPath() {
    if (!this.model) return;

    let nextLane = this.lastLane;
    let nextZ = this.lastZ - 2;
    let nextY = 0.5;

    if (Math.random() < 0.3) {
      let potentialLanes = this.lanePositions.filter(
        (lane) => lane !== this.lastLane
      );
      nextLane = this.randomChoice(potentialLanes);
    }

    const banana = this.model.clone();
    banana.position.set(nextLane, nextY, nextZ);

    // Simple rotation data - no complex animation
    banana.userData = {
      rotationSpeed: 0.02,
    };

    this.scene.add(banana);
    this.bananas.push(banana);

    this.lastLane = nextLane;
    this.lastZ = nextZ;
  }

  update(monkey, score) {
    this.bananas.forEach((banana, index) => {
      banana.position.z += 0.2;

      // Simple rotation - very cheap operation
      if (banana.userData) {
        banana.rotation.y += banana.userData.rotationSpeed;
      }

      const distance = banana.position.distanceTo(monkey.mesh.position);
      if (distance < 0.6) {
        this.eatSound.currentTime = 0;
        this.eatSound.play();

        this.scene.remove(banana);
        this.bananas.splice(index, 1);
        score.value++;
        document.querySelector(".score-text").innerText = score.value;
      }
    });

    this.bananas = this.bananas.filter((banana) => banana.position.z < 10);
  }
}
