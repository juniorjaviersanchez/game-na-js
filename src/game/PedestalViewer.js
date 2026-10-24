import * as THREE from "three";
import { PlayerMesh } from "./PlayerMesh";

export class PedestalViewer {
  constructor(canvas, characterConfig) {
    this.canvas = canvas;
    this.characterConfig = characterConfig;
    this.isRunning = false;
    this.time = 0;

    this.init();
  }

  init() {
    const w = this.canvas.clientWidth || 360;
    const h = this.canvas.clientHeight || 420;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    this.camera.position.set(0, 1.8, 4.6);
    this.camera.lookAt(0, 1.1, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Iluminación de estudio futurista
    const ambient = new THREE.AmbientLight(0xffffff, 1.5);
    this.scene.add(ambient);

    // Foco cenital sobre el pedestal
    this.spotLight = new THREE.SpotLight(0x00e5ff, 4.0, 15, Math.PI / 4, 0.4);
    this.spotLight.position.set(0, 5, 2);
    this.spotLight.castShadow = true;
    this.scene.add(this.spotLight);

    // Luz trasera de contorno (Rim light)
    const rimLight = new THREE.DirectionalLight(0xe040fb, 2.5);
    rimLight.position.set(0, 2, -4);
    this.scene.add(rimLight);

    // Pedestal Giratorio
    this.pedestalGroup = new THREE.Group();

    // Base hexagonal tecnológica
    const baseGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.35, 6);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1a2138,
      metalness: 0.8,
      roughness: 0.2
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.175;
    baseMesh.receiveShadow = true;
    this.pedestalGroup.add(baseMesh);

    // Anillo de luz en el borde del pedestal
    const ringGeo = new THREE.TorusGeometry(1.5, 0.04, 8, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.36;
    this.pedestalGroup.add(ring);

    this.scene.add(this.pedestalGroup);

    // Instanciar Personaje
    this.setCharacter(this.characterConfig);

    this.start();
  }

  setCharacter(config) {
    if (this.playerMesh) {
      this.scene.remove(this.playerMesh.group);
    }
    this.characterConfig = config;
    this.playerMesh = new PlayerMesh(config);
    this.playerMesh.group.position.set(0, 0.35, 0);
    this.scene.add(this.playerMesh.group);

    // Cambiar color de luces según el personaje
    if (this.spotLight) {
      this.spotLight.color.set(config.accentColor || 0x00e5ff);
    }
  }

  start() {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.animate();
  }

  stop() {
    this.isRunning = false;
  }

  animate() {
    if (!this.isRunning) return;
    requestAnimationFrame(() => this.animate());

    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;
    this.time += dt;

    if (this.playerMesh) {
      this.playerMesh.updatePedestal(dt);
      // Rotación suave del personaje y pedestal
      this.playerMesh.group.rotation.y = this.time * 0.8;
      this.pedestalGroup.rotation.y = this.time * 0.4;
    }

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.stop();
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
