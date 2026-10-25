<template>
  <v-dialog v-model="isOpen" max-width="820" scrollable>
    <v-card class="glass-panel text-white modal-card-padded" rounded="xl">
      <!-- Encabezado con Trofeo -->
      <div class="d-flex align-center justify-space-between mb-4">
        <div class="d-flex align-center header-title-group">
          <v-avatar color="amber-darken-1" size="44" class="mr-3 elevation-6">
            <v-icon icon="mdi-trophy-award" size="26" color="surface"></v-icon>
          </v-avatar>
          <div class="d-flex flex-column justify-center">
            <h2 class="text-h5 font-weight-black text-glow-gold line-height-1 mb-1">
              RANKING DE LA CAVERNA
            </h2>
            <div class="header-subtitle text-amber-accent-2 font-weight-bold">
              Criterio Oficial: Menor Tiempo en {{ gameStore.targetDistance }}m + Mayor Puntuación
            </div>
          </div>
        </div>

        <v-btn icon="mdi-close" variant="text" size="small" @click="isOpen = false"></v-btn>
      </div>

      <v-divider class="mb-5 border-opacity-25"></v-divider>

      <!-- Podio de los 3 Mejores Filósofos -->
      <div v-if="topThree.length > 0" class="podium-row d-flex justify-center align-end gap-3 mt-1 mb-5">
        <!-- 2do Lugar (Plata) -->
        <div v-if="topThree[1]" class="podium-card podium-silver rounded-xl text-center flex-grow-1 max-w-220">
          <v-icon icon="mdi-medal" color="grey-lighten-1" size="30" class="mb-1"></v-icon>
          <div class="font-weight-black podium-rank-tag text-grey-lighten-2">#2 LUGAR</div>
          <div class="podium-name font-weight-bold text-white text-truncate">{{ topThree[1].username }}</div>
          <div class="podium-time font-mono text-cyan-accent-2 font-weight-black">{{ formatTime(topThree[1].time) }}s</div>
          <div class="podium-score text-grey-lighten-1">{{ topThree[1].score }} pts</div>
          <div class="podium-chip-box">
            <span class="podium-rank-chip chip-silver">{{ topThree[1].philosophicalRank || 'Pensador' }}</span>
          </div>
        </div>

        <!-- 1er Lugar (Oro) -->
        <div v-if="topThree[0]" class="podium-card podium-gold rounded-xl text-center flex-grow-1 max-w-240">
          <v-icon icon="mdi-crown" color="amber-accent-2" size="40" class="pulse-anim mb-1"></v-icon>
          <div class="font-weight-black podium-rank-tag text-amber-accent-2">#1 CAMPEÓN</div>
          <div class="podium-name-gold font-weight-black text-white text-truncate">{{ topThree[0].username }}</div>
          <div class="podium-time-gold font-mono text-amber-accent-2 font-weight-black">{{ formatTime(topThree[0].time) }}s</div>
          <div class="podium-score font-weight-bold text-white">{{ topThree[0].score }} pts</div>
          <div class="podium-chip-box mt-1">
            <span class="podium-rank-chip chip-gold">{{ topThree[0].philosophicalRank || 'Iluminado' }}</span>
          </div>
        </div>

        <!-- 3er Lugar (Bronce) -->
        <div v-if="topThree[2]" class="podium-card podium-bronze rounded-xl text-center flex-grow-1 max-w-220">
          <v-icon icon="mdi-medal" color="brown-lighten-1" size="30" class="mb-1"></v-icon>
          <div class="font-weight-black podium-rank-tag text-grey-lighten-2">#3 LUGAR</div>
          <div class="podium-name font-weight-bold text-white text-truncate">{{ topThree[2].username }}</div>
          <div class="podium-time font-mono text-cyan-accent-2 font-weight-black">{{ formatTime(topThree[2].time) }}s</div>
          <div class="podium-score text-grey-lighten-1">{{ topThree[2].score }} pts</div>
          <div class="podium-chip-box">
            <span class="podium-rank-chip chip-bronze">{{ topThree[2].philosophicalRank || 'Aprendiz' }}</span>
          </div>
        </div>
      </div>

      <!-- Tabla Completa de Registros -->
      <v-card-text class="pa-0 table-scroll-container">
        <table class="leaderboard-custom-table">
          <thead>
            <tr>
              <th class="col-rank">#</th>
              <th class="col-user">Usuario</th>
              <th class="col-char">Personaje</th>
              <th class="col-time">Tiempo ({{ gameStore.targetDistance }}m)</th>
              <th class="col-score">Puntaje</th>
              <th class="col-title">Rango Filosófico</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(rec, index) in leaderboardStore.sortedRecords"
              :key="rec.id"
              :class="{ 'current-user-row': rec.username === userStore.currentUser?.username }"
            >
              <td class="col-rank">
                <span class="font-weight-black" :class="getRankColorClass(index)">
                  #{{ index + 1 }}
                </span>
              </td>
              <td class="col-user">
                <span class="font-weight-bold mr-2">{{ rec.username }}</span>
                <span
                  v-if="rec.username === userStore.currentUser?.username"
                  class="current-user-tag"
                >
                  TÚ
                </span>
              </td>
              <td class="col-char text-grey-lighten-1">{{ rec.character.split(' / ')[0] }}</td>
              <td class="col-time font-mono font-weight-black text-cyan-accent-2">
                {{ formatTime(rec.time) }}s
              </td>
              <td class="col-score font-mono font-weight-bold text-amber-accent-2">
                {{ rec.score }}
              </td>
              <td class="col-title text-grey-lighten-2 font-weight-medium">
                {{ rec.philosophicalRank }}
              </td>
            </tr>
          </tbody>
        </table>
      </v-card-text>

      <v-divider class="my-4 border-opacity-25"></v-divider>

      <!-- Pie del Modal -->
      <div class="d-flex justify-space-between align-center modal-footer-row">
        <v-btn
          variant="text"
          color="grey-lighten-2"
          size="small"
          prepend-icon="mdi-refresh"
          class="reset-btn"
          @click="resetRanking"
        >
          Restablecer Valores Iniciales
        </v-btn>

        <v-btn
          color="primary"
          variant="flat"
          class="btn-arcade text-surface px-8 btn-close-modal"
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

