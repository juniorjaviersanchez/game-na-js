<template>
  <div class="character-select-container fill-height d-flex flex-column justify-space-between pa-3 pa-md-5">
    <!-- BARRA SUPERIOR: PERFIL, LOGO Y RANKING -->
    <div class="d-flex align-center justify-space-between flex-wrap gap-2 z-index-top">
      <!-- Usuario Activo con botón de Salir/Cambiar -->
      <div class="user-profile-badge d-flex align-center glass-panel rounded-pill">
        <v-avatar color="primary" size="34" class="mr-3 elevation-2">
          <v-icon icon="mdi-account" color="surface" size="20"></v-icon>
        </v-avatar>
        <div class="d-flex flex-column justify-center mr-2">
          <span class="user-label text-grey-lighten-2">FILÓSOFO:</span>
          <span class="user-name text-primary font-weight-black">
            {{ userStore.currentUser?.username || 'Invitado' }}
          </span>
        </div>
        <v-btn
          icon="mdi-account-switch"
          variant="text"
          size="small"
          color="cyan-accent-2"
          class="ml-1 user-switch-btn"
          title="Cambiar de Usuario (Salir)"
          @click="$emit('open-login')"
        ></v-btn>
      </div>

      <!-- Título de la Selección estilo Runner Heroes -->
      <div class="character-title-banner rounded-pill text-center">
        <span class="char-banner-title font-weight-black text-uppercase text-glow-cyan">
          {{ selectedChar.name }}
        </span>
        <div class="char-banner-subtitle text-amber-accent-2 font-weight-bold">
          {{ selectedChar.title }}
        </div>
      </div>

      <!-- Botones de Acción Superior (Ranking y Configuración) -->
      <div class="d-flex align-center gap-3">
        <!-- Botón Ranking estilizado con padding ideal y colores vivos -->
        <v-btn
          class="btn-arcade btn-ranking-premium"
          rounded="pill"
          elevation="5"
          @click="$emit('open-leaderboard')"
        >
          <v-icon icon="mdi-trophy-variant" size="21" class="ranking-trophy-icon"></v-icon>
          <span class="ranking-btn-text">RANKING</span>
        </v-btn>

        <v-btn
          icon="mdi-cog"
          variant="tonal"
          color="white"
          rounded="circle"
          size="default"
          class="config-btn"
          @click="$emit('open-config')"
        ></v-btn>
      </div>
    </div>

    <!-- CUERPO PRINCIPAL: 3 COLUMNAS (EQUIPO, PEDESTAL 3D, LISTA PERSONAJES) -->
    <div class="d-flex flex-column flex-md-row align-center justify-space-between flex-grow-1 my-2 my-md-3 position-relative content-row">
      <!-- Columna Izquierda: Equipamiento y Ventajas (Perks) -->
      <div class="equipment-column glass-panel pa-3 pa-md-4 rounded-xl d-flex flex-column mb-3 mb-md-0">
        <div class="d-flex align-center mb-3">
          <v-icon icon="mdi-shield-sword" color="cyan-accent-2" size="22" class="mr-2"></v-icon>
          <span class="font-weight-black text-subtitle-2 text-uppercase text-glow-cyan letter-spacing-1">
            Equipamiento
          </span>
        </div>

        <!-- Tarjeta de Objeto 1 -->
        <div class="equipment-card rounded-lg d-flex align-center mb-2">
          <div class="icon-orb mr-3" :style="{ borderColor: selectedChar.color }">
            <v-icon icon="mdi-magnet" size="22" :color="selectedChar.color"></v-icon>
          </div>
          <div class="card-text-group">
            <div class="card-label">Objeto Primario</div>
            <div class="card-title">{{ selectedChar.equipment.split(' y ')[0] }}</div>
          </div>
        </div>

        <!-- Tarjeta de Objeto 2 -->
        <div class="equipment-card rounded-lg d-flex align-center mb-2">
          <div class="icon-orb mr-3" :style="{ borderColor: selectedChar.accentColor }">
            <v-icon icon="mdi-lightning-bolt" size="22" :color="selectedChar.accentColor"></v-icon>
          </div>
          <div class="card-text-group">
            <div class="card-label">Calzado Místico</div>
            <div class="card-title">{{ selectedChar.equipment.split(' y ')[1] }}</div>
          </div>
        </div>

        <!-- Ventaja Pasiva (Perk) -->
        <div class="perk-box rounded-lg mb-2">
          <div class="perk-badge d-flex align-center">
            <v-icon icon="mdi-star" size="15" class="mr-1" color="amber-accent-2"></v-icon>
            <span>HABILIDAD PASIVA</span>
          </div>
          <div class="perk-text">
            {{ selectedChar.perkDescription }}
          </div>
        </div>

        <!-- Descripción Filosófica -->
        <div class="char-bio-quote">
          "{{ selectedChar.bio }}"
        </div>
      </div>

      <!-- Columna Central: Pedestal 3D Giratorio con Three.js -->
      <div class="pedestal-column d-flex justify-center align-center flex-grow-1 position-relative">
        <canvas ref="pedestalCanvas" class="pedestal-canvas"></canvas>
        <div class="pedestal-glow" :style="{ background: `radial-gradient(circle, ${selectedChar.color}44 0%, transparent 70%)` }"></div>
      </div>

      <!-- Columna Derecha: Selector de los 3 Personajes y Atributos -->
      <div class="roster-column glass-panel pa-3 pa-md-4 rounded-xl d-flex flex-column">
        <div class="d-flex align-center justify-space-between mb-3">
          <span class="font-weight-black text-subtitle-2 text-uppercase text-glow-cyan letter-spacing-1">
            Elegir Personaje
          </span>
          <span class="available-chip">3 DISPONIBLES</span>
        </div>

        <!-- Lista de Personajes estilo Runner Heroes -->
        <div
          v-for="char in characters"
          :key="char.id"
          class="character-card rounded-lg d-flex align-center cursor-pointer mb-2"
          :class="{ 'selected-char': char.id === selectedChar.id }"
          @click="selectChar(char)"
        >
          <v-avatar size="40" :color="char.color" class="mr-3 elevation-3">
            <v-icon icon="mdi-account" color="surface" size="24"></v-icon>
          </v-avatar>

          <div class="flex-grow-1 d-flex flex-column justify-center overflow-hidden">
            <div class="d-flex justify-space-between align-center mb-1">
              <span class="char-name-text">{{ char.name.split(' / ')[0] }}</span>
              <v-icon v-if="char.id === selectedChar.id" icon="mdi-check-circle" color="primary" size="18"></v-icon>
            </div>
            <div class="char-subtitle-text text-truncate">{{ char.title }}</div>
          </div>
        </div>

        <!-- Barras de Atributos del Personaje Activo -->
        <div class="stats-panel rounded-lg mt-1">
          <div class="stats-header">ATRIBUTOS:</div>

          <div class="stat-item mb-2">
            <div class="d-flex justify-space-between stat-label-row">
              <span>Agilidad (Velocidad de carril):</span>
              <span class="font-weight-black text-primary font-mono">{{ selectedChar.stats.agilidad }}%</span>
            </div>
            <v-progress-linear :model-value="selectedChar.stats.agilidad" color="primary" height="6" rounded class="stat-bar"></v-progress-linear>
          </div>

          <div class="stat-item mb-2">
            <div class="d-flex justify-space-between stat-label-row">
              <span>Sabiduría (Efectividad en Preguntas):</span>
              <span class="font-weight-black text-amber-accent-2 font-mono">{{ selectedChar.stats.sabiduria }}%</span>
            </div>
            <v-progress-linear :model-value="selectedChar.stats.sabiduria" color="amber" height="6" rounded class="stat-bar"></v-progress-linear>
          </div>

          <div class="stat-item">
            <div class="d-flex justify-space-between stat-label-row">
              <span>Intuición (Radio Magnético):</span>
              <span class="font-weight-black text-secondary font-mono">{{ selectedChar.stats.intuicion }}%</span>
            </div>
            <v-progress-linear :model-value="selectedChar.stats.intuicion" color="secondary" height="6" rounded class="stat-bar"></v-progress-linear>
          </div>
        </div>
      </div>
    </div>

    <!-- BARRA INFERIOR: BOTÓN PRINCIPAL DE INICIO (1000 METROS) -->
    <div class="d-flex justify-center align-center z-index-top mt-1 mb-1">
      <v-btn
        id="btn-start-game"
        size="large"
        color="primary"
        class="btn-arcade btn-start-race text-surface"
        rounded="pill"
        @click="startGame"
      >
        <v-icon icon="mdi-run-fast" size="26" class="mr-2"></v-icon>
        <span class="start-btn-text">COMENZAR DESPERTAR ({{ gameStore.targetDistance }}m)</span>
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useGameStore } from "../stores/gameStore";
import { useUserStore } from "../stores/userStore";
import { PedestalViewer } from "../game/PedestalViewer";
import soundManager from "../audio/SoundManager";

