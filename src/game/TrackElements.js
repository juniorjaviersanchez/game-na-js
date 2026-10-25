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

// 2. Obstáculos (Vallas de Salto y Muros de Sombra)
export class TrackObstacle {
  constructor(type, x, z) {
    this.type = type; // "hurdle" (para saltar) o "monolith" (para esquivar)
    this.group = new THREE.Group();
    this.group.position.set(x, 0, z);
    this.hit = false;

    if (type === "hurdle") {
      // Valla baja para saltar (cadena/bloque de piedra)
      const stoneMat = new THREE.MeshStandardMaterial({
        color: 0x5a5450,
        roughness: 0.8,
        metalness: 0.2
      });
      const barrierGeo = new THREE.BoxGeometry(2.0, 0.65, 0.35);
      this.mesh = new THREE.Mesh(barrierGeo, stoneMat);
      this.mesh.position.y = 0.35;
      this.mesh.castShadow = true;
      this.mesh.receiveShadow = true;
      this.group.add(this.mesh);

      // Señal luminosa de salto (flecha hacia arriba)
      const arrowMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
      const arrowGeo = new THREE.ConeGeometry(0.18, 0.3, 4);
      const arrow = new THREE.Mesh(arrowGeo, arrowMat);
      arrow.position.set(0, 0.85, 0);
      arrow.rotation.z = Math.PI;
      this.group.add(arrow);

      this.height = 0.7;
    } else {
      // Monolito / Muro alto de sombras que obliga a cambiar de carril
      const darkMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a24,
        roughness: 0.5,
        metalness: 0.5,
        emissive: 0x211030,
        emissiveIntensity: 0.3
      });
      const monoGeo = new THREE.BoxGeometry(1.8, 3.2, 0.6);
      this.mesh = new THREE.Mesh(monoGeo, darkMat);
      this.mesh.position.y = 1.6;
      this.mesh.castShadow = true;
      this.mesh.receiveShadow = true;
      this.group.add(this.mesh);

      // Franjas de advertencia holográficas
      const stripeGeo = new THREE.BoxGeometry(1.85, 0.15, 0.65);
      const stripeMat = new THREE.MeshBasicMaterial({ color: 0xff3d00 });
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.position.y = 1.6;
      this.group.add(stripe);

      this.height = 3.2;
    }
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}
