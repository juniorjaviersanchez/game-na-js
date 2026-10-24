<template>
  <v-dialog v-model="isOpen" max-width="580" persistent>
    <v-card class="glass-panel-gold pa-6 pa-md-8 text-white text-center position-relative overflow-hidden" rounded="xl">
      <!-- Icono de Victoria Solar -->
      <div class="mb-3">
        <v-avatar color="amber" size="84" class="elevation-12 pulse-anim">
          <v-icon icon="mdi-white-balance-sunny" size="56" color="surface"></v-icon>
        </v-avatar>
      </div>

      <h1 class="text-h4 text-md-h3 font-weight-black text-glow-gold mb-1">
        ¡EL DESPERTAR SUPREMO!
      </h1>
      <p class="text-subtitle-1 text-amber-accent-2 font-weight-bold mb-4">
        Has recorrido los {{ gameStore.targetDistance }} metros y salido victorioso de la Caverna de Platón.
      </p>

      <!-- Panel de Estadísticas y Récord -->
      <div class="stats-card pa-4 rounded-xl mb-4">
        <v-row dense>
          <!-- Tiempo Oficial (Criterio de Ranking) -->
          <v-col cols="6">
            <div class="stat-box pa-3 rounded-lg">
              <v-icon icon="mdi-timer-outline" color="primary" size="28"></v-icon>
              <div class="text-caption text-grey-lighten-2 mt-1">TIEMPO FINAL</div>
              <div class="text-h5 font-weight-black text-primary font-mono">
                {{ gameStore.formattedTime }}
              </div>
            </div>
          </v-col>

          <!-- Puntuación Final -->
          <v-col cols="6">
            <div class="stat-box pa-3 rounded-lg">
              <v-icon icon="mdi-star-circle" color="amber-accent-2" size="28"></v-icon>
              <div class="text-caption text-grey-lighten-2 mt-1">PUNTUACIÓN</div>
              <div class="text-h5 font-weight-black text-amber-accent-2 font-mono">
                {{ Math.round(gameStore.score) }}
              </div>
            </div>
          </v-col>

          <!-- Chispas Atrapadas -->
          <v-col cols="6" class="mt-2">
            <div class="stat-box pa-2 rounded-lg">
              <div class="text-caption text-grey-lighten-2">Chispas de Sabiduría:</div>
              <div class="text-subtitle-1 font-weight-bold text-white">
                {{ gameStore.sparksCollected }} recolectadas
              </div>
            </div>
          </v-col>

          <!-- Aciertos en Cajas -->
          <v-col cols="6" class="mt-2">
            <div class="stat-box pa-2 rounded-lg">
              <div class="text-caption text-grey-lighten-2">Dilemas Resueltos:</div>
              <div class="text-subtitle-1 font-weight-bold text-white">
                {{ questionStore.totalCorrect }} / {{ questionStore.totalAnswered }} acertadas
              </div>
            </div>
          </v-col>
        </v-row>
      </div>

      <!-- Título Filosófico Otorgado -->
      <div class="rank-award-box pa-3 rounded-lg mb-5 d-flex align-center justify-center">
        <v-icon icon="mdi-laurel-wreath" color="amber" size="32" class="mr-2"></v-icon>
        <div>
          <span class="text-caption text-grey-lighten-2 d-block">RANGO FILOSÓFICO OBTENIDO:</span>
          <span class="text-h6 font-weight-black text-amber-accent-2 text-uppercase">
            {{ userRankTitle }}
          </span>
        </div>
      </div>

      <!-- Botones de Acción -->
      <div class="d-flex flex-column gap-2">
        <v-btn
          size="large"
          color="amber-darken-1"
          class="btn-arcade text-surface font-weight-black elevation-6"
          rounded="pill"
          prepend-icon="mdi-trophy"
          @click="$emit('open-leaderboard')"
        >
          VER MI POSICIÓN EN EL RANKING
        </v-btn>

        <div class="d-flex gap-2 mt-2">
          <v-btn
            variant="tonal"
            color="white"
            class="flex-grow-1"
            rounded="pill"
            prepend-icon="mdi-replay"
            @click="$emit('restart-race')"
          >
            VOLVER A JUGAR
          </v-btn>
          <v-btn
            variant="outlined"
            color="primary"
            class="flex-grow-1"
            rounded="pill"
            prepend-icon="mdi-home"
            @click="$emit('go-menu')"
          >
            SELECCIÓN PERSONAJE
          </v-btn>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, watch } from "vue";
import confetti from "canvas-confetti";
import { useGameStore } from "../stores/gameStore";
import { useQuestionStore } from "../stores/questionStore";
import { useUserStore } from "../stores/userStore";
import { useLeaderboardStore } from "../stores/leaderboardStore";

const props = defineProps({
  modelValue: Boolean
});
const emit = defineEmits(["update:modelValue", "restart-race", "go-menu", "open-leaderboard"]);

const gameStore = useGameStore();
const questionStore = useQuestionStore();
const userStore = useUserStore();
const leaderboardStore = useLeaderboardStore();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
});

const userRankTitle = computed(() => {
  return leaderboardStore.calculateRank(gameStore.score, gameStore.elapsedTime, true);
});

// Lanzar confeti al abrir
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // no-op si falla
      }
    }
  }
);
</script>

<style scoped>
.stats-card {
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 215, 0, 0.25);
}

.stat-box {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.rank-award-box {
  background: linear-gradient(90deg, rgba(255, 215, 0, 0.15), rgba(255, 171, 0, 0.25));
  border: 1px solid #ffd700;
}
</style>
