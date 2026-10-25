<template>
  <v-dialog v-model="isOpen" max-width="540" persistent>
    <v-card class="game-over-panel text-white text-center position-relative overflow-hidden" rounded="xl">
      <!-- Glow superior de ambientación -->
      <div class="ambient-glow"></div>

      <!-- Icono de Calavera con resplandor -->
      <div class="mb-4 position-relative">
        <v-avatar size="80" class="skull-avatar elevation-12">
          <v-icon icon="mdi-skull" size="46" color="white"></v-icon>
        </v-avatar>
      </div>

      <!-- Título de Derrota -->
      <h2 class="text-h5 text-sm-h4 font-weight-black text-red-accent-2 mb-2 text-glow-red">
        DESPERTAR INTERRUMPIDO
      </h2>
      <p class="text-body-2 text-grey-lighten-2 mb-4 px-2 intro-desc">
        Las sombras y cadenas te han alcanzado temporalmente. Los filósofos no temen caer, sino no levantarse.
      </p>

      <!-- Insignia destacada del obstáculo impactado -->
      <div v-if="obstacle" class="obstacle-alert-badge py-3 px-4 rounded-xl mb-4 d-flex align-center justify-center">
        <v-icon icon="mdi-alert-octagon" color="amber-accent-2" size="24" class="mr-2 flex-shrink-0"></v-icon>
        <div class="text-left">
          <span class="text-caption text-amber-lighten-3 d-block font-weight-medium">OBSTÁCULO IMPACTADO</span>
          <span class="text-subtitle-2 font-weight-black text-amber-accent-2">
            {{ obstacle.name }}
          </span>
        </div>
      </div>

      <!-- Tarjetas de Estadísticas Espaciosas y Vivas -->
      <div class="stats-container pa-3 pa-sm-4 rounded-xl mb-5">
        <!-- Fila 1: Distancia Recorrida -->
        <div class="stat-row py-3 px-4 rounded-lg mb-2 d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <div class="icon-bubble mr-3">
              <v-icon icon="mdi-map-marker-distance" color="cyan-accent-2" size="20"></v-icon>
            </div>
            <span class="text-body-2 font-weight-medium text-grey-lighten-2">Distancia Recorrida</span>
          </div>
          <span class="text-subtitle-1 font-weight-black text-cyan-accent-2 font-mono">
            {{ Math.floor(gameStore.distance) }}m <span class="text-caption text-grey font-weight-regular">/ {{ gameStore.targetDistance }}m</span>
          </span>
        </div>

        <!-- Fila 2: Tiempo Transcurrido -->
        <div class="stat-row py-3 px-4 rounded-lg mb-2 d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <div class="icon-bubble mr-3">
              <v-icon icon="mdi-timer-outline" color="white" size="20"></v-icon>
            </div>
            <span class="text-body-2 font-weight-medium text-grey-lighten-2">Tiempo Transcurrido</span>
          </div>
          <span class="text-subtitle-1 font-weight-black text-white font-mono">
            {{ gameStore.formattedTime }}
          </span>
        </div>

        <!-- Fila 3: Puntuación Obtenida -->
        <div class="stat-row py-3 px-4 rounded-lg d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <div class="icon-bubble mr-3">
              <v-icon icon="mdi-star-circle" color="amber-accent-2" size="20"></v-icon>
            </div>
            <span class="text-body-2 font-weight-medium text-grey-lighten-2">Puntuación Total</span>
          </div>
          <span class="text-subtitle-1 font-weight-black text-amber-accent-2 font-mono">
            {{ Math.round(gameStore.score) }}
          </span>
        </div>
      </div>

      <!-- Botones de Acción con buen espaciado y presencia -->
      <div class="action-buttons d-flex flex-column">
        <v-btn
          block
          size="x-large"
          color="cyan-accent-3"
          class="btn-arcade text-surface font-weight-black mb-3 action-btn elevation-6"
          rounded="pill"
          prepend-icon="mdi-replay"
          @click="$emit('restart')"
        >
          REINTENTAR DESPERTAR
        </v-btn>

        <v-btn
          block
          size="large"
          variant="outlined"
          color="white"
          rounded="pill"
          class="action-btn-secondary"
          prepend-icon="mdi-arrow-left"
          @click="$emit('go-menu')"
        >
          SELECCIÓN DE PERSONAJE
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from "vue";
import { useGameStore } from "../stores/gameStore";

const props = defineProps({
  modelValue: Boolean,
  obstacle: Object
});
const emit = defineEmits(["update:modelValue", "restart", "go-menu"]);

const gameStore = useGameStore();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
});
</script>

<style scoped>
.game-over-panel {
  padding: 38px 48px !important;
  background: linear-gradient(160deg, rgba(26, 18, 32, 0.96) 0%, rgba(14, 12, 22, 0.98) 100%) !important;
  backdrop-filter: blur(18px) !important;
  -webkit-backdrop-filter: blur(18px) !important;
  border: 1px solid rgba(255, 82, 82, 0.35) !important;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.75), 0 0 35px rgba(255, 82, 82, 0.2) !important;
}

@media (max-width: 600px) {
  .game-over-panel {
    padding: 28px 20px !important;
  }
}

.ambient-glow {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  width: 240px;
  height: 120px;
  background: radial-gradient(circle, rgba(255, 82, 82, 0.35) 0%, transparent 70%);
  pointer-events: none;
}

.skull-avatar {
  background: linear-gradient(135deg, #d32f2f, #b71c1c) !important;
  box-shadow: 0 0 25px rgba(255, 82, 82, 0.55), inset 0 2px 4px rgba(255, 255, 255, 0.3) !important;
  border: 2px solid rgba(255, 128, 128, 0.6);
}

.text-glow-red {
  text-shadow: 0 0 16px rgba(255, 82, 82, 0.75), 0 0 30px rgba(255, 82, 82, 0.35);
  letter-spacing: 0.8px;
}

.intro-desc {
  line-height: 1.55;
}

.obstacle-alert-badge {
  background: linear-gradient(90deg, rgba(255, 171, 0, 0.18) 0%, rgba(255, 82, 82, 0.16) 100%);
  border: 1px solid rgba(255, 171, 0, 0.55);
  box-shadow: 0 4px 16px rgba(255, 171, 0, 0.12);
}

.stats-container {
  background: rgba(8, 7, 14, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.4);
}

.stat-row {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  transition: all 0.2s ease;
}

.stat-row:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.icon-bubble {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn {
  height: 52px !important;
  letter-spacing: 1px;
}

.action-btn-secondary {
  height: 46px !important;
  border-color: rgba(255, 255, 255, 0.25) !important;
  background: rgba(255, 255, 255, 0.04);
  transition: all 0.2s ease;
}

.action-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.4) !important;
}
</style>
