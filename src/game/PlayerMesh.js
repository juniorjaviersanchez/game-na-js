import * as THREE from "three";

export class PlayerMesh {
  constructor(characterConfig) {
    this.group = new THREE.Group();
    this.config = characterConfig;
    this.runCycle = 0;
    this.isJumping = false;

    this.createModel();
  }

  createModel() {
    const { suitColor, trimColor, visorColor, skinColor, hairColor } = this.config.meshConfig;

    // Materiales con soporte de sombras y reflejos
    const suitMat = new THREE.MeshStandardMaterial({
      color: suitColor,
      roughness: 0.4,
      metalness: 0.3
    });
    const trimMat = new THREE.MeshStandardMaterial({
      color: trimColor,
      roughness: 0.3,
      metalness: 0.6,
      emissive: trimColor,
      emissiveIntensity: 0.25
    });
    const visorMat = new THREE.MeshStandardMaterial({
      color: visorColor,
      roughness: 0.1,
      metalness: 0.9,
      emissive: visorColor,
      emissiveIntensity: 0.8
    });
    const skinMat = new THREE.MeshStandardMaterial({
      color: skinColor,
      roughness: 0.6
    });
    const hairMat = new THREE.MeshStandardMaterial({
      color: hairColor,
      roughness: 0.7
    });

    // 1. Torso
    const torsoGeo = new THREE.CylinderGeometry(0.38, 0.3, 0.85, 8);
    this.torso = new THREE.Mesh(torsoGeo, suitMat);
    this.torso.position.y = 1.05;
    this.torso.castShadow = true;
    this.torso.receiveShadow = true;
    this.group.add(this.torso);

    // Pechera / Cinturón tecnológico
    const beltGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.12, 8);
    const belt = new THREE.Mesh(beltGeo, trimMat);
    belt.position.y = 0.72;
    this.group.add(belt);

    // Emblema luminoso en el pecho
    const emblemGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const emblem = new THREE.Mesh(emblemGeo, visorMat);
    emblem.position.set(0, 1.15, 0.32);
    this.group.add(emblem);

    // 2. Cabeza
    const headGeo = new THREE.SphereGeometry(0.28, 12, 12);
    this.head = new THREE.Mesh(headGeo, skinMat);
    this.head.position.y = 1.68;
    this.head.castShadow = true;
    this.group.add(this.head);

    // Cabello / Casco estilizado
    const hairGeo = new THREE.SphereGeometry(0.3, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.6);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 1.72;
    this.group.add(hair);

