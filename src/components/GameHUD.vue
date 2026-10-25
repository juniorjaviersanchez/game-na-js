<template>
  <div class="game-hud-overlay fill-height d-flex flex-column justify-space-between pa-3 pa-md-5 pointer-events-none">
    <!-- GRUPO SUPERIOR: ESTADÍSTICAS + SUB-BANNER DE ZONA PLATÓNICA -->
    <div class="top-hud-group d-flex flex-column align-center w-100">
      <!-- Fila Superior: Monedas, Multiplicador, Puntos, Distancia, Cronómetro y Pausa -->
      <div class="hud-top-bar d-flex align-center justify-space-between w-100 pointer-events-auto">
        <!-- 1. Izquierda: Monedas / Chispas recolectadas con ancho estable y padding -->
        <div class="hud-pill spark-pill d-flex align-center justify-center rounded-pill">
          <v-icon icon="mdi-octagram" color="amber-accent-2" size="22" class="mr-2"></v-icon>
          <span class="spark-count-text font-weight-black text-amber-accent-2 font-mono">
            {{ gameStore.sparksCollected }}
          </span>
        </div>

        <!-- 2. Centro: Multiplicador y Puntuación Total con anchos fijos y centrado perfecto -->
        <div class="d-flex align-center gap-2 score-center-group">
          <div class="multiplier-badge d-flex align-center justify-center rounded-pill">
            <span class="text-subtitle-1 font-weight-black text-glow-cyan text-primary">
              x{{ gameStore.multiplier }}
            </span>
          </div>
          <div class="hud-pill score-pill d-flex align-center justify-center rounded-pill">
            <span class="score-number-text font-weight-black text-white font-mono">
              {{ Math.round(gameStore.score) }}
            </span>
          </div>
        </div>

        <!-- 3. Derecha: Distancia (metros), Cronómetro y Pausa con anchos fijos y espaciado -->
        <div class="d-flex align-center gap-3 right-hud-group">
          <!-- Píldora de Distancia -->
          <div class="hud-pill distance-pill d-flex align-center justify-center rounded-pill">
            <v-icon icon="mdi-map-marker-distance" color="primary" class="mr-2" size="20"></v-icon>
            <span class="distance-current text-primary font-weight-black font-mono">
              {{ Math.floor(gameStore.distance) }}m
            </span>
            <span class="distance-target text-grey-lighten-1 font-mono ml-1">
              / {{ gameStore.targetDistance }}m
            </span>
          </div>

          <!-- Píldora de Cronómetro -->
          <div class="hud-pill timer-pill d-none d-sm-flex align-center justify-center rounded-pill">
            <v-icon icon="mdi-timer-outline" color="grey-lighten-2" class="mr-2" size="18"></v-icon>
            <span class="timer-text font-weight-bold font-mono text-grey-lighten-1">
              {{ gameStore.formattedTime }}
            </span>
          </div>

          <!-- Botón de Pausa -->
          <v-btn
            icon="mdi-pause"
            color="surface"
            variant="flat"
            size="default"
            rounded="circle"
            class="hud-pause-btn elevation-4"
            title="Pausar Juego"
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
  padding: 4px 10px;
}

.hud-top-bar {
  padding: 0 4px;
}

/* Base de píldoras HUD con padding uniforme y desenfoque */
.hud-pill {
  background: rgba(14, 18, 36, 0.88);
  border: 1px solid rgba(0, 229, 255, 0.3);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.55);
}

/* 1. Píldora de Chispas (Izquierda) */
.spark-pill {
  min-width: 105px;
  height: 42px;
  padding: 0 16px;
  user-select: none;
}

.spark-count-text {
  font-size: 1.15rem;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

/* 2. Grupo Central: Multiplicador y Puntos */
.score-center-group {
  gap: 8px !important;
}

.multiplier-badge {
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.3), rgba(224, 64, 251, 0.3));
  border: 1px solid #00e5ff;
  min-width: 48px;
  height: 42px;
  padding: 0 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 229, 255, 0.25);
  user-select: none;
}

.score-pill {
  width: 145px;
  min-width: 145px;
  height: 42px;
  padding: 0 18px;
  text-align: center;
  user-select: none;
}

.score-number-text {
  font-size: 1.3rem;
  font-variant-numeric: tabular-nums;
  letter-spacing: 1px;
  line-height: 1;
}

/* 3. Grupo Derecho: Distancia, Tiempo y Pausa */
.right-hud-group {
  gap: 12px !important;
}

.distance-pill {
  min-width: 175px;
  height: 42px;
  padding: 0 16px;
  user-select: none;
}

.distance-current {
  font-size: 1.05rem;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.distance-target {
  font-size: 0.85rem;
  line-height: 1;
}

.timer-pill {
  min-width: 115px;
  height: 42px;
  padding: 0 14px;
  user-select: none;
}

.timer-text {
  font-size: 0.95rem;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.hud-pause-btn {
  width: 42px !important;
  height: 42px !important;
  min-width: 42px !important;
  transition: transform 0.2s ease;
}

.hud-pause-btn:hover {
  transform: scale(1.08);
}

/* Sub-banner de Zona */
.zone-header-container {
  opacity: 0.92;
  transition: opacity 0.3s ease;
}

.zone-pill {
  background: rgba(10, 14, 30, 0.88);
  border: 1px solid rgba(0, 229, 255, 0.3);
  backdrop-filter: blur(8px);
  padding: 4px 16px;
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
