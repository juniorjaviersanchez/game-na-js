import * as THREE from "three";
import { PlayerMesh } from "./PlayerMesh";
import { MysteryBoxGroup } from "./MysteryBox";
import { CollectibleSpark, TrackObstacle } from "./TrackElements";
import soundManager from "../audio/SoundManager";

export class GameEngine {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.options = {
      targetDistance: 200,
      boxInterval: 20,
      laneWidth: 2.6,
      ...options
    };

    this.onBoxHit = options.onBoxHit || (() => {});
    this.onSparkCollect = options.onSparkCollect || (() => {});
    this.onObstacleHit = options.onObstacleHit || (() => {});
    this.onProgressUpdate = options.onProgressUpdate || (() => {});
    this.onVictoryReached = options.onVictoryReached || (() => {});

    this.isRunning = false;
    this.isPaused = false;
    this.animationFrameId = null;
    this.lastTime = 0;

    // Estado del Jugador
    this.currentLane = 0; // -1 (izq), 0 (centro), 1 (der)
    this.playerX = 0;
    this.playerY = 0;
    this.playerZ = 0; // Se mueve en z negativo (-distancia)
    this.jumpVelocity = 0;
    this.isJumping = false;
    this.gravity = 28.0;
    this.jumpForce = 12.0;

    // Objetos en pista
    this.mysteryBoxes = [];
    this.collectibles = [];
    this.obstacles = [];
    this.trackSegments = [];
    this.torches = [];