    // Visor futurista / Gafas de runner
    const visorGeo = new THREE.BoxGeometry(0.42, 0.12, 0.22);
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 1.68, 0.18);
    this.group.add(visor);

    // Orejas de héroe runner (estilo conejo/zorro según Selina / Lumina)
    if (this.config.id === "selina" || this.config.id === "lumina") {
      const earGeo = new THREE.ConeGeometry(0.08, 0.35, 6);
      const earLeft = new THREE.Mesh(earGeo, trimMat);
      earLeft.position.set(-0.2, 2.05, 0.05);
      earLeft.rotation.z = 0.2;
      earLeft.castShadow = true;

      const earRight = new THREE.Mesh(earGeo, trimMat);
      earRight.position.set(0.2, 2.05, 0.05);
      earRight.rotation.z = -0.2;
      earRight.castShadow = true;

      this.group.add(earLeft);
      this.group.add(earRight);
    }

    // 3. Brazos articulados
    const armGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.65, 8);

    // Brazo Izquierdo
    this.leftArmPivot = new THREE.Group();
    this.leftArmPivot.position.set(-0.48, 1.35, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, suitMat);
    leftArmMesh.position.y = -0.3;
    leftArmMesh.castShadow = true;
    this.leftArmPivot.add(leftArmMesh);
    this.group.add(this.leftArmPivot);

    // Brazo Derecho
    this.rightArmPivot = new THREE.Group();
    this.rightArmPivot.position.set(0.48, 1.35, 0);
    const rightArmMesh = new THREE.Mesh(armGeo, suitMat);
    rightArmMesh.position.y = -0.3;
    rightArmMesh.castShadow = true;
    this.rightArmPivot.add(rightArmMesh);
    this.group.add(this.rightArmPivot);

    // 4. Piernas articuladas
    const legGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.7, 8);
    const footGeo = new THREE.BoxGeometry(0.2, 0.12, 0.35);

    // Pierna Izquierda
    this.leftLegPivot = new THREE.Group();
    this.leftLegPivot.position.set(-0.2, 0.68, 0);
    const leftLegMesh = new THREE.Mesh(legGeo, suitMat);
    leftLegMesh.position.y = -0.35;
    leftLegMesh.castShadow = true;
    const leftFoot = new THREE.Mesh(footGeo, trimMat);
    leftFoot.position.set(0, -0.68, 0.08);
    leftFoot.castShadow = true;
    this.leftLegPivot.add(leftLegMesh);
    this.leftLegPivot.add(leftFoot);
    this.group.add(this.leftLegPivot);

    // Pierna Derecha
    this.rightLegPivot = new THREE.Group();
    this.rightLegPivot.position.set(0.2, 0.68, 0);
    const rightLegMesh = new THREE.Mesh(legGeo, suitMat);
    rightLegMesh.position.y = -0.35;
    rightLegMesh.castShadow = true;
    const rightFoot = new THREE.Mesh(footGeo, trimMat);
    rightFoot.position.set(0, -0.68, 0.08);
    rightFoot.castShadow = true;
    this.rightLegPivot.add(rightLegMesh);
    this.rightLegPivot.add(rightFoot);
    this.group.add(this.rightLegPivot);

    // 5. Sombra proyectada en el piso (Shadow Blob)
    const shadowGeo = new THREE.PlaneGeometry(1.0, 1.2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.55
    });
    this.shadowBlob = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowBlob.rotation.x = -Math.PI / 2;
    this.shadowBlob.position.y = 0.03;
    this.group.add(this.shadowBlob);

    // Mochila / Gadget propulsor
    const jetpackGeo = new THREE.BoxGeometry(0.38, 0.45, 0.18);
    const jetpack = new THREE.Mesh(jetpackGeo, trimMat);
    jetpack.position.set(0, 1.1, -0.25);
    jetpack.castShadow = true;
    this.group.add(jetpack);
  }

  update(dt, speed, isJumping, jumpHeight = 0) {
    this.isJumping = isJumping;

    if (isJumping) {
      // Postura de salto heroico
      this.leftLegPivot.rotation.x = THREE.MathUtils.lerp(this.leftLegPivot.rotation.x, -0.5, dt * 15);
      this.rightLegPivot.rotation.x = THREE.MathUtils.lerp(this.rightLegPivot.rotation.x, 0.4, dt * 15);
      this.leftArmPivot.rotation.x = THREE.MathUtils.lerp(this.leftArmPivot.rotation.x, -1.2, dt * 15);
      this.rightArmPivot.rotation.x = THREE.MathUtils.lerp(this.rightArmPivot.rotation.x, -1.2, dt * 15);
      this.torso.rotation.x = THREE.MathUtils.lerp(this.torso.rotation.x, -0.15, dt * 10);

      // Sombra se achica y atenúa conforme salta
      const shadowScale = Math.max(0.4, 1.0 - (jumpHeight / 3.0) * 0.5);
      this.shadowBlob.scale.set(shadowScale, shadowScale, shadowScale);
      this.shadowBlob.material.opacity = Math.max(0.15, 0.55 - (jumpHeight / 3.0) * 0.35);
      this.shadowBlob.position.y = -jumpHeight + 0.03;
    } else {
      // Ciclo de carrera ágil acompasado a la velocidad
      this.runCycle += dt * speed * 1.5;
      const legAngle = Math.sin(this.runCycle) * 0.85;
      const armAngle = -legAngle * 0.9;

      this.leftLegPivot.rotation.x = legAngle;
      this.rightLegPivot.rotation.x = -legAngle;
      this.leftArmPivot.rotation.x = armAngle;
      this.rightArmPivot.rotation.x = -armAngle;

      // Inclinación aerodinámica hacia adelante
      this.torso.rotation.x = 0.15;
      this.torso.position.y = 1.05 + Math.abs(Math.sin(this.runCycle * 2)) * 0.08;

      this.shadowBlob.scale.set(1.0, 1.0, 1.0);
      this.shadowBlob.material.opacity = 0.55;
      this.shadowBlob.position.y = 0.03;
    }
  }

  updatePedestal(dt) {
    // Modo vitrina / pedestal para selección de personaje
    this.runCycle += dt * 2.0;
    this.torso.position.y = 1.05 + Math.sin(this.runCycle) * 0.04;
    this.leftArmPivot.rotation.x = Math.sin(this.runCycle * 0.7) * 0.2;
    this.rightArmPivot.rotation.x = -Math.sin(this.runCycle * 0.7) * 0.2;
    this.leftLegPivot.rotation.x = 0.05;
    this.rightLegPivot.rotation.x = -0.05;
    this.torso.rotation.x = 0;
  }
}
