import * as THREE from "three";

export class MysteryBoxGroup {
  constructor(zDistance, laneWidth = 2.6) {
    this.zDistance = zDistance;
    this.laneWidth = laneWidth;
    this.group = new THREE.Group();
    this.boxes = []; // 3 cajas (carril -1, 0, 1)
    this.isTriggered = false;
    this.shattered = false;
    this.shards = [];
    this.time = 0;

    this.initBoxes();
  }

  initBoxes() {
    const lanes = [-this.laneWidth, 0, this.laneWidth];

    lanes.forEach((laneX, index) => {
      const boxContainer = new THREE.Group();
      boxContainer.position.set(laneX, 1.25, -this.zDistance);

      // Material exterior dorado místico con símbolos
      const boxMat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.85,
        roughness: 0.2,
        emissive: 0x996515,
        emissiveIntensity: 0.35
      });

      // Cubo principal
      const boxGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
      const boxMesh = new THREE.Mesh(boxGeo, boxMat);
      boxMesh.castShadow = true;
      boxMesh.receiveShadow = true;
      boxContainer.add(boxMesh);

      // Núcleo brillante interior (Orbe de Sabiduría)
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x00e5ff,
        emissive: 0x00e5ff,
        emissiveIntensity: 1.2,
        roughness: 0.1
      });
      const coreGeo = new THREE.OctahedronGeometry(0.4, 0);
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      boxContainer.add(coreMesh);

      // Sombra inferior
      const shadowGeo = new THREE.PlaneGeometry(1.3, 1.3);
      const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.4
      });
      const shadow = new THREE.Mesh(shadowGeo, shadowMat);
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = -1.2;
      boxContainer.add(shadow);

      this.boxes.push({
        container: boxContainer,
        mesh: boxMesh,
        core: coreMesh,
        laneIndex: index - 1, // -1, 0, 1
        laneX: laneX
      });

      this.group.add(boxContainer);
    });
  }

  update(dt) {
    this.time += dt;

    // Animación de flotación y rotación mística si no se ha roto
    if (!this.shattered) {
      this.boxes.forEach((b, i) => {
        b.container.position.y = 1.25 + Math.sin(this.time * 3 + i * 1.5) * 0.15;
        b.mesh.rotation.y = this.time * 1.2;
        b.mesh.rotation.x = Math.sin(this.time * 1.5) * 0.1;
        b.core.rotation.y = -this.time * 2.5;
        b.core.rotation.z = this.time * 1.8;
      });
    } else {
      // Simulación física de fragmentos de fractura (Shatter 3D)
      this.shards.forEach((shard) => {
        shard.mesh.position.x += shard.velocity.x * dt;
        shard.mesh.position.y += shard.velocity.y * dt;
        shard.mesh.position.z += shard.velocity.z * dt;

        shard.velocity.y -= 18.0 * dt; // Gravedad sobre escombros

        shard.mesh.rotation.x += shard.rotVelocity.x * dt;
        shard.mesh.rotation.y += shard.rotVelocity.y * dt;
        shard.mesh.rotation.z += shard.rotVelocity.z * dt;

        // Desvanecimiento progresivo
        if (shard.mesh.material.opacity > 0) {
          shard.mesh.material.opacity = Math.max(0, shard.mesh.material.opacity - dt * 1.5);
        }
      });
    }
  }

  shatter(selectedLaneIndex) {
    if (this.shattered) return;
    this.shattered = true;
    this.isTriggered = true;

    // Ocultamos las 3 cajas originales
    this.boxes.forEach((b) => {
      b.container.visible = false;
    });

    // Encontramos la caja seleccionada
    const hitBox = this.boxes.find((b) => b.laneIndex === selectedLaneIndex) || this.boxes[1];
    const origin = hitBox.container.position;

    // Generamos 16 fragmentos 3D dispersándose explosivamente
    const shardGeo = new THREE.BoxGeometry(0.35, 0.35, 0.35);
    const shardMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xff9800,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 1.0,
      roughness: 0.3
    });

    for (let i = 0; i < 16; i++) {
      const shardMesh = new THREE.Mesh(shardGeo, shardMat.clone());
      shardMesh.position.set(
        origin.x + (Math.random() - 0.5) * 0.5,
        origin.y + (Math.random() - 0.5) * 0.5,
        origin.z + (Math.random() - 0.5) * 0.5
      );

      // Velocidad aleatoria radial
      const speed = 4.0 + Math.random() * 6.0;
      const angle = Math.random() * Math.PI * 2;
      const vy = 3.0 + Math.random() * 5.0;

      const shard = {
        mesh: shardMesh,
        velocity: new THREE.Vector3(
          Math.cos(angle) * speed,
          vy,
          Math.sin(angle) * speed + 2.0
        ),
        rotVelocity: new THREE.Vector3(
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 12
        )
      };

      this.shards.push(shard);
      this.group.add(shardMesh);
    }
  }

  dispose() {
    this.boxes.forEach((b) => {
      b.mesh.geometry.dispose();
      b.mesh.material.dispose();
      b.core.geometry.dispose();
      b.core.material.dispose();
    });
    this.shards.forEach((s) => {
      s.mesh.geometry.dispose();
      s.mesh.material.dispose();
    });
  }
}