const emit = defineEmits(["start-game", "open-leaderboard", "open-config", "open-login"]);

const gameStore = useGameStore();
const userStore = useUserStore();

const characters = computed(() => gameStore.characters);
const selectedChar = computed(() => gameStore.selectedCharacter);

const pedestalCanvas = ref(null);
let pedestalInstance = null;

onMounted(() => {
  if (userStore.selectedCharacterId) {
    gameStore.selectCharacterById(userStore.selectedCharacterId);
  }

  if (pedestalCanvas.value) {
    pedestalInstance = new PedestalViewer(pedestalCanvas.value, selectedChar.value);
  }
});

onUnmounted(() => {
  if (pedestalInstance) {
    pedestalInstance.dispose();
  }
});

const selectChar = (char) => {
  gameStore.selectCharacterById(char.id);
  userStore.selectCharacter(char.id);
  soundManager.playWhoosh(1);

  if (pedestalInstance) {
    pedestalInstance.setCharacter(char);
  }
};

const startGame = () => {
  soundManager.unlock();
  emit("start-game");
};
</script>

<style scoped>
/* Contenedor principal sin barras de desplazamiento visibles */
.character-select-container {
  position: relative;
  width: 100%;
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  background: radial-gradient(circle at 50% 30%, #151a35 0%, #080a14 100%);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.character-select-container::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

.z-index-top {
  z-index: 10;
}

/* Badge de Usuario */
.user-profile-badge {
  padding: 6px 16px 6px 10px !important;
  border: 1px solid rgba(0, 229, 255, 0.25) !important;
  background: rgba(16, 20, 38, 0.85) !important;
  backdrop-filter: blur(12px);
}

.user-label {
  font-size: 0.68rem !important;
  letter-spacing: 0.8px;
  line-height: 1.1;
  margin-bottom: 2px;
}

.user-name {
  font-size: 0.95rem !important;
  line-height: 1.1;
  letter-spacing: 0.3px;
}

.user-switch-btn {
  opacity: 0.85;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.user-switch-btn:hover {
  opacity: 1;
  transform: rotate(15deg);
}

/* Banner de Título de Personaje Central */
.character-title-banner {
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.25), rgba(224, 64, 251, 0.22));
  border: 1px solid rgba(0, 229, 255, 0.45);
  box-shadow: 0 4px 20px rgba(0, 229, 255, 0.25), inset 0 0 12px rgba(0, 229, 255, 0.08);
  padding: 8px 32px !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
}

.char-banner-title {
  font-size: 1.35rem;
  line-height: 1.2;
  letter-spacing: 1px;
}

.char-banner-subtitle {
  font-size: 0.82rem;
  line-height: 1.2;
  letter-spacing: 0.4px;
}

/* Botón Ranking Destacado y Luminoso con Padding Equilibrado */
.btn-ranking-premium {
  background: linear-gradient(135deg, #ffd700 0%, #ff9800 100%) !important;
  color: #0d111e !important;
  font-family: var(--font-title) !important;
  font-weight: 900 !important;
  letter-spacing: 1.5px !important;
  font-size: 0.92rem !important;
  height: 42px !important;
  padding: 0 22px !important;
  border: 1px solid rgba(255, 255, 255, 0.45) !important;
  box-shadow: 0 4px 18px rgba(255, 171, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.75) !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.btn-ranking-premium:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 8px 25px rgba(255, 171, 0, 0.7), inset 0 1px 2px rgba(255, 255, 255, 0.9) !important;
  background: linear-gradient(135deg, #ffe033 0%, #ffa726 100%) !important;
}

.ranking-trophy-icon {
  margin-right: 8px !important;
  color: #0d111e !important;
}

.ranking-btn-text {
  color: #0d111e !important;
}

.config-btn {
  transition: transform 0.3s ease;
}

.config-btn:hover {
  transform: rotate(45deg);
}

/* Columnas Laterales */
.equipment-column, .roster-column {
  width: 100%;
  max-width: 300px;
  z-index: 5;
}

.equipment-card, .character-card {
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.equipment-card:hover, .character-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

.selected-char {
  background: linear-gradient(90deg, rgba(0, 229, 255, 0.2), rgba(0, 229, 255, 0.06)) !important;
  border-color: #00e5ff !important;
  box-shadow: 0 0 16px rgba(0, 229, 255, 0.35);
}

.card-text-group {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-label {
  font-size: 0.7rem;
  color: #90a4ae;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 2px;
  line-height: 1.1;
}

.card-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
}

.icon-orb {
  width: 38px;
  height: 38px;
  min-width: 38px;
  border-radius: 50%;
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
}

.perk-box {
  padding: 10px 14px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.perk-badge {
  font-size: 0.74rem;
  font-weight: 800;
  color: #ffd54f;
  letter-spacing: 0.6px;
  margin-bottom: 5px;
}

.perk-text {
  font-size: 0.8rem;
  line-height: 1.4;
  color: #eceff1;
}

.char-bio-quote {
  font-size: 0.77rem;
  line-height: 1.42;
  color: #b0bec5;
  font-style: italic;
  padding: 6px 10px;
  border-left: 2px solid rgba(0, 229, 255, 0.35);
  background: rgba(0, 229, 255, 0.03);
  border-radius: 0 6px 6px 0;
}

.available-chip {
  background: rgba(0, 229, 255, 0.18);
  color: #00e5ff;
  border: 1px solid rgba(0, 229, 255, 0.45);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.6px;
  padding: 3px 9px;
  border-radius: 999px;
  white-space: nowrap;
}

.char-name-text {
  font-size: 0.95rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.1;
}

.char-subtitle-text {
  font-size: 0.75rem;
  color: #b0bec5;
  line-height: 1.2;
}

.stats-panel {
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stats-header {
  font-size: 0.72rem;
  font-weight: 800;
  color: #90caf9;
  letter-spacing: 0.8px;
  margin-bottom: 8px;
}

.stat-label-row {
  font-size: 0.74rem;
  color: #cfd8dc;
  margin-bottom: 4px;
}

.stat-bar {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
}

/* Columna Central */
.pedestal-column {
  position: relative;
  min-height: 280px;
}

.pedestal-canvas {
  width: 100%;
  max-width: 350px;
  height: 310px;
  z-index: 2;
}

.pedestal-glow {
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 1;
}

/* Botón Comenzar Despertar */
.btn-start-race {
  padding: 0 38px !important;
  height: 52px !important;
  font-size: 1.05rem !important;
  font-weight: 900 !important;
  letter-spacing: 1.2px !important;
  box-shadow: 0 6px 25px rgba(0, 229, 255, 0.5) !important;
  animation: pulse-glow 2.2s infinite ease-in-out;
}

.btn-start-race:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 8px 30px rgba(0, 229, 255, 0.75) !important;
}

.start-btn-text {
  font-weight: 900;
}

@media (max-width: 960px) {
  .pedestal-column {
    min-height: 240px;
  }
  .pedestal-canvas {
    height: 240px;
  }
}

@media (max-height: 720px) {
  .character-select-container {
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .character-select-container::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }
  .pedestal-canvas {
    height: 220px;
  }
}
</style>
