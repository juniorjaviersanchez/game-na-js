<template>
  <div class="character-select-container fill-height d-flex flex-column justify-space-between pa-4 pa-md-6">
    <!-- BARRA SUPERIOR: PERFIL, LOGO Y RANKING -->
    <div class="d-flex align-center justify-space-between flex-wrap gap-2 z-index-top">
      <!-- Usuario Activo con botón de Salir/Cambiar -->
      <div class="d-flex align-center glass-panel px-4 py-2 rounded-pill">
        <v-avatar color="primary" size="36" class="mr-3">
          <v-icon icon="mdi-account" color="surface"></v-icon>
        </v-avatar>
        <div>
          <div class="text-caption text-grey-lighten-2 line-height-1">FILÓSOFO:</div>
          <div class="text-subtitle-1 font-weight-black text-primary line-height-1">
            {{ userStore.currentUser?.username || 'Invitado' }}
          </div>
        </div>
        <v-btn
          icon="mdi-account-switch"
          variant="text"
          size="small"
          color="cyan-accent-2"
          class="ml-2"
          title="Cambiar de Usuario (Salir)"
          @click="$emit('open-login')"
        ></v-btn>
      </div>

      <!-- Título de la Selección estilo Runner Heroes -->
      <div class="character-title-banner px-8 py-2 text-center rounded-pill">
        <span class="text-h5 font-weight-black text-uppercase text-glow-cyan">
          {{ selectedChar.name }}
        </span>
        <div class="text-caption text-amber-accent-2 font-weight-bold">
          {{ selectedChar.title }}
        </div>
      </div>

      <!-- Botones de Acción Superior (Ranking y Configuración) -->
      <div class="d-flex align-center gap-2">
        <v-btn
          color="amber-darken-1"
          prepend-icon="mdi-trophy-variant"
          class="btn-arcade text-surface font-weight-bold"
          rounded="pill"
          elevation="4"
          @click="$emit('open-leaderboard')"
        >
          RANKING
        </v-btn>
        <v-btn
          icon="mdi-cog"
          variant="tonal"
          color="white"
          rounded="circle"
          @click="$emit('open-config')"
        ></v-btn>
      </div>
    </div>

    <!-- CUERPO PRINCIPAL: 3 COLUMNAS (EQUIPO, PEDESTAL 3D, LISTA PERSONAJES) -->
    <div class="d-flex flex-column flex-md-row align-center justify-space-between flex-grow-1 my-3 my-md-6 position-relative">
      <!-- Columna Izquierda: Equipamiento y Ventajas (Perks) -->
      <div class="equipment-column glass-panel pa-4 rounded-xl d-flex flex-column gap-3 mb-4 mb-md-0">
        <div class="d-flex align-center">
          <v-icon icon="mdi-shield-sword" color="cyan-accent-2" class="mr-2"></v-icon>
          <span class="font-weight-black text-subtitle-1 text-uppercase text-glow-cyan">
            Equipamiento
          </span>
        </div>

        <!-- Tarjeta de Objeto 1 -->
        <div class="equipment-card pa-3 rounded-lg d-flex align-center">
          <div class="icon-orb mr-3" :style="{ borderColor: selectedChar.color }">
            <v-icon icon="mdi-magnet" size="28" :color="selectedChar.color"></v-icon>
          </div>
          <div>
            <div class="text-caption text-grey-lighten-2">Objeto Primario</div>
            <div class="text-body-2 font-weight-bold text-white">{{ selectedChar.equipment.split(' y ')[0] }}</div>
          </div>
        </div>

        <!-- Tarjeta de Objeto 2 -->
        <div class="equipment-card pa-3 rounded-lg d-flex align-center">
          <div class="icon-orb mr-3" :style="{ borderColor: selectedChar.accentColor }">
            <v-icon icon="mdi-lightning-bolt" size="28" :color="selectedChar.accentColor"></v-icon>
          </div>
          <div>
            <div class="text-caption text-grey-lighten-2">Calzado Místico</div>
            <div class="text-body-2 font-weight-bold text-white">{{ selectedChar.equipment.split(' y ')[1] }}</div>
          </div>
        </div>

        <!-- Ventaja Pasiva (Perk) -->
        <div class="perk-box pa-3 rounded-lg mt-2">
          <div class="text-caption text-amber-accent-2 font-weight-bold d-flex align-center">
            <v-icon icon="mdi-star" size="16" class="mr-1"></v-icon> HABILIDAD PASIVA
          </div>
          <div class="text-caption text-white mt-1">
            {{ selectedChar.perkDescription }}
          </div>
        </div>

        <!-- Descripción Filosófica -->
        <div class="text-caption text-grey-lighten-2 font-italic px-1">
          "{{ selectedChar.bio }}"
        </div>
      </div>

      <!-- Columna Central: Pedestal 3D Giratorio con Three.js -->
      <div class="pedestal-column d-flex justify-center align-center flex-grow-1 position-relative">
        <canvas ref="pedestalCanvas" class="pedestal-canvas"></canvas>
        <div class="pedestal-glow" :style="{ background: `radial-gradient(circle, ${selectedChar.color}44 0%, transparent 70%)` }"></div>
      </div>

      <!-- Columna Derecha: Selector de los 3 Personajes y Atributos -->
      <div class="roster-column glass-panel pa-4 rounded-xl d-flex flex-column gap-3">
        <div class="d-flex align-center justify-space-between">
          <span class="font-weight-black text-subtitle-1 text-uppercase text-glow-cyan">
            Elegir Personaje
          </span>
          <v-chip size="x-small" color="primary" variant="flat">3 DISPONIBLES</v-chip>
        </div>

        <!-- Lista de Personajes estilo Runner Heroes -->
        <div
          v-for="char in characters"
          :key="char.id"
          class="character-card pa-3 rounded-lg d-flex align-center cursor-pointer transition-all"
          :class="{ 'selected-char': char.id === selectedChar.id }"
          @click="selectChar(char)"
        >
          <v-avatar size="44" :color="char.color" class="mr-3 elevation-4">
            <v-icon icon="mdi-account" color="surface" size="28"></v-icon>
          </v-avatar>

          <div class="flex-grow-1">
            <div class="d-flex justify-space-between align-center">
              <span class="font-weight-bold text-white">{{ char.name.split(' / ')[0] }}</span>
              <v-icon v-if="char.id === selectedChar.id" icon="mdi-check-circle" color="primary" size="20"></v-icon>
            </div>
            <div class="text-caption text-grey-lighten-1">{{ char.title }}</div>
          </div>
        </div>

        <!-- Barras de Atributos del Personaje Activo -->
        <div class="stats-panel pa-3 rounded-lg mt-2">
          <div class="text-caption font-weight-bold text-grey-lighten-2 mb-2">ATRIBUTOS:</div>

          <div class="mb-2">
            <div class="d-flex justify-space-between text-caption">
              <span>Agilidad (Velocidad de carril):</span>
              <span class="font-weight-bold text-primary">{{ selectedChar.stats.agilidad }}%</span>
            </div>
            <v-progress-linear :model-value="selectedChar.stats.agilidad" color="primary" height="6" rounded></v-progress-linear>
          </div>

          <div class="mb-2">
            <div class="d-flex justify-space-between text-caption">
              <span>Sabiduría (Efectividad en Preguntas):</span>
              <span class="font-weight-bold text-amber-accent-2">{{ selectedChar.stats.sabiduria }}%</span>
            </div>
            <v-progress-linear :model-value="selectedChar.stats.sabiduria" color="amber" height="6" rounded></v-progress-linear>
          </div>

          <div>
            <div class="d-flex justify-space-between text-caption">
              <span>Intuición (Radio Magnético):</span>
              <span class="font-weight-bold text-secondary">{{ selectedChar.stats.intuicion }}%</span>
            </div>
            <v-progress-linear :model-value="selectedChar.stats.intuicion" color="secondary" height="6" rounded></v-progress-linear>
          </div>
        </div>
      </div>
    </div>

    <!-- BARRA INFERIOR: BOTÓN PRINCIPAL DE INICIO (200 METROS) -->
    <div class="d-flex justify-center align-center z-index-top mt-1 mb-2">
      <v-btn
        id="btn-start-game"
        size="large"
        color="primary"
        class="btn-arcade px-10 py-5 text-h6 font-weight-black elevation-12 pulse-anim text-surface"
        rounded="pill"
        @click="startGame"
      >
        <v-icon icon="mdi-run-fast" size="28" class="mr-2"></v-icon>
        COMENZAR DESPERTAR ({{ gameStore.targetDistance }}m)
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
.character-select-container {
  position: relative;
  width: 100%;
  height: 100vh;
  max-height: 100vh;
  overflow-y: auto;
  background: radial-gradient(circle at 50% 30%, #151a35 0%, #080a14 100%);
}

.z-index-top {
  z-index: 10;
}

.character-title-banner {
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.25), rgba(224, 64, 251, 0.25));
  border: 1px solid rgba(0, 229, 255, 0.4);
  box-shadow: 0 4px 20px rgba(0, 229, 255, 0.3);
}

.equipment-column, .roster-column {
  width: 100%;
  max-width: 290px;
  z-index: 5;
}

.equipment-card, .character-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.2s ease;
}

.equipment-card:hover, .character-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

.selected-char {
  background: linear-gradient(90deg, rgba(0, 229, 255, 0.2), rgba(0, 229, 255, 0.05)) !important;
  border-color: #00e5ff !important;
  box-shadow: 0 0 15px rgba(0, 229, 255, 0.35);
}

.icon-orb {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
}

.perk-box, .stats-panel {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.pedestal-column {
  position: relative;
  min-height: 320px;
}

.pedestal-canvas {
  width: 100%;
  max-width: 360px;
  height: 340px;
  z-index: 2;
}

.pedestal-glow {
  position: absolute;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 1;
}

@media (max-width: 960px) {
  .pedestal-column {
    min-height: 260px;
  }
  .pedestal-canvas {
    height: 260px;
  }
}
</style>
