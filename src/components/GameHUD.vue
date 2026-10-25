<template>
  <div class="game-hud-overlay fill-height d-flex flex-column justify-space-between pa-3 pa-md-5 pointer-events-none">
    <!-- GRUPO SUPERIOR: ESTADÍSTICAS + SUB-BANNER DE ZONA PLATÓNICA (ARRIBA, SIN TAPAR EL JUEGO) -->
    <div class="top-hud-group d-flex flex-column align-center w-100">
      <!-- Fila Superior: Monedas, Multiplicador, Puntos, Distancia, Cronómetro y Pausa -->
      <div class="d-flex align-center justify-space-between flex-wrap gap-2 w-100 pointer-events-auto">
        <!-- Monedas / Chispas recolectadas -->
        <div class="hud-pill d-flex align-center px-4 py-2 rounded-pill">
          <div class="spark-coin-icon mr-2">
            <v-icon icon="mdi-octagram" color="amber-accent-2" size="22"></v-icon>
          </div>
          <span class="text-h6 font-weight-black text-amber-accent-2 font-mono">
            {{ gameStore.sparksCollected }}
          </span>
        </div>

        <!-- Centro: Multiplicador y Puntuación Total -->
        <div class="d-flex align-center gap-2">
          <div class="multiplier-badge px-3 py-1 rounded-pill">
            <span class="text-subtitle-1 font-weight-black text-glow-cyan text-primary">
              x{{ gameStore.multiplier }}
            </span>
          </div>
          <div class="hud-pill score-pill px-5 py-2 rounded-pill">
            <span class="text-h5 font-weight-black text-white font-mono letter-spacing-1">
              {{ Math.round(gameStore.score) }}
            </span>
          </div>
        </div>

        <!-- Derecha: Distancia (metros), Cronómetro y Pausa -->
        <div class="d-flex align-center gap-2">
          <div class="hud-pill d-flex align-center px-4 py-2 rounded-pill">
            <v-icon icon="mdi-map-marker-distance" color="primary" class="mr-2" size="20"></v-icon>
            <span class="text-subtitle-1 font-weight-black text-primary font-mono mr-2">
              {{ Math.floor(gameStore.distance) }}m
            </span>
            <span class="text-caption text-grey-lighten-1">/ {{ gameStore.targetDistance }}m</span>
          </div>

          <div class="hud-pill px-3 py-2 rounded-pill d-none d-sm-flex align-center">
            <v-icon icon="mdi-timer-outline" color="grey-lighten-2" class="mr-1" size="18"></v-icon>
            <span class="text-body-2 font-weight-bold font-mono text-grey-lighten-1">
              {{ gameStore.formattedTime }}
            </span>
          </div>

          <v-btn
            icon="mdi-pause"
            color="surface"
            variant="flat"
            size="small"
            rounded="circle"
            class="hud-btn elevation-4"
            @click="$emit('pause-game')"
          ></v-btn>
        </div>
      </div>

      <!-- Fila Sub-Banner: Zona Platónica y Progreso (anclado arriba, despejando la pista 3D) -->
      <div class="zone-header-container d-flex flex-column align-center mt-2 pointer-events-none">
        <div class="zone-pill px-4 py-1 rounded-pill d-flex align-center elevation-4">
          <v-icon icon="mdi-eye-circle" size="16" color="primary" class="mr-2"></v-icon>
          <span class="text-caption font-weight-black text-uppercase text-glow-cyan">
            {{ gameStore.currentZone.name }}
          </span>
        </div>
        <div class="text-caption text-grey-lighten-2 text-center mt-1 zone-subtitle text-shadow">
          {{ gameStore.currentZone.subtitle }}
        </div>

        <!-- Barra de progreso general a meta (1000m) -->
        <div class="progress-bar-container mt-1">
          <v-progress-linear
            :model-value="gameStore.progressPercent"
            color="primary"
            bg-color="rgba(255,255,255,0.2)"
            height="5"
            rounded
          ></v-progress-linear>
        </div>
      </div>
    </div>

    <!-- GRUPO INFERIOR: CONTROLES TÁCTILES Y GUÍA DE TECLADO -->
    <div class="d-flex flex-column align-center pointer-events-auto">
      <!-- Indicador / Botones de movimiento -->
      <div class="d-flex align-center justify-space-between w-100 max-w-controls px-4 mb-2">
        <!-- Mover a la Izquierda -->
        <v-btn
          icon="mdi-arrow-left-bold"
          size="x-large"
          color="primary"
          variant="tonal"
          class="control-btn elevation-6"
          rounded="circle"
          @click="$emit('move-lane', -1)"
        ></v-btn>

        <!-- Saltar -->
        <v-btn
          icon="mdi-arrow-up-bold"
          size="x-large"
          color="amber-accent-2"
          variant="tonal"
          class="control-btn jump-btn elevation-8"
          rounded="circle"
          @click="$emit('jump')"
        ></v-btn>

        <!-- Mover a la Derecha -->
        <v-btn
          icon="mdi-arrow-right-bold"
          size="x-large"
          color="primary"
          variant="tonal"
          class="control-btn elevation-6"
          rounded="circle"
          @click="$emit('move-lane', 1)"
        ></v-btn>
      </div>

      <!-- Atajos de teclado para PC -->
      <div class="keyboard-hints d-none d-md-flex align-center gap-3 text-caption text-grey-lighten-2 mb-1">
        <span><kbd class="kbd-key">A</kbd> / <kbd class="kbd-key">←</kbd> Izquierda</span>
        <span><kbd class="kbd-key">ESPACIO</kbd> / <kbd class="kbd-key">W</kbd> Saltar</span>
        <span><kbd class="kbd-key">D</kbd> / <kbd class="kbd-key">→</kbd> Derecha</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useGameStore } from "../stores/gameStore";

defineEmits(["move-lane", "jump", "pause-game"]);
const gameStore = useGameStore();
</script>

<style scoped>
.game-hud-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 20;
}

.pointer-events-none {
  pointer-events: none;
}

.pointer-events-auto {
  pointer-events: auto;
}

.top-hud-group {
  z-index: 25;
}

.hud-pill {
  background: rgba(14, 18, 36, 0.85);
  border: 1px solid rgba(0, 229, 255, 0.25);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
}

.score-pill {
  min-width: 110px;
  text-align: center;
}

.multiplier-badge {
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.3), rgba(224, 64, 251, 0.3));
  border: 1px solid #00e5ff;
}

.zone-header-container {
  opacity: 0.92;
  transition: opacity 0.3s ease;
}

.zone-pill {
  background: rgba(10, 14, 30, 0.88);
  border: 1px solid rgba(0, 229, 255, 0.3);
  backdrop-filter: blur(8px);
  padding: 3px 14px;
}

.zone-subtitle {
  font-size: 0.72rem !important;
  color: #b0bec5 !important;
}

.progress-bar-container {
  width: 180px;
}

.text-shadow {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.9);
}

.max-w-controls {
  max-width: 480px;
}

.control-btn {
  background: rgba(14, 18, 36, 0.8) !important;
  backdrop-filter: blur(8px);
  width: 64px !important;
  height: 64px !important;
  border: 2px solid rgba(0, 229, 255, 0.35);
  transition: transform 0.1s ease;
}

.control-btn:active {
  transform: scale(0.9);
}

.jump-btn {
  border-color: rgba(255, 215, 0, 0.5) !important;
  width: 72px !important;
  height: 72px !important;
}

.kbd-key {
  background: rgba(255, 255, 255, 0.15);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-weight: bold;
}
</style>
