<template>
  <v-dialog v-model="isOpen" max-width="580">
    <v-card class="glass-panel text-white modal-config-card" rounded="xl">
      <!-- Encabezado -->
      <div class="d-flex align-center justify-space-between mb-3">
        <div class="d-flex align-center">
          <v-avatar color="primary" size="42" class="mr-3 elevation-4">
            <v-icon icon="mdi-tune" color="surface" size="24"></v-icon>
          </v-avatar>
          <h2 class="text-h6 font-weight-black text-glow-cyan letter-spacing-1">
            CONFIGURACIÓN Y PARÁMETROS
          </h2>
        </div>
        <v-btn icon="mdi-close" variant="text" size="small" @click="isOpen = false"></v-btn>
      </div>

      <v-divider class="mb-4 border-opacity-25"></v-divider>

      <!-- 1. PARAMETRIZACIÓN DEL JUEGO -->
      <div class="config-section mb-4">
        <div class="section-title text-amber-accent-2 d-flex align-center mb-3">
          <v-icon icon="mdi-flag-checkered" size="20" class="mr-2"></v-icon>
          <span>PARÁMETROS DE LA CARRERA</span>
        </div>

        <!-- Distancia Meta (por defecto 1000m) -->
        <div class="slider-field-group mb-4">
          <div class="d-flex justify-space-between align-center field-label-row">
            <span class="field-label-text">Distancia Total de la Carrera:</span>
            <span class="field-value-badge badge-primary">{{ gameStore.targetDistance }} metros</span>
          </div>
          <div class="slider-wrapper my-2">
            <v-slider
              v-model="gameStore.targetDistance"
              :min="200"
              :max="2000"
              :step="100"
              color="primary"
              track-color="rgba(255,255,255,0.2)"
              hide-details
            ></v-slider>
          </div>
          <div class="field-helper-text">
            (1000m es el valor oficial del Mito de la Caverna)
          </div>
        </div>

        <!-- Frecuencia de Cajas (cada 100m) -->
        <div class="slider-field-group mb-2">
          <div class="d-flex justify-space-between align-center field-label-row">
            <span class="field-label-text">Frecuencia de Cajas Místicas:</span>
            <span class="field-value-badge badge-secondary">Cada {{ gameStore.boxInterval }} metros</span>
          </div>
          <div class="slider-wrapper my-2">
            <v-slider
              v-model="gameStore.boxInterval"
              :min="50"
              :max="250"
              :step="25"
              color="secondary"
              track-color="rgba(255,255,255,0.2)"
              hide-details
            ></v-slider>
          </div>
          <div class="field-helper-text">
            (Aparecen 3 Cajas Místicas simultáneas cada {{ gameStore.boxInterval }} metros)
          </div>
        </div>
      </div>

      <v-divider class="my-4 border-opacity-25"></v-divider>

      <!-- 2. CONTROL DE AUDIO Y EFECTOS SONOROS -->
      <div class="config-section mb-4">
        <div class="d-flex justify-space-between align-center mb-3">
          <div class="section-title text-cyan-accent-2 d-flex align-center">
            <v-icon icon="mdi-volume-high" size="20" class="mr-2"></v-icon>
            <span>EFECTOS DE SONIDO Y AMBIENTE</span>
          </div>
          <v-switch
            v-model="isMutedToggle"
            color="primary"
            density="compact"
            hide-details
            class="sound-switch"
            :label="isMutedToggle ? 'Silenciado' : 'Activo'"
          ></v-switch>
        </div>

        <!-- Volumen SFX -->
        <div class="slider-field-group mb-3">
          <div class="d-flex justify-space-between align-center field-label-row">
            <span class="field-label-text">Volumen Efectos de Sonido (Saltos, Cajas, Aciertos):</span>
            <span class="field-value-pct">{{ Math.round(sfxVol * 100) }}%</span>
          </div>
          <div class="slider-wrapper my-2">
            <v-slider
              v-model="sfxVol"
              :min="0"
              :max="1"
              :step="0.05"
              color="primary"
              track-color="rgba(255,255,255,0.2)"
              hide-details
              @update:model-value="updateVolumes"
            ></v-slider>
          </div>
        </div>

        <!-- Volumen Música / Ambiente Procedural -->
        <div class="slider-field-group mb-3">
          <div class="d-flex justify-space-between align-center field-label-row">
            <span class="field-label-text">Volumen Música Ambiental (Caverna a Sol):</span>
            <span class="field-value-pct">{{ Math.round(musicVol * 100) }}%</span>
          </div>
          <div class="slider-wrapper my-2">
            <v-slider
              v-model="musicVol"
              :min="0"
              :max="1"
              :step="0.05"
              color="secondary"
              track-color="rgba(255,255,255,0.2)"
              hide-details
              @update:model-value="updateVolumes"
            ></v-slider>
          </div>
        </div>

        <!-- Botones de Prueba de Sonido con separación y estilo de píldoras -->
        <div class="sound-test-container mt-3">
          <div class="sound-test-label text-grey-lighten-2 mb-2">Probar Efectos Acústicos:</div>
          <div class="d-flex flex-wrap gap-2">
            <button
              type="button"
              class="sfx-chip-btn sfx-cyan"
              @click="soundManager.playJump()"
            >
              <v-icon icon="mdi-arrow-up-bold" size="15" class="mr-1"></v-icon>
              Salto
            </button>

            <button
              type="button"
              class="sfx-chip-btn sfx-gold"
              @click="soundManager.playCollectSpark()"
            >
              <v-icon icon="mdi-octagram" size="15" class="mr-1"></v-icon>
              Chispa
            </button>

            <button
              type="button"
              class="sfx-chip-btn sfx-magenta"
              @click="soundManager.playBoxShatter()"
            >
              <v-icon icon="mdi-cube-scan" size="15" class="mr-1"></v-icon>
              Ruptura Caja
            </button>

            <button
              type="button"
              class="sfx-chip-btn sfx-green"
              @click="soundManager.playCorrect()"
            >
              <v-icon icon="mdi-check-bold" size="15" class="mr-1"></v-icon>
              Acierto
            </button>
          </div>
        </div>
      </div>

      <v-divider class="my-4 border-opacity-25"></v-divider>

      <!-- Botón de Guardar y Cerrar -->
      <v-btn
        block
        size="large"
        color="primary"
        class="btn-arcade text-surface font-weight-black btn-save-config mt-2"
        rounded="pill"
        @click="isOpen = false"
      >
        GUARDAR Y CERRAR
      </v-btn>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from "vue";
