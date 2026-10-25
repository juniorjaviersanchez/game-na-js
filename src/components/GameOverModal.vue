<template>
  <v-dialog v-model="isOpen" max-width="500" persistent>
    <v-card class="glass-panel text-white pa-6 text-center" rounded="xl">
      <div class="mb-3">
        <v-avatar color="error" size="72" class="elevation-10">
          <v-icon icon="mdi-skull" size="48" color="surface"></v-icon>
        </v-avatar>
      </div>

      <h2 class="text-h5 font-weight-black text-red-accent-2 mb-1">
        DESPERTAR INTERRUMPIDO
      </h2>
      <p class="text-body-2 text-grey-lighten-2 mb-3">
        Las sombras y cadenas te han alcanzado temporalmente. Los filósofos no temen caer, sino no levantarse.
      </p>

      <!-- Detalle del obstáculo impactado -->
      <div v-if="obstacle" class="obstacle-alert-badge pa-2 rounded-lg mb-3 d-flex align-center justify-center">
        <v-icon icon="mdi-alert-octagon" color="amber-accent-2" size="20" class="mr-2"></v-icon>
        <span class="text-caption font-weight-bold text-amber-accent-2">
          Causa de derrota: {{ obstacle.name }}
        </span>
      </div>

      <div class="stats-box pa-4 rounded-xl mb-4 bg-black-opacity">
        <div class="d-flex justify-space-between mb-2">
          <span class="text-caption text-grey-lighten-2">Distancia Recorrida:</span>
          <span class="font-weight-black text-primary font-mono">
            {{ Math.floor(gameStore.distance) }}m / {{ gameStore.targetDistance }}m
          </span>
        </div>
        <div class="d-flex justify-space-between mb-2">
          <span class="text-caption text-grey-lighten-2">Tiempo Transcurrido:</span>
          <span class="font-weight-black text-white font-mono">{{ gameStore.formattedTime }}</span>
        </div>
        <div class="d-flex justify-space-between">
          <span class="text-caption text-grey-lighten-2">Puntuación:</span>
          <span class="font-weight-black text-amber-accent-2 font-mono">{{ Math.round(gameStore.score) }}</span>
        </div>
      </div>

      <div class="d-flex flex-column gap-2">
        <v-btn
          block
          size="large"
          color="primary"
          class="btn-arcade text-surface font-weight-black"
          rounded="pill"
          prepend-icon="mdi-replay"
          @click="$emit('restart')"
        >
          REINTENTAR DESPERTAR
        </v-btn>

        <v-btn
          variant="tonal"
          color="white"
          rounded="pill"
          class="mt-2"
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
.bg-black-opacity {
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.obstacle-alert-badge {
  background: rgba(255, 171, 0, 0.15);
  border: 1px solid rgba(255, 171, 0, 0.4);
}
</style>
