<template>
  <v-dialog v-model="isOpen" max-width="500" persistent>
    <v-card class="pause-panel text-white text-center position-relative overflow-hidden" rounded="xl">
      <!-- Glow superior de ambientación cian -->
      <div class="ambient-glow-cyan"></div>

      <!-- Icono de Pausa con resplandor -->
      <div class="mb-4 position-relative">
        <v-avatar size="76" class="pause-avatar elevation-10">
          <v-icon icon="mdi-pause" size="44" color="white"></v-icon>
        </v-avatar>
      </div>

      <!-- Título de Pausa -->
      <h2 class="text-h4 font-weight-black text-glow-cyan mb-2">
        JUEGO EN PAUSA
      </h2>
      <p class="text-body-2 text-grey-lighten-2 mb-5 px-2 pause-subtitle">
        El viaje filosófico está suspendido. ¿Deseas reanudar tu carrera o regresar?
      </p>

      <!-- Grupo de los 3 Botones Solicitados -->
      <div class="pause-actions d-flex flex-column">
        <!-- 1. CONTINUAR -->
        <v-btn
          block
          size="x-large"
          color="cyan-accent-3"
          class="btn-arcade text-surface font-weight-black mb-3 action-btn elevation-6"
          rounded="pill"
          prepend-icon="mdi-play"
          @click="$emit('resume')"
        >
          CONTINUAR
        </v-btn>

        <!-- 2. VOLVER A JUGAR -->
        <v-btn
          block
          size="large"
          color="amber-accent-2"
          variant="tonal"
          class="btn-arcade text-amber-accent-2 font-weight-black mb-3 action-btn-restart"
          rounded="pill"
          prepend-icon="mdi-replay"
          @click="$emit('restart')"
        >
          VOLVER A JUGAR
        </v-btn>

        <!-- 3. SELECCIÓN DE PERSONAJE -->
        <v-btn
          block
          size="large"
          variant="outlined"
          color="white"
          rounded="pill"
          class="action-btn-menu font-weight-bold"
          prepend-icon="mdi-account-group"
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

const props = defineProps({
  modelValue: Boolean
});
const emit = defineEmits(["update:modelValue", "resume", "restart", "go-menu"]);

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
});
</script>

<style scoped>
.pause-panel {
  padding: 38px 48px !important;
  background: linear-gradient(160deg, rgba(16, 22, 38, 0.96) 0%, rgba(10, 14, 24, 0.98) 100%) !important;
  backdrop-filter: blur(18px) !important;
  -webkit-backdrop-filter: blur(18px) !important;
  border: 1px solid rgba(0, 229, 255, 0.35) !important;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.75), 0 0 35px rgba(0, 229, 255, 0.2) !important;
}

@media (max-width: 600px) {
  .pause-panel {
    padding: 28px 20px !important;
  }
}

.ambient-glow-cyan {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  width: 240px;
  height: 120px;
  background: radial-gradient(circle, rgba(0, 229, 255, 0.35) 0%, transparent 70%);
  pointer-events: none;
}

.pause-avatar {
  background: linear-gradient(135deg, #00b0ff, #0091ea) !important;
  box-shadow: 0 0 25px rgba(0, 229, 255, 0.55), inset 0 2px 4px rgba(255, 255, 255, 0.3) !important;
  border: 2px solid rgba(128, 222, 234, 0.6);
}

.pause-subtitle {
  line-height: 1.5;
}

.action-btn {
  height: 52px !important;
  letter-spacing: 1.2px;
}

.action-btn-restart {
  height: 48px !important;
  background: rgba(255, 171, 0, 0.12) !important;
  border: 1px solid rgba(255, 171, 0, 0.35) !important;
  letter-spacing: 1px;
  transition: all 0.2s ease;
}

.action-btn-restart:hover {
  background: rgba(255, 171, 0, 0.22) !important;
  border-color: rgba(255, 171, 0, 0.6) !important;
  transform: translateY(-1px);
}

.action-btn-menu {
  height: 46px !important;
  border-color: rgba(255, 255, 255, 0.25) !important;
  background: rgba(255, 255, 255, 0.04);
  letter-spacing: 0.8px;
  transition: all 0.2s ease;
}

.action-btn-menu:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.45) !important;
}
</style>
