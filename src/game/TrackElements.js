import * as THREE from "three";

// 1. Chispas de Sabiduría (Orbes/Monedas coleccionables)
export class CollectibleSpark {
  constructor(x, y, z) {
    this.group = new THREE.Group();
    this.group.position.set(x, y, z);
    this.collected = false;
    this.time = Math.random() * 10;
    this.baseY = y;
    this.baseX = x; // Guardar posición X original del carril

    // Geometría octaédrica brillante (joya filosófica)
    const geo = new THREE.OctahedronGeometry(0.32, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffeb3b,
      emissive: 0xffc107,
      emissiveIntensity: 0.9,
      metalness: 0.8,
      roughness: 0.2
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.castShadow = true;
    this.group.add(this.mesh);

    // Anillo orbital místico
    const ringGeo = new THREE.TorusGeometry(0.45, 0.03, 6, 16);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    this.ring = new THREE.Mesh(ringGeo, ringMat);
    this.group.add(this.ring);
  }

  update(dt, playerPos, magnetRadius = 3.0) {
    if (this.collected) return;

    this.time += dt;
    this.mesh.rotation.y += dt * 3.0;
    this.mesh.rotation.x = Math.sin(this.time * 2) * 0.2;
    this.ring.rotation.x = this.time * 2.0;
    this.ring.rotation.y = this.time * 1.5;
    this.group.position.y = this.baseY + Math.sin(this.time * 4) * 0.12;

    // Efecto magnético: ÚNICAMENTE si el jugador está corriendo en el MISMO carril
    const laneDiff = Math.abs(this.baseX - playerPos.x);
    if (laneDiff < 0.9) {
      const dist = this.group.position.distanceTo(playerPos);
      if (dist < magnetRadius) {
        this.group.position.lerp(playerPos, dt * 10.0);
      }
    } else {
      // Bloquear en su carril original para que no salte a otros carriles
      this.group.position.x = this.baseX;
    }
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.ring.geometry.dispose();
    this.ring.material.dispose();
  }
}

// 2. Obstáculos Temáticos del Mito de la Caverna
// Ocupan ESTRICTAMENTE un carril (~1.8m de ancho sobre un carril de 2.6m)
export class TrackObstacle {
  constructor(type, x, z) {
    this.type = type; // "chains", "embers", "shadow", "monolith"
    this.laneX = x; // Coordenada X del carril donde se ubica
    this.group = new THREE.Group();
    this.group.position.set(x, 0, z);
    this.hit = false;
    this.time = Math.random() * 10;
    this.animatedMeshes = [];

    switch (type) {
      case "chains":
        this.buildChainsObstacle();
        this.isJumpable = true;
        this.jumpClearanceHeight = 0.85;
        this.name = "Cadenas de la Ignorancia";
        break;

      case "embers":
        this.buildEmbersObstacle();
        this.isJumpable = true;
        this.jumpClearanceHeight = 0.80;
        this.name = "Brasas de la Hoguera";
        break;

      case "shadow":
        this.buildShadowObstacle();
        this.isJumpable = false; // Insuperable por salto: requiere esquivar
        this.jumpClearanceHeight = 999.0;
        this.name = "Sombra Proyectada";
        break;

      case "monolith":
      default:
        this.buildMonolithObstacle();
        this.isJumpable = false; // Insuperable por salto: requiere esquivar
        this.jumpClearanceHeight = 999.0;
        this.name = "Monolito de Dogma";
        break;
    }
  }

  // --- 1. CADENAS DE LA IGNORANCIA (Para Saltar) ---
  buildChainsObstacle() {
    // Postes laterales de hierro forjado
    const postMat = new THREE.MeshStandardMaterial({
      color: 0x3d3532,
      metalness: 0.85,
      roughness: 0.3
    });

    [-0.85, 0.85].forEach((posX) => {
      const postGeo = new THREE.CylinderGeometry(0.09, 0.12, 0.65, 8);
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(posX, 0.325, 0);
      post.castShadow = true;
      this.group.add(post);

      // Argolla superior
      const ringGeo = new THREE.TorusGeometry(0.1, 0.03, 6, 12);
      const ring = new THREE.Mesh(ringGeo, postMat);
      ring.position.set(posX, 0.65, 0);
      this.group.add(ring);
    });

    // Barra de cadena horizontal con brillo incandescente rojizo
    const chainMat = new THREE.MeshStandardMaterial({
      color: 0x8a2b16,
      emissive: 0xff3d00,
      emissiveIntensity: 0.65,
      metalness: 0.9,
      roughness: 0.2
    });
    const chainBarGeo = new THREE.CylinderGeometry(0.07, 0.07, 1.7, 8);
    const chainBar = new THREE.Mesh(chainBarGeo, chainMat);
    chainBar.rotation.z = Math.PI / 2;
    chainBar.position.set(0, 0.45, 0);
    chainBar.castShadow = true;
    this.group.add(chainBar);

    // Eslabones colgantes centrales
    for (let i = -0.6; i <= 0.6; i += 0.3) {
      const linkGeo = new THREE.TorusGeometry(0.08, 0.025, 6, 10);
      const link = new THREE.Mesh(linkGeo, chainMat);
      link.position.set(i, 0.28, 0);
      link.rotation.x = Math.PI / 2;
      this.group.add(link);
    }

    // Indicador holográfico flotante de salto (flecha hacia arriba)
    const arrowMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const arrowGeo = new THREE.ConeGeometry(0.14, 0.25, 4);
    const arrow = new THREE.Mesh(arrowGeo, arrowMat);
    arrow.position.set(0, 0.85, 0);
    arrow.rotation.z = Math.PI;
    this.animatedMeshes.push(arrow);
    this.group.add(arrow);
  }

