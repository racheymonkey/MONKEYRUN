import * as THREE from "three";

export class VineManager {
  constructor(scene, score) {
    this.scene = scene;
    this.lanePositions = [-3, 0, 3];
    this.vines = [];
    this.score = score; // Store reference to the score object

    setInterval(() => this.spawnVine(), 2000);
  }

  spawnVine() {
    // Create a pivot group for the vine's anchor
    const lane = this.lanePositions[Math.floor(Math.random() * 3)];
    const pivotY = 5;
    const pivotZ = -30;

    const pivot = new THREE.Group();
    pivot.position.set(lane, pivotY, pivotZ);

    // Make a short vine
    const vineLength = 3;
    const vineGeom = new THREE.CylinderGeometry(0.05, 0.05, vineLength, 8);
    const vineMat = new THREE.MeshStandardMaterial({ color: 0x006400 });
    const vineMesh = new THREE.Mesh(vineGeom, vineMat);

    // Shift so the top is at local y=0
    vineMesh.position.y = -vineLength / 2;
    pivot.add(vineMesh);

    // Pre-compute the vine's bounding sphere
    vineGeom.computeBoundingSphere();
    const { center, radius } = vineGeom.boundingSphere;

    // Store swinging & collision data with gentler initial swing
    pivot.userData = {
      angle: 0,
      angleVel: -0.01 - Math.random() * 0.01, // Reduced initial swing
      angleAcc: 0,
      vineLength,
      hasMonkey: false,
      vineMesh,
      sphereCenter: center.clone(),
      sphereRadius: radius,
    };

    this.scene.add(pivot);
    this.vines.push(pivot);
  }

  update(monkey) {
    this.vines.forEach((pivot) => {
      // Move pivot forward in Z
      pivot.position.z += 0.2;

      // Update pendulum swing
      this.updatePendulum(pivot);

      // Only check collision if monkey is mid-jump
      if (!pivot.userData.hasMonkey && !monkey.isAttached && monkey.isJumping) {
        // 1) Get bounding sphere center in world space
        const sphereCenterWorld = pivot.userData.sphereCenter.clone();
        pivot.userData.vineMesh.localToWorld(sphereCenterWorld);

        // 2) Check distance to monkey
        const dist = sphereCenterWorld.distanceTo(monkey.mesh.position);
        if (dist < pivot.userData.sphereRadius) {
          console.log("Attaching monkey (any point collision, mid-jump) ...");
          this.attachMonkey(pivot, monkey);
        }
      }
    });

    // Remove vines that go behind the camera
    this.vines = this.vines.filter((pivot) => {
      if (pivot.position.z > 10) {
        if (pivot.userData.hasMonkey) {
          console.log("Detaching monkey because vine left the scene.");
          this.detachMonkey(pivot, monkey);
        }
        this.scene.remove(pivot);
        return false;
      }
      return true;
    });
  }

  updatePendulum(pivot) {
    // Reduced gravity for gentler swings
    const g = 0.05; // Reduced from 0.1
    const len = pivot.userData.vineLength;
    const angle = pivot.userData.angle;
    let angleVel = pivot.userData.angleVel;
    let angleAcc = pivot.userData.angleAcc;

    angleAcc = (-g / len) * Math.sin(angle);
    angleVel += angleAcc;
    angleVel *= 0.99; // Increased friction slightly for more damping
    pivot.userData.angle += angleVel;

    // Add angle limits to prevent extreme swings
    pivot.userData.angle = Math.max(
      Math.min(pivot.userData.angle, Math.PI / 4),
      -Math.PI / 4
    );

    pivot.userData.angleVel = angleVel;
    pivot.userData.angleAcc = angleAcc;

    // Rotate around X for forward/back swing
    pivot.rotation.x = pivot.userData.angle;
  }

  attachMonkey(pivot, monkey) {
    pivot.userData.hasMonkey = true;
    monkey.isAttached = true;

    // Award 5 banana points for swinging on a vine
    if (this.score) {
      this.score.value += 5;
      // Update the score display
      document.querySelector(".score-text").innerText = this.score.value;
    }

    const worldPos = monkey.mesh.position.clone();

    // Remove monkey from scene, add it to pivot
    this.scene.remove(monkey.mesh);
    pivot.add(monkey.mesh);

    // Convert monkey's old world position into pivot's local coords
    const pivotInverse = new THREE.Matrix4().copy(pivot.matrixWorld).invert();
    const localPos = worldPos.applyMatrix4(pivotInverse);

    // Set the monkey at that local position
    monkey.mesh.position.copy(localPos);

    // Calculate the initial swing velocity based on monkey's current velocity
    // Reduced the impact of monkey's velocity on swing
    const monkeyVelocity = monkey.jumpVelocity || 0;
    pivot.userData.angleVel = -0.15 - monkeyVelocity * 0.25; // Reduced from -0.3 and 0.5

    // Adjust monkey's position relative to the vine's current position
    this.scene.remove(monkey.mesh);
    pivot.add(monkey.mesh);

    // Convert monkey's old world position into pivot's local coords
    monkey.mesh.position.copy(localPos);

    // Make sure the vine swing starts from where the monkey grabbed it
    pivot.userData.angle = Math.asin(localPos.x / pivot.userData.vineLength);

    // Auto-detach after 150 ms (increased from 100ms for slightly longer swings)
    setTimeout(() => {
      if (pivot.userData.hasMonkey) {
        console.log("Auto-detach monkey after 150ms.");
        this.detachMonkey(pivot, monkey);
      }
    }, 150);
  }

  detachMonkey(pivot, monkey) {
    pivot.userData.hasMonkey = false;
    monkey.isAttached = false;

    pivot.remove(monkey.mesh);
    this.scene.add(monkey.mesh);

    // puts monkey near pivot on ground
    const pivotWorldPos = new THREE.Vector3();
    pivot.getWorldPosition(pivotWorldPos);

    monkey.mesh.position.set(pivotWorldPos.x, 0.5, 0);

    // Reduced upward boost
    monkey.isJumping = true;
    monkey.jumpVelocity = 0.2; // Reduced from 0.25

    console.log("Monkey detached from vine.");
  }
}
