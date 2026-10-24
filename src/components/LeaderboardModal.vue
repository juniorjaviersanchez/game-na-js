<template>
  <v-dialog v-model="isOpen" max-width="720" scrollable>
    <v-card class="glass-panel text-white pa-4 pa-md-6" rounded="xl">
      <!-- Encabezado con Trofeo -->
      <div class="d-flex align-center justify-space-between mb-3">
        <div class="d-flex align-center">
          <v-avatar color="amber-darken-1" size="48" class="mr-3 elevation-6">
            <v-icon icon="mdi-trophy-award" size="32" color="surface"></v-icon>
          </v-avatar>
          <div>
            <h2 class="text-h5 font-weight-black text-glow-gold line-height-1">
              RANKING DE LA CAVERNA
            </h2>
            <div class="text-caption text-amber-accent-2 font-weight-bold">
              Criterio Oficial: Menor Tiempo en {{ gameStore.targetDistance }}m + Mayor Puntuación
            </div>
          </div>
        </div>

        <v-btn icon="mdi-close" variant="text" size="small" @click="isOpen = false"></v-btn>
      </div>

      <v-divider class="my-2 border-opacity-25"></v-divider>

      <!-- Podio de los 3 Mejores Filósofos -->
      <div v-if="topThree.length > 0" class="podium-row d-flex justify-center align-end gap-3 my-4">
        <!-- 2do Lugar (Plata) -->
        <div v-if="topThree[1]" class="podium-card podium-silver pa-3 rounded-lg text-center flex-grow-1 max-w-200">
          <v-icon icon="mdi-medal" color="grey-lighten-1" size="28"></v-icon>
          <div class="font-weight-black text-caption text-grey-lighten-2 mt-1">#2 LUGAR</div>
          <div class="font-weight-bold text-white text-truncate">{{ topThree[1].username }}</div>
          <div class="text-caption font-mono text-cyan-accent-2 font-weight-black">{{ topThree[1].time }}s</div>
          <div class="text-caption text-grey-lighten-1">{{ topThree[1].score }} pts</div>
        </div>

        <!-- 1er Lugar (Oro) -->
        <div v-if="topThree[0]" class="podium-card podium-gold pa-4 rounded-xl text-center flex-grow-1 max-w-220">
          <v-icon icon="mdi-crown" color="amber-accent-2" size="38" class="pulse-anim"></v-icon>
          <div class="font-weight-black text-subtitle-2 text-amber-accent-2 mt-1">#1 CAMPEÓN</div>
          <div class="text-subtitle-1 font-weight-black text-white text-truncate">{{ topThree[0].username }}</div>
          <div class="text-h6 font-mono text-amber-accent-2 font-weight-black">{{ topThree[0].time }}s</div>
          <div class="text-caption text-white font-weight-bold">{{ topThree[0].score }} pts</div>
          <v-chip size="x-small" color="amber" variant="flat" class="mt-1 font-weight-bold">
            {{ topThree[0].philosophicalRank }}
          </v-chip>
        </div>

        <!-- 3er Lugar (Bronce) -->
        <div v-if="topThree[2]" class="podium-card podium-bronze pa-3 rounded-lg text-center flex-grow-1 max-w-200">
          <v-icon icon="mdi-medal" color="brown-lighten-1" size="28"></v-icon>
          <div class="font-weight-black text-caption text-grey-lighten-2 mt-1">#3 LUGAR</div>
          <div class="font-weight-bold text-white text-truncate">{{ topThree[2].username }}</div>
          <div class="text-caption font-mono text-cyan-accent-2 font-weight-black">{{ topThree[2].time }}s</div>
          <div class="text-caption text-grey-lighten-1">{{ topThree[2].score }} pts</div>
        </div>
      </div>

      <!-- Tabla Completa de Registros -->
      <v-card-text class="pa-0 mt-3" style="max-height: 280px; overflow-y: auto;">
        <v-table density="compact" class="bg-transparent text-white">
          <thead>
            <tr>
              <th class="text-grey-lighten-1 font-weight-bold">#</th>
              <th class="text-grey-lighten-1 font-weight-bold">Usuario</th>
              <th class="text-grey-lighten-1 font-weight-bold">Personaje</th>
              <th class="text-grey-lighten-1 font-weight-bold text-right">Tiempo ({{ gameStore.targetDistance }}m)</th>
              <th class="text-grey-lighten-1 font-weight-bold text-right">Puntaje</th>
              <th class="text-grey-lighten-1 font-weight-bold">Rango</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(rec, index) in leaderboardStore.sortedRecords"
              :key="rec.id"
              :class="{ 'current-user-row': rec.username === userStore.currentUser?.username }"
            >
              <td>
                <span class="font-weight-black" :class="getRankColorClass(index)">
                  #{{ index + 1 }}
                </span>
              </td>
              <td>
                <span class="font-weight-bold">{{ rec.username }}</span>
                <v-chip
                  v-if="rec.username === userStore.currentUser?.username"
                  size="x-small"
                  color="primary"
                  class="ml-1 font-weight-bold"
                >
                  TÚ
                </v-chip>
              </td>
              <td class="text-caption text-grey-lighten-1">{{ rec.character.split(' / ')[0] }}</td>
              <td class="text-right font-mono font-weight-black text-cyan-accent-2">
                {{ rec.time }}s
              </td>
              <td class="text-right font-mono font-weight-bold text-amber-accent-2">
                {{ rec.score }}
              </td>
              <td class="text-caption text-grey-lighten-2">{{ rec.philosophicalRank }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>

      <v-divider class="my-3 border-opacity-25"></v-divider>

      <!-- Pie del Modal -->
      <div class="d-flex justify-space-between align-center">
        <v-btn
          variant="text"
          color="grey-lighten-2"
          size="small"
          prepend-icon="mdi-refresh"
          @click="resetRanking"
        >
          Restablecer Valores Iniciales
        </v-btn>

        <v-btn
          color="primary"
          variant="flat"
          class="btn-arcade text-surface px-6"
          rounded="pill"
          @click="isOpen = false"
        >
          CERRAR
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from "vue";
import { useLeaderboardStore } from "../stores/leaderboardStore";
import { useUserStore } from "../stores/userStore";
import { useGameStore } from "../stores/gameStore";

const props = defineProps({
  modelValue: Boolean
});
const emit = defineEmits(["update:modelValue"]);

const leaderboardStore = useLeaderboardStore();
const userStore = useUserStore();
const gameStore = useGameStore();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
});

const topThree = computed(() => {
  return leaderboardStore.sortedRecords.slice(0, 3);
});

const getRankColorClass = (idx) => {
  if (idx === 0) return "text-amber-accent-2";
  if (idx === 1) return "text-grey-lighten-1";
  if (idx === 2) return "text-brown-lighten-1";
  return "text-grey-darken-1";
};

const resetRanking = () => {
  if (confirm("¿Deseas restablecer el ranking con los registros filosóficos iniciales?")) {
    leaderboardStore.resetToDefaults();
  }
};
</script>

<style scoped>
.podium-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
}

.podium-gold {
  background: linear-gradient(180deg, rgba(255, 215, 0, 0.25), rgba(255, 171, 0, 0.1)) !important;
  border-color: #ffd700 !important;
  box-shadow: 0 0 25px rgba(255, 215, 0, 0.35) !important;
  transform: translateY(-8px);
}

.podium-silver {
  border-color: #b0bec5 !important;
}

.podium-bronze {
  border-color: #8d6e63 !important;
}

.max-w-200 {
  max-width: 200px;
}

.max-w-220 {
  max-width: 220px;
}

.current-user-row {
  background: rgba(0, 229, 255, 0.15) !important;
}
</style>