  // --- 2. BRASAS DE LA HOGUERA (Para Saltar) ---
  buildEmbersObstacle() {
    // Base de ceniza y rocas quemadas
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1f1917,
      roughness: 0.95,
      metalness: 0.1
    });
    const baseGeo = new THREE.BoxGeometry(1.8, 0.18, 0.85);
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.set(0, 0.09, 0);
    base.castShadow = true;
    base.receiveShadow = true;
    this.group.add(base);

    // Llamas y cristales de fuego ardiente
    const fireMat = new THREE.MeshStandardMaterial({
      color: 0xff6d00,
      emissive: 0xff3d00,
      emissiveIntensity: 1.2,
      roughness: 0.2
    });

    const fireCoords = [
      [-0.6, 0.28, 0.1],
      [-0.2, 0.35, -0.1],
      [0.2, 0.40, 0.15],
      [0.6, 0.30, -0.05]
    ];

    fireCoords.forEach(([fx, fy, fz], idx) => {
      const flameGeo = new THREE.ConeGeometry(0.16 + (idx % 2) * 0.04, 0.45, 5);
      const flame = new THREE.Mesh(flameGeo, fireMat);
      flame.position.set(fx, fy, fz);
      this.animatedMeshes.push(flame);
      this.group.add(flame);
    });

    // Luz puntual cálida que ilumina el suelo
    const fireLight = new THREE.PointLight(0xff6d00, 1.2, 3.5);
    fireLight.position.set(0, 0.5, 0);
    this.group.add(fireLight);
  }

  // --- 3. SOMBRA PROYECTADA / MARIONETA (Para Esquivar) ---
  buildShadowObstacle() {
    // Silueta espectral antropomorfa de sombra
    const shadowMat = new THREE.MeshStandardMaterial({
      color: 0x0c0b14,
      emissive: 0x3d1054,
      emissiveIntensity: 0.4,
      roughness: 0.6,
      transparent: true,
      opacity: 0.94
    });

    // Cuerpo / Túnica de sombra
    const bodyGeo = new THREE.ConeGeometry(0.7, 2.0, 7);
    const body = new THREE.Mesh(bodyGeo, shadowMat);
    body.position.set(0, 1.1, 0);
    body.castShadow = true;
    this.group.add(body);

    // Cabeza espectral
    const headGeo = new THREE.SphereGeometry(0.35, 8, 8);
    const head = new THREE.Mesh(headGeo, shadowMat);
    head.position.set(0, 2.2, 0);
    this.group.add(head);

    // Ojos púrpuras incandescentes de la marioneta
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xe040fb });
    [-0.12, 0.12].forEach((eyeX) => {
      const eyeGeo = new THREE.SphereGeometry(0.06, 6, 6);
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(eyeX, 2.25, 0.28);
      this.group.add(eye);
    });

    // Aura oscura holográfica que flota arriba
    const haloGeo = new THREE.TorusGeometry(0.45, 0.04, 6, 16);
    const haloMat = new THREE.MeshBasicMaterial({ color: 0x7c4dff, transparent: true, opacity: 0.7 });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.set(0, 2.65, 0);
    halo.rotation.x = Math.PI / 2;
    this.animatedMeshes.push(halo);
    this.group.add(halo);

    // Varilla o soporte de marioneta
    const stickMat = new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.9 });
    const stickGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.2, 6);
    const stick = new THREE.Mesh(stickGeo, stickMat);
    stick.position.set(0, 0.6, -0.2);
    this.group.add(stick);
  }

  // --- 4. MONOLITO DE DOGMA (Para Esquivar) ---
  buildMonolithObstacle() {
    // Pilar de piedra cavernosa
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x1a1c24,
      roughness: 0.75,
      metalness: 0.25
    });
    const monoGeo = new THREE.BoxGeometry(1.7, 2.8, 0.6);
    const mono = new THREE.Mesh(monoGeo, rockMat);
    mono.position.set(0, 1.4, 0);
    mono.castShadow = true;
    mono.receiveShadow = true;
    this.group.add(mono);

    // Grabados / Runas con resplandor platónico cian
    const runeMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00e5ff,
      emissiveIntensity: 0.8,
      roughness: 0.1
    });

    // Franja central de advertencia
    const bandGeo = new THREE.BoxGeometry(1.75, 0.18, 0.65);
    const band = new THREE.Mesh(bandGeo, runeMat);
    band.position.set(0, 1.4, 0);
    this.group.add(band);

    // Glifo superior
    const glyphGeo = new THREE.OctahedronGeometry(0.22, 0);
    const glyph = new THREE.Mesh(glyphGeo, runeMat);
    glyph.position.set(0, 2.2, 0.32);
    this.animatedMeshes.push(glyph);
    this.group.add(glyph);
  }

  update(dt) {
    this.time += dt;

    // Animación sutil de los componentes luminosos
    if (this.type === "chains") {
      const arrow = this.animatedMeshes[0];
      if (arrow) {
        arrow.position.y = 0.85 + Math.sin(this.time * 5) * 0.08;
      }
    } else if (this.type === "embers") {
      this.animatedMeshes.forEach((flame, i) => {
        flame.scale.y = 0.9 + Math.sin(this.time * 8 + i * 1.5) * 0.2;
      });
    } else if (this.type === "shadow") {
      const halo = this.animatedMeshes[0];
      if (halo) {
        halo.rotation.z += dt * 1.5;
        this.group.position.y = Math.sin(this.time * 3) * 0.08;
      }
    } else if (this.type === "monolith") {
      const glyph = this.animatedMeshes[0];
      if (glyph) {
        glyph.rotation.y += dt * 2.0;
      }
    }
  }

  dispose() {
    this.group.traverse((child) => {
      if (child.isMesh) {
        child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      }
    });
  }
}
