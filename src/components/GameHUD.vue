<template>
  <div class="game-hud-overlay fill-height d-flex flex-column justify-space-between pa-3 pa-md-4 pointer-events-none">
    <!-- GRUPO SUPERIOR: BARRA PRINCIPAL + ZONA PERFECTAMENTE CENTRADA -->
    <div class="top-hud-group w-100 position-relative pointer-events-none">
      <div class="hud-top-bar d-flex align-start justify-space-between w-100 pointer-events-auto">
        <!-- 1. LADO IZQUIERDO: Monedas + Multiplicador + Puntuación (todos juntos) -->
        <div class="d-flex align-center gap-2 left-hud-group">
          <!-- Monedas / Chispas recolectadas -->
          <div class="hud-pill spark-pill d-flex align-center justify-center rounded-pill">
            <v-icon icon="mdi-octagram" color="amber-accent-2" size="20" class="mr-2"></v-icon>
            <span class="spark-count-text font-weight-black text-amber-accent-2 font-mono">
              {{ gameStore.sparksCollected }}
            </span>
          </div>

          <!-- Multiplicador (x1, x2...) -->
          <div class="multiplier-badge d-flex align-center justify-center rounded-pill">
            <span class="multiplier-text font-weight-black text-glow-cyan text-primary font-mono">
              x{{ gameStore.multiplier }}
            </span>
          </div>

          <!-- Puntuación Total con ancho fijo y centrado -->
          <div class="hud-pill score-pill d-flex align-center justify-center rounded-pill">
            <span class="score-number-text font-weight-black text-white font-mono">
              {{ Math.round(gameStore.score) }}
            </span>
          </div>
        </div>

        <!-- 2. CENTRO EXACTO: Zona Platónica y Progreso (Absoluto al 50% de la pantalla) -->
        <div class="hud-center-zone d-flex flex-column align-center pointer-events-none">
          <div class="zone-pill px-4 py-1 rounded-pill d-flex align-center elevation-4">
            <v-icon icon="mdi-eye-circle" size="16" color="primary" class="mr-2"></v-icon>
            <span class="text-caption font-weight-black text-uppercase text-glow-cyan zone-title">
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

        <!-- 3. LADO DERECHO: Distancia (metros), Cronómetro y Pausa -->
        <div class="d-flex align-center gap-2 right-hud-group">
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
  padding: 4px 6px;
  position: relative;
}

.hud-top-bar {
  position: relative;
  width: 100%;
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

/* 1. Lado Izquierdo: Monedas + Multiplicador + Puntuación */
.left-hud-group {
  gap: 8px !important;
  z-index: 28;
}

.spark-pill {
  min-width: 95px;
  height: 42px;
  padding: 0 14px;
  user-select: none;
}

.spark-count-text {
  font-size: 1.15rem;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.multiplier-badge {
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.3), rgba(224, 64, 251, 0.3));
  border: 1px solid #00e5ff;
  min-width: 48px;
  height: 42px;
  padding: 0 10px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 229, 255, 0.25);
  user-select: none;
}

.multiplier-text {
  font-size: 1.05rem;
  line-height: 1;
}

.score-pill {
  width: 130px;
  min-width: 130px;
  height: 42px;
  padding: 0 16px;
  text-align: center;
  user-select: none;
}

.score-number-text {
  font-size: 1.25rem;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.8px;
  line-height: 1;
}

/* 2. Centro Matemático Exacto (50% de la pantalla) */
.hud-center-zone {
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  z-index: 26;
  opacity: 0.95;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.zone-pill {
  background: rgba(10, 14, 30, 0.9);
  border: 1px solid rgba(0, 229, 255, 0.35);
  backdrop-filter: blur(10px);
  padding: 4px 18px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.6);
}

.zone-title {
  letter-spacing: 0.6px;
}

.zone-subtitle {
  font-size: 0.72rem !important;
  color: #b0bec5 !important;
}

.progress-bar-container {
  width: 180px;
}

/* 3. Lado Derecho: Distancia, Tiempo y Pausa */
.right-hud-group {
  gap: 10px !important;
  z-index: 28;
}

.distance-pill {
  min-width: 170px;
  height: 42px;
  padding: 0 14px;
  user-select: none;
}

.distance-current {
  font-size: 1.02rem;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.distance-target {
  font-size: 0.82rem;
  line-height: 1;
}

.timer-pill {
  min-width: 110px;
  height: 42px;
  padding: 0 12px;
  user-select: none;
}

.timer-text {
  font-size: 0.92rem;
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