const formatTime = (timeVal) => {
  const num = Number(timeVal);
  return isNaN(num) ? timeVal : num.toFixed(2);
};

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
.modal-card-padded {
  padding: 24px 28px !important;
}

.header-subtitle {
  font-size: 0.82rem;
  letter-spacing: 0.3px;
  line-height: 1.3;
}

/* Tarjetas del Podio */
.podium-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
  padding: 16px 14px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.podium-gold {
  background: linear-gradient(180deg, rgba(255, 215, 0, 0.28), rgba(255, 171, 0, 0.12)) !important;
  border: 1px solid #ffd700 !important;
  box-shadow: 0 0 25px rgba(255, 215, 0, 0.35) !important;
  transform: translateY(-4px);
  padding: 18px 16px 16px;
}

.podium-silver {
  border-color: #b0bec5 !important;
}

.podium-bronze {
  border-color: #8d6e63 !important;
}

.max-w-220 {
  max-width: 220px;
}

.max-w-240 {
  max-width: 240px;
}

.podium-rank-tag {
  font-size: 0.72rem;
  letter-spacing: 0.6px;
  margin-bottom: 2px;
}

.podium-name {
  font-size: 0.95rem;
  line-height: 1.2;
  margin-bottom: 3px;
}

.podium-name-gold {
  font-size: 1.05rem;
  line-height: 1.2;
  margin-bottom: 3px;
}

.podium-time {
  font-size: 0.95rem;
  margin-bottom: 2px;
}

.podium-time-gold {
  font-size: 1.15rem;
  margin-bottom: 2px;
}

.podium-score {
  font-size: 0.78rem;
  margin-bottom: 6px;
}

.podium-chip-box {
  width: 100%;
  display: flex;
  justify-content: center;
}

.podium-rank-chip {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.4px;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chip-gold {
  background: #ffd700;
  color: #0c0f1d;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
}

.chip-silver {
  background: rgba(207, 216, 220, 0.25);
  color: #eceff1;
  border: 1px solid #b0bec5;
}

.chip-bronze {
  background: rgba(141, 110, 99, 0.3);
  color: #d7ccc8;
  border: 1px solid #8d6e63;
}

/* Tabla Personalizada con Espaciado Perfecto */
.table-scroll-container {
  max-height: 270px;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.25);
}

.leaderboard-custom-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.leaderboard-custom-table th {
  padding: 12px 16px;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #90a4ae;
  background: rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  white-space: nowrap;
}

.leaderboard-custom-table td {
  padding: 11px 16px;
  font-size: 0.86rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  vertical-align: middle;
}

.col-rank {
  width: 60px;
  text-align: center;
}

.col-user {
  min-width: 150px;
}

.col-char {
  min-width: 110px;
}

.col-time {
  min-width: 130px;
  text-align: right;
  padding-right: 20px !important;
}

.col-score {
  min-width: 100px;
  text-align: right;
  padding-right: 28px !important;
}

.col-title {
  min-width: 180px;
  padding-left: 20px !important;
}

.current-user-tag {
  background: #00e5ff;
  color: #080a14;
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 0.5px;
  padding: 2px 7px;
  border-radius: 6px;
  display: inline-block;
  vertical-align: middle;
}

.current-user-row {
  background: rgba(0, 229, 255, 0.12) !important;
}

.current-user-row td {
  border-bottom-color: rgba(0, 229, 255, 0.25) !important;
}

.btn-close-modal {
  height: 42px !important;
  font-weight: 800 !important;
  letter-spacing: 1px !important;
}
</style>
