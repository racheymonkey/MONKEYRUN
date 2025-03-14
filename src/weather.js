import * as THREE from 'three';

export class WeatherManager {
  constructor(scene) {
    this.scene = scene;
    this.originalFogColor = scene.fog.color.clone();
    this.originalBackgroundColor = scene.background.clone();
    this.isRaining = false;
    this.weatherTimer = null;
    
    // Create rain particle system
    this.createRainSystem();
    
    // Set up random weather events
    this.setupRandomWeatherEvents();
  }
  
  setupRandomWeatherEvents() {
    // Random interval between 20-40 seconds for weather change
    const randomInterval = () => 20000 + Math.random() * 20000;
    
    const triggerWeatherEvent = () => {
      if (!this.isRaining) {
        this.startRain();
        
        // Rain lasts 10-15 seconds
        const rainDuration = 10000 + Math.random() * 5000;
        this.weatherTimer = setTimeout(() => {
          this.stopRain();
          setTimeout(triggerWeatherEvent, randomInterval());
        }, rainDuration);
      }
    };
    
    // Start the first event after a random delay (5-15 seconds)
    setTimeout(triggerWeatherEvent, 5000 + Math.random() * 10000);
  }
  
  createRainSystem() {
    // Create 5000 raindrops (increased from 2000 for more density)
    const rainGeometry = new THREE.BufferGeometry();
    const rainPositions = [];
    
    for (let i = 0; i < 5000; i++) {
      // Random positions spread over a large area 
      const x = Math.random() * 100 - 50;
      const y = Math.random() * 50 + 20; // Start rain high above
      const z = Math.random() * 100 - 50;
      
      rainPositions.push(x, y, z);
    }
    
    rainGeometry.setAttribute(
      'position', 
      new THREE.Float32BufferAttribute(rainPositions, 3)
    );
    
    // Create more visible rain material
    const rainMaterial = new THREE.PointsMaterial({
      color: 0xccccff, // Slight blue tint for better visibility
      size: 0.2,       // Doubled size for visibility
      transparent: true,
      opacity: 0.7     // Increased opacity
    });
    
    this.rainSystem = new THREE.Points(rainGeometry, rainMaterial);
    
    // Hide raindrops initially
    this.rainSystem.visible = false;
    this.scene.add(this.rainSystem);
  }
  
  startRain() {
    console.log("Rain started");
    // Change fog color to dark gray
    this.scene.fog.color.set(0x333333);
    this.scene.background.set(0x333333);
    
    // Show rain particles
    this.rainSystem.visible = true;
    
    this.isRaining = true;
  }
  
  stopRain() {
    console.log("Rain stopped");
    // Revert to original fog color
    this.scene.fog.color.copy(this.originalFogColor);
    this.scene.background.copy(this.originalBackgroundColor);
    
    // Hide rain particles
    this.rainSystem.visible = false;
    
    this.isRaining = false;
  }
  
  update() {
    if (!this.isRaining || !this.rainSystem) return;
    
    // Move rain particles downward
    const positions = this.rainSystem.geometry.attributes.position.array;
    
    for (let i = 0; i < positions.length; i += 3) {
      // Move rain down faster (0.3 instead of 0.2)
      positions[i + 1] -= 0.3;
      
      // Move rain slightly toward the camera to simulate wind
      positions[i + 2] += 0.05;
      
      // If raindrop goes below ground, reset it to the top
      if (positions[i + 1] < 0) {
        positions[i + 1] = Math.random() * 50 + 20;
        positions[i] = Math.random() * 100 - 50; // Randomize X
        positions[i + 2] = Math.random() * 100 - 50; // Randomize Z
      }
    }
    
    this.rainSystem.geometry.attributes.position.needsUpdate = true;
  }
} 