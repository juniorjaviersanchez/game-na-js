<template>
  <v-dialog v-model="isOpen" max-width="520">
    <v-card class="glass-panel text-white pa-6" rounded="xl">
      <div class="d-flex align-center justify-space-between mb-4">
        <div class="d-flex align-center">
          <v-avatar color="primary" size="40" class="mr-3">
            <v-icon icon="mdi-tune" color="surface"></v-icon>
          </v-avatar>
          <h2 class="text-h6 font-weight-black text-glow-cyan">CONFIGURACIÓN Y PARÁMETROS</h2>
        </div>
        <v-btn icon="mdi-close" variant="text" size="small" @click="isOpen = false"></v-btn>
      </div>

      <v-divider class="my-2 border-opacity-25"></v-divider>

      <!-- 1. PARAMETRIZACIÓN DEL JUEGO -->
      <div class="mb-4">
        <div class="text-subtitle-2 font-weight-bold text-amber-accent-2 mb-2 d-flex align-center">
          <v-icon icon="mdi-flag-checkered" size="18" class="mr-1"></v-icon>
          PARÁMETROS DE LA CARRERA
        </div>

        <!-- Distancia Meta (por defecto 1000m) -->
        <div class="mb-3">
          <div class="d-flex justify-space-between text-body-2 mb-1">
            <span>Distancia Total de la Carrera:</span>
            <span class="font-weight-black text-primary">{{ gameStore.targetDistance }} metros</span>
          </div>
          <v-slider
            v-model="gameStore.targetDistance"
            :min="200"
            :max="2000"
            :step="100"
            thumb-label="always"
            color="primary"
            track-color="rgba(255,255,255,0.2)"
            hide-details
          ></v-slider>
          <div class="text-caption text-grey-lighten-2 mt-1">
            (1000m es el valor oficial del Mito de la Caverna)
          </div>
        </div>

        <!-- Frecuencia de Cajas (cada 100m) -->
        <div class="mb-3">
          <div class="d-flex justify-space-between text-body-2 mb-1">
            <span>Frecuencia de Cajas Místicas:</span>
            <span class="font-weight-black text-secondary">Cada {{ gameStore.boxInterval }} metros</span>
          </div>
          <v-slider
            v-model="gameStore.boxInterval"
            :min="50"
            :max="250"
            :step="25"
            thumb-label="always"
            color="secondary"
            track-color="rgba(255,255,255,0.2)"
            hide-details
          ></v-slider>
          <div class="text-caption text-grey-lighten-2 mt-1">
            (Aparecen 3 Cajas Místicas simultáneas cada 100 metros)
          </div>
        </div>
      </div>

      <v-divider class="my-3 border-opacity-25"></v-divider>

      <!-- 2. CONTROL DE AUDIO Y EFECTOS SONOROS (WEB AUDIO API) -->
      <div class="mb-4">
        <div class="d-flex justify-space-between align-center mb-2">
          <div class="text-subtitle-2 font-weight-bold text-cyan-accent-2 d-flex align-center">
            <v-icon icon="mdi-volume-high" size="18" class="mr-1"></v-icon>
            EFECTOS DE SONIDO Y AMBIENTE
          </div>
          <v-switch
            v-model="isMutedToggle"
            color="primary"
            density="compact"
            hide-details
            :label="isMutedToggle ? 'Silenciado' : 'Activo'"
          ></v-switch>
        </div>

        <!-- Volumen SFX -->
        <div class="mb-3">
          <div class="d-flex justify-space-between text-caption mb-1">
            <span>Volumen Efectos de Sonido (Saltos, Cajas, Aciertos):</span>
            <span class="font-weight-bold">{{ Math.round(sfxVol * 100) }}%</span>
          </div>
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

        <!-- Volumen Música / Ambiente Procedural -->
        <div class="mb-3">
          <div class="d-flex justify-space-between text-caption mb-1">
            <span>Volumen Música Ambiental (Caverna a Sol):</span>
            <span class="font-weight-bold">{{ Math.round(musicVol * 100) }}%</span>
          </div>
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

        <!-- Botones de Prueba de Sonido -->
        <div class="d-flex gap-2 flex-wrap mt-2">
          <v-btn size="x-small" variant="tonal" color="primary" @click="soundManager.playJump()">
            Probar Salto
          </v-btn>
          <v-btn size="x-small" variant="tonal" color="amber-accent-2" @click="soundManager.playCollectSpark()">
            Probar Chispa
          </v-btn>
          <v-btn size="x-small" variant="tonal" color="secondary" @click="soundManager.playBoxShatter()">
            Probar Ruptura Caja
          </v-btn>
          <v-btn size="x-small" variant="tonal" color="success" @click="soundManager.playCorrect()">
            Probar Acierto
          </v-btn>
        </div>
      </div>

      <v-divider class="my-3 border-opacity-25"></v-divider>

      <v-btn
        block
        size="large"
        color="primary"
        class="btn-arcade text-surface font-weight-black"
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