    this.initThree();
    this.buildWorld();
    this.setupControls();
  }

  initThree() {
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;

    // Escena y Cámara
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x15151b, 0.015);

    this.camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 400);
    this.camera.position.set(0, 3.4, 6.8);

    // Renderer con sombras suaves
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Luces
    this.ambientLight = new THREE.AmbientLight(0x3a3a48, 1.2);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xfff0dd, 1.6);
    this.dirLight.position.set(10, 25, 10);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 80;
    this.dirLight.shadow.camera.left = -15;
    this.dirLight.shadow.camera.right = 15;
    this.dirLight.shadow.camera.top = 15;
    this.dirLight.shadow.camera.bottom = -15;
    this.scene.add(this.dirLight);
    this.dirLightTarget = new THREE.Object3D();
    this.scene.add(this.dirLightTarget);
    this.dirLight.target = this.dirLightTarget;

    // Redimensionamiento
    this.handleResize = () => {
      if (!this.canvas) return;
      const w = this.canvas.clientWidth || window.innerWidth;
      const h = this.canvas.clientHeight || window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    };
    window.addEventListener("resize", this.handleResize);
  }

  setPlayerCharacter(characterConfig) {
    if (this.playerMeshInstance) {
      this.scene.remove(this.playerMeshInstance.group);
    }
    this.characterConfig = characterConfig;
    this.playerMeshInstance = new PlayerMesh(characterConfig);
    this.scene.add(this.playerMeshInstance.group);
    this.updatePlayerTransform();
  }

  buildWorld() {
    // 1. Pista Continua de 220 metros
    const trackWidth = this.options.laneWidth * 3 + 1.6; // ~9.4m
    const trackLength = this.options.targetDistance + 40;

    // Suelo de la pista
    const trackGeo = new THREE.PlaneGeometry(trackWidth, trackLength, 1, 100);
    this.trackMat = new THREE.MeshStandardMaterial({
      color: 0x22232a,
      roughness: 0.7,
      metalness: 0.2
    });
    this.trackMesh = new THREE.Mesh(trackGeo, this.trackMat);
    this.trackMesh.rotation.x = -Math.PI / 2;
    this.trackMesh.position.set(0, 0, -trackLength / 2 + 10);
    this.trackMesh.receiveShadow = true;
    this.scene.add(this.trackMesh);

    // Divisores de carril brillantes
    [-this.options.laneWidth / 2, this.options.laneWidth / 2].forEach((xPos) => {
      const lineGeo = new THREE.PlaneGeometry(0.12, trackLength);
      const lineMat = new THREE.MeshBasicMaterial({
        color: 0x00e5ff,
        transparent: true,
        opacity: 0.6
      });
      const lineMesh = new THREE.Mesh(lineGeo, lineMat);
      lineMesh.rotation.x = -Math.PI / 2;
      lineMesh.position.set(xPos, 0.02, -trackLength / 2 + 10);
      this.scene.add(lineMesh);
    });

    // Muros laterales de la caverna (se van abriendo hacia el sol)
    this.buildCavernWalls(trackLength);

    // Arco final de la Verdad / Salida a los 200m
    this.buildVictoryArch(this.options.targetDistance);

    // 2. Generar Cajas Misteriosas cada 20m
    for (let d = this.options.boxInterval; d < this.options.targetDistance; d += this.options.boxInterval) {
      const boxGroup = new MysteryBoxGroup(d, this.options.laneWidth);
      this.mysteryBoxes.push(boxGroup);
      this.scene.add(boxGroup.group);
    }

    // 3. Generar Coleccionables (Chispas) y Obstáculos
    this.populateTrackItems();
  }

  buildCavernWalls(trackLength) {
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x1b1c22,
      roughness: 0.9,
      metalness: 0.1
    });

    // Columnas / estalagmitas a los costados
    for (let z = 0; z < trackLength; z += 12) {
      // Izquierda
      const colGeo = new THREE.CylinderGeometry(0.8, 1.4, 7.0, 6);
      const colLeft = new THREE.Mesh(colGeo, wallMat);
      colLeft.position.set(-6.5 - (z / trackLength) * 4.0, 3.5, -z);
      colLeft.castShadow = true;
      this.scene.add(colLeft);

      // Derecha
      const colRight = new THREE.Mesh(colGeo, wallMat);
      colRight.position.set(6.5 + (z / trackLength) * 4.0, 3.5, -z);
      colRight.castShadow = true;
      this.scene.add(colRight);

      // Antorchas con luz tenue en la primera mitad de la caverna (hasta ~450m)
      if (z < trackLength * 0.45 && z % 24 === 0) {
        const torchLight = new THREE.PointLight(0xff7722, 1.2, 18);
        torchLight.position.set(-5.5, 3.0, -z);
        this.scene.add(torchLight);
        this.torches.push(torchLight);
      }
    }
  }

  buildVictoryArch(targetDist) {
    const archGroup = new THREE.Group();
    archGroup.position.set(0, 0, -targetDist);

    const archMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0xffaa00,
      emissiveIntensity: 0.4
    });

    // Pilares dorados del Sol
    const pillarGeo = new THREE.CylinderGeometry(0.8, 1.0, 9.0, 12);
    const pLeft = new THREE.Mesh(pillarGeo, archMat);
    pLeft.position.set(-4.5, 4.5, 0);
    pLeft.castShadow = true;
    archGroup.add(pLeft);

    const pRight = new THREE.Mesh(pillarGeo, archMat);
    pRight.position.set(4.5, 4.5, 0);
    pRight.castShadow = true;
    archGroup.add(pRight);

    // Dintel del Despertar
    const lintelGeo = new THREE.BoxGeometry(11.0, 1.4, 1.5);
    const lintel = new THREE.Mesh(lintelGeo, archMat);
    lintel.position.set(0, 9.2, 0);
    lintel.castShadow = true;
    archGroup.add(lintel);

    // Orbe solar flotante sobre el arco
    const sunGeo = new THREE.SphereGeometry(1.6, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfff7c2 });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sun.position.set(0, 12.0, 0);
    archGroup.add(sun);

    this.scene.add(archGroup);
  }

  populateTrackItems() {
    const lanes = [-this.options.laneWidth, 0, this.options.laneWidth];

    // Colocamos chispas y obstáculos a lo largo de la pista con dificultad progresiva
    for (let z = 18; z < this.options.targetDistance; z += 5) {
      // Mantener libre de obstáculos y chispas un radio de 5m alrededor de las cajas de preguntas
      const distInInterval = z % this.options.boxInterval;
      const nearBox = distInInterval < 5.0 || distInInterval > (this.options.boxInterval - 5.0);
      if (nearBox) continue;

      // Curva de dificultad progresiva (0 a 1000m)
      let obstacleInterval = 28; // Fase 1: cada 28m aprox.
      let doubleObstacleChance = 0.0; // 1 solo obstáculo por sección

      if (z >= 750) {
        obstacleInterval = 12; // Fase 4 (750 - 1000m): cada 12m
        doubleObstacleChance = 0.50;
      } else if (z >= 500) {
        obstacleInterval = 16; // Fase 3 (500 - 750m): cada 16m
        doubleObstacleChance = 0.35;
      } else if (z >= 250) {
        obstacleInterval = 22; // Fase 2 (250 - 500m): cada 22m
        doubleObstacleChance = 0.20;
      }

      const isObstaclePoint = (z % obstacleInterval) < 5;

      if (isObstaclePoint) {
        // Generar obstáculos temáticos (1 o 2 carriles ocupados, NUNCA los 3)
        const shuffledLanes = [...lanes].sort(() => Math.random() - 0.5);
        const numObstacles = Math.random() < doubleObstacleChance ? 2 : 1;

        for (let i = 0; i < numObstacles; i++) {
          const targetLane = shuffledLanes[i];
          let chosenType = "chains";

          if (z < 250) {
            // Zona 1: Fondo de la Caverna (predominan Cadenas para saltar y Monolitos de roca)
            chosenType = Math.random() > 0.4 ? "chains" : "monolith";
          } else if (z < 500) {
            // Zona 2: Fuego de las Ilusiones (Brasas y Sombras Espectrales)
            const types = ["chains", "embers", "shadow", "monolith"];
            chosenType = types[Math.floor(Math.random() * types.length)];
          } else if (z < 750) {
            // Zona 3: Subida Escarpada (Combinación de los 4 tipos)
            const types = ["shadow", "embers", "monolith", "chains"];
            chosenType = types[Math.floor(Math.random() * types.length)];
          } else {
            // Zona 4: Camino Solar (Máxima intensidad hacia la Verdad)
            const types = ["shadow", "monolith", "embers", "chains"];
            chosenType = types[Math.floor(Math.random() * types.length)];
          }

          const obstacle = new TrackObstacle(chosenType, targetLane, -z);
          this.obstacles.push(obstacle);
          this.scene.add(obstacle.group);
        }

        // En el carril libre restante, colocar una chispa dorada guiando el camino
        const safeLane = shuffledLanes[numObstacles];
        if (safeLane !== undefined) {
          const spark = new CollectibleSpark(safeLane, 0.8, -z);
          this.collectibles.push(spark);
          this.scene.add(spark.group);
        }
      } else {
        // Puntos intermedios: chispas coleccionables
        const randomLane = lanes[Math.floor(Math.random() * lanes.length)];
        const spark = new CollectibleSpark(randomLane, 0.8, -z);
        this.collectibles.push(spark);
        this.scene.add(spark.group);
      }
    }
  }

  setupControls() {
    this.handleKeyDown = (e) => {
      if (!this.isRunning || this.isPaused) return;

      switch (e.code) {
        case "ArrowLeft":
        case "KeyA":
          this.moveLane(-1);
          break;
        case "ArrowRight":
        case "KeyD":
          this.moveLane(1);
          break;
        case "ArrowUp":
        case "KeyW":
        case "Space":
          this.jump();
          break;
      }
    };
    window.addEventListener("keydown", this.handleKeyDown);

    // Soporte para gestos táctiles (Swipe)
    let touchStartX = 0;
    let touchStartY = 0;

    this.handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    };

    this.handleTouchEnd = (e) => {
      if (!this.isRunning || this.isPaused) return;
      const diffX = e.changedTouches[0].screenX - touchStartX;
      const diffY = e.changedTouches[0].screenY - touchStartY;

      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 35) {
        if (diffX > 0) this.moveLane(1);
        else this.moveLane(-1);
      } else if (diffY < -40) {
        this.jump();
      }
    };

    this.canvas.addEventListener("touchstart", this.handleTouchStart, { passive: true });
    this.canvas.addEventListener("touchend", this.handleTouchEnd, { passive: true });
  }

  moveLane(direction) {
    const target = this.currentLane + direction;
    if (target >= -1 && target <= 1) {
      this.currentLane = target;
      soundManager.playWhoosh(direction);
    }
  }

  jump() {
    if (!this.isJumping) {
      this.isJumping = true;
      this.jumpVelocity = this.jumpForce;
      soundManager.playJump();
    }
  }

  start() {
    this.isRunning = true;
    this.isPaused = false;
    this.playerX = 0;
    this.playerY = 0;
    this.playerZ = 0;
    this.currentLane = 0;
    this.jumpVelocity = 0;
    this.isJumping = false;
    this.lastTime = performance.now();

    // Resetear cajas y coleccionables
    this.mysteryBoxes.forEach((b) => {
      b.shattered = false;
      b.isTriggered = false;
      b.boxes.forEach((bx) => (bx.container.visible = true));
      b.shards.forEach((s) => b.group.remove(s.mesh));
      b.shards = [];
    });

    this.collectibles.forEach((c) => {
      c.collected = false;
      c.group.visible = true;
    });

    this.obstacles.forEach((o) => {
      o.hit = false;
    });

    this.loop(this.lastTime);
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
    this.lastTime = performance.now();
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  loop(currentTime) {
    if (!this.isRunning) return;

    this.animationFrameId = requestAnimationFrame((t) => this.loop(t));

    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    if (this.isPaused) return;

    this.update(dt);
    this.render();
  }

  update(dt) {
    // 0. Avance hacia adelante a lo largo de los 200m
    const currentDist = -this.playerZ;
    const progress = Math.min(Math.max(currentDist / this.options.targetDistance, 0), 1.0);
    const speedBonus = this.characterConfig?.speedBonus || 1.0;
    const currentSpeed = (10.0 + progress * 10.0) * speedBonus;
    this.playerZ -= currentSpeed * dt;

    const distanceRun = -this.playerZ;
    this.onProgressUpdate(dt);

    // 1. Movimiento lateral suave entre carriles (Lerp)
    const targetX = this.currentLane * this.options.laneWidth;
    this.playerX += (targetX - this.playerX) * 14.0 * dt;

    // 2. Físicas de Salto
    if (this.isJumping) {
      this.playerY += this.jumpVelocity * dt;
      this.jumpVelocity -= this.gravity * dt;

      if (this.playerY <= 0) {
        this.playerY = 0;
        this.jumpVelocity = 0;
        this.isJumping = false;
        soundManager.playLand();
      }
    }

    // 3. Actualizar modelo 3D del jugador
    if (this.playerMeshInstance) {
      this.updatePlayerTransform();
      this.playerMeshInstance.update(dt, currentSpeed, this.isJumping, this.playerY);
    }

    // 4. Cámara en tercera persona con seguimiento suave
    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, this.playerX * 0.45, dt * 10);
    this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, this.playerY + 3.2, dt * 10);
    this.camera.position.z = this.playerZ + 6.5;
    this.camera.lookAt(this.playerX * 0.5, this.playerY + 1.2, this.playerZ - 8.0);

    // La luz direccional acompaña al jugador
    this.dirLight.position.set(this.playerX + 10, 25, this.playerZ + 10);
    this.dirLightTarget.position.set(this.playerX, 0, this.playerZ - 10);

    // 5. Evolución Visual de la Caverna (De sombras oscuras al Sol platónico)
    this.updatePlatonicAtmosphere(distanceRun);

    // 6. Actualizar Cajas Misteriosas y detección de colisión
    this.mysteryBoxes.forEach((boxGroup) => {
      boxGroup.update(dt);

      if (!boxGroup.isTriggered && Math.abs(distanceRun - boxGroup.zDistance) < 1.2) {
        // Fractura de caja y pausa para la pregunta
        boxGroup.shatter(this.currentLane);
        this.pause();
        this.onBoxHit(boxGroup.zDistance);
      }
    });

    // 7. Actualizar Coleccionables (Chispas)
    const playerPos = new THREE.Vector3(this.playerX, this.playerY + 0.9, this.playerZ);
    const magnetRadius = this.characterConfig?.magneticRadius || 3.0;

    this.collectibles.forEach((spark) => {
      if (!spark.collected && Math.abs(spark.group.position.z - this.playerZ) < 30) {
        spark.update(dt, playerPos, magnetRadius);

        // Colisión / Recolección: ÚNICAMENTE si el jugador está en el MISMO carril
        const sparkLaneX = spark.baseX !== undefined ? spark.baseX : spark.group.position.x;
        const laneDiff = Math.abs(sparkLaneX - this.playerX);

        if (laneDiff < 0.9 && spark.group.position.distanceTo(playerPos) < 1.35) {
          spark.collected = true;
          spark.group.visible = false;
          this.onSparkCollect();
        }
      }
    });

    // 8. Detección de Obstáculos (Impacto y Derrota Inmediata)
    this.obstacles.forEach((obs) => {
      // Animar componentes de los obstáculos cercanos
      if (Math.abs(obs.group.position.z - this.playerZ) < 60) {
        obs.update(dt);
      }

      if (!obs.hit && Math.abs(obs.group.position.z - this.playerZ) < 1.1) {
        const laneDiff = Math.abs(obs.laneX - this.playerX);
        if (laneDiff < 0.9) {
          if (obs.isJumpable) {
            // Obstáculo bajo (cadenas, brasas): Si el jugador no salta a tiempo, choca y pierde
            if (this.playerY < obs.jumpClearanceHeight) {
              obs.hit = true;
              this.pause();
              this.onObstacleHit(obs);
            }
          } else {
            // Obstáculo alto (sombras, monolito): Insuperable con salto, colisión directa y pierde
            obs.hit = true;
            this.pause();
            this.onObstacleHit(obs);
          }
        }
      }
    });

    // 9. Verificar Meta a los 200m
    if (distanceRun >= this.options.targetDistance) {
      this.pause();
      this.onVictoryReached();
    }
  }

  updatePlayerTransform() {
    if (this.playerMeshInstance) {
      this.playerMeshInstance.group.position.set(this.playerX, this.playerY, this.playerZ);
    }
  }

  updatePlatonicAtmosphere(dist) {
    const progress = Math.min(Math.max(dist / this.options.targetDistance, 0), 1);

    // Interpolación de colores de niebla y luz
    // 0.0 - 0.25: Caverna oscura (#15151b)
    // 0.25 - 0.5: Fuego y sombras ámbar (#301d14)
    // 0.5 - 0.75: Umbral del alba azulada (#1f2d3d)
    // 0.75 - 1.0: Sol radiante dorado (#fff5db)
    let fogColor = new THREE.Color(0x15151b);
    let lightColor = new THREE.Color(0xfff0dd);
    let ambientColor = new THREE.Color(0x3a3a48);

    if (progress < 0.25) {
      fogColor.lerp(new THREE.Color(0x15151b), progress * 4);
      ambientColor.lerp(new THREE.Color(0x3a3a48), progress * 4);
    } else if (progress < 0.5) {
      const p = (progress - 0.25) * 4;
      fogColor.set(0x15151b).lerp(new THREE.Color(0x301d14), p);
      ambientColor.set(0x3a3a48).lerp(new THREE.Color(0x7a4625), p);
    } else if (progress < 0.75) {
      const p = (progress - 0.5) * 4;
      fogColor.set(0x301d14).lerp(new THREE.Color(0x1f2d3d), p);
      ambientColor.set(0x7a4625).lerp(new THREE.Color(0x4b79a1), p);
    } else {
      const p = (progress - 0.75) * 4;
      fogColor.set(0x1f2d3d).lerp(new THREE.Color(0xfff5db), p);
      ambientColor.set(0x4b79a1).lerp(new THREE.Color(0xfceabb), p);
      lightColor.set(0xfff0dd).lerp(new THREE.Color(0xfff9e6), p);
    }

    this.scene.fog.color.copy(fogColor);
    this.ambientLight.color.copy(ambientColor);
    this.dirLight.color.copy(lightColor);

    // La densidad de la niebla disminuye a medida que emerge al mundo de las ideas
    this.scene.fog.density = THREE.MathUtils.lerp(0.015, 0.005, progress);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.stop();
    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("keydown", this.handleKeyDown);
    if (this.canvas) {
      this.canvas.removeEventListener("touchstart", this.handleTouchStart);
      this.canvas.removeEventListener("touchend", this.handleTouchEnd);
    }

    this.mysteryBoxes.forEach((b) => b.dispose());
    this.collectibles.forEach((c) => c.dispose());
    this.obstacles.forEach((o) => o.dispose());

    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