import { useGameStore } from "../stores/gameStore";
import soundManager from "../audio/SoundManager";

const props = defineProps({
  modelValue: Boolean
});
const emit = defineEmits(["update:modelValue"]);

const gameStore = useGameStore();

const sfxVol = ref(gameStore.sfxVolume);
const musicVol = ref(gameStore.musicVolume);

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
});

const isMutedToggle = computed({
  get: () => gameStore.isMuted,
  set: () => gameStore.toggleMute()
});

const updateVolumes = () => {
  gameStore.setAudioVolumes(sfxVol.value, musicVol.value);
};
</script>

<style scoped>
.modal-config-card {
  padding: 24px 28px !important;
}

.section-title {
  font-size: 0.88rem;
  font-weight: 800;
  letter-spacing: 0.8px;
}

.field-label-row {
  margin-bottom: 4px;
}

.field-label-text {
  font-size: 0.88rem;
  color: #eceff1;
}

.field-value-badge {
  font-size: 0.85rem;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 999px;
  font-family: monospace;
}

.badge-primary {
  background: rgba(0, 229, 255, 0.15);
  color: #00e5ff;
  border: 1px solid rgba(0, 229, 255, 0.4);
}

.badge-secondary {
  background: rgba(224, 64, 251, 0.15);
  color: #e040fb;
  border: 1px solid rgba(224, 64, 251, 0.4);
}

.field-value-pct {
  font-size: 0.9rem;
  font-weight: 800;
  color: #ffffff;
  font-family: monospace;
}

.slider-wrapper {
  padding: 0 4px;
}

.field-helper-text {
  font-size: 0.76rem;
  color: #90a4ae;
  margin-top: 2px;
}

.sound-test-label {
  font-size: 0.76rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Píldoras de botones de prueba de sonido */
.sfx-chip-btn {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  user-select: none;
}

.sfx-chip-btn:hover {
  transform: translateY(-1px);
}

.sfx-chip-btn:active {
  transform: translateY(1px) scale(0.97);
}

.sfx-cyan {
  background: rgba(0, 229, 255, 0.12);
  color: #00e5ff;
  border-color: rgba(0, 229, 255, 0.35);
}
.sfx-cyan:hover {
  background: rgba(0, 229, 255, 0.22);
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.4);
}

.sfx-gold {
  background: rgba(255, 215, 0, 0.12);
  color: #ffd700;
  border-color: rgba(255, 215, 0, 0.35);
}
.sfx-gold:hover {
  background: rgba(255, 215, 0, 0.22);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
}

.sfx-magenta {
  background: rgba(224, 64, 251, 0.12);
  color: #e040fb;
  border-color: rgba(224, 64, 251, 0.35);
}
.sfx-magenta:hover {
  background: rgba(224, 64, 251, 0.22);
  box-shadow: 0 0 10px rgba(224, 64, 251, 0.4);
}

.sfx-green {
  background: rgba(0, 230, 118, 0.12);
  color: #00e676;
  border-color: rgba(0, 230, 118, 0.35);
}
.sfx-green:hover {
  background: rgba(0, 230, 118, 0.22);
  box-shadow: 0 0 10px rgba(0, 230, 118, 0.4);
}

.btn-save-config {
  height: 48px !important;
  letter-spacing: 1.2px !important;
  font-size: 0.95rem !important;
}
</style>
