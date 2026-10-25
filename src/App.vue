<template>
  <v-app class="app-container">
    <v-main class="position-relative fill-height overflow-hidden">
      <!-- 1. VISTA DE SELECCIÓN DE PERSONAJES (MENU PRINCIPAL) -->
      <CharacterSelect
        v-if="gameStore.state === GameState.MENU"
        @start-game="handleStartGame"
        @open-leaderboard="showLeaderboardModal = true"
        @open-config="showConfigModal = true"
        @open-login="showLoginModal = true"
      />

      <!-- 2. VISTA DE JUEGO 3D (CANVAS Y OVERLAYS) -->
      <div
        v-show="gameStore.state !== GameState.MENU"
        class="game-viewport fill-height position-relative"
      >
        <!-- Canvas WebGL de Three.js -->
        <canvas ref="gameCanvas" class="three-canvas"></canvas>

        <!-- HUD Superior e Inferior del Juego -->
        <GameHUD
          v-if="gameStore.state === GameState.PLAYING || gameStore.state === GameState.PAUSED_QUESTION"
          @move-lane="handleMoveLane"
          @jump="handleJump"
          @pause-game="handlePauseGame"
        />
      </div>

      <!-- 3. MODALES DEL SISTEMA -->
      <!-- Modal de Login / Cambio de Usuario (javier1, javier2) -->
      <LoginDialog
        v-model="showLoginModal"
        @user-logged="onUserLogged"
      />

      <!-- Modal de Pregunta Filosófica de la Caja Misteriosa -->
      <QuestionModal
        v-model="showQuestionModal"
        :question="activeQuestion"
        @answer-submitted="onAnswerSubmitted"
        @continue-race="onContinueRace"
      />

      <!-- Modal de Victoria (200m alcanzados) -->
      <VictoryModal
        v-model="showVictoryModal"
        @restart-race="handleStartGame"
        @go-menu="handleReturnToMenu"
        @open-leaderboard="showLeaderboardModal = true"
      />

      <!-- Modal de Derrota / Reinicio -->
      <GameOverModal
        v-model="showGameOverModal"
        :obstacle="lastObstacleHit"
        @restart="handleStartGame"
        @go-menu="handleReturnToMenu"
      />

      <!-- Modal de Clasificación / Ranking -->
      <LeaderboardModal
        v-model="showLeaderboardModal"
      />

      <!-- Modal de Configuración y Parametrización (desde Menú) -->
      <ConfigModal
        v-model="showConfigModal"
      />

      <!-- Modal de Pausa en Partida (Continuar, Volver a Jugar, Selección de Personaje) -->
      <PauseModal
        v-model="showPauseModal"
        @resume="handleResumeGame"
        @restart="handleRestartFromPause"
        @go-menu="handleGoMenuFromPause"
      />
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { useGameStore, GameState } from "./stores/gameStore";
import { useUserStore } from "./stores/userStore";
import { useQuestionStore } from "./stores/questionStore";
import { useLeaderboardStore } from "./stores/leaderboardStore";
import { GameEngine } from "./game/GameEngine";
import soundManager from "./audio/SoundManager";

// Componentes
import CharacterSelect from "./components/CharacterSelect.vue";
import GameHUD from "./components/GameHUD.vue";
import LoginDialog from "./components/LoginDialog.vue";
import QuestionModal from "./components/QuestionModal.vue";
import VictoryModal from "./components/VictoryModal.vue";
import GameOverModal from "./components/GameOverModal.vue";
import LeaderboardModal from "./components/LeaderboardModal.vue";
import ConfigModal from "./components/ConfigModal.vue";
import PauseModal from "./components/PauseModal.vue";

const gameStore = useGameStore();
const userStore = useUserStore();
const questionStore = useQuestionStore();
const leaderboardStore = useLeaderboardStore();

const gameCanvas = ref(null);
let gameEngineInstance = null;

// Estados de modales
const showLoginModal = ref(false);
const showQuestionModal = ref(false);
const showVictoryModal = ref(false);
const showGameOverModal = ref(false);
const showLeaderboardModal = ref(false);
const showConfigModal = ref(false);
const showPauseModal = ref(false);

const activeQuestion = ref(null);
const lastObstacleHit = ref(null);

onMounted(() => {
  // Cargar perfil de usuario y ranking desde localStorage
  userStore.loadFromStorage();
  leaderboardStore.loadFromStorage();

  // Si no hay usuario activo registrado, abrir diálogo de login
  if (!userStore.currentUser) {
    showLoginModal.value = true;
  }

  // Listener global para la tecla Esc (solo durante la partida activa)
  window.addEventListener("keydown", handleGlobalKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleGlobalKeyDown);
  if (gameEngineInstance) {
    gameEngineInstance.dispose();
  }
});

const onUserLogged = (user) => {
  if (user && user.preferredCharacter) {
    gameStore.selectCharacterById(user.preferredCharacter);
  }
};

const handleObstacleCollision = (obs) => {
  lastObstacleHit.value = obs;
  soundManager.playHit();
  gameStore.triggerGameOver();

  // Guardar resultado del intento en el perfil del usuario
  userStore.recordGameResult({
    completed: false,
    time: gameStore.elapsedTime,
    score: gameStore.score,
    characterId: gameStore.selectedCharacter.id
  });

  showGameOverModal.value = true;
};

const initGameEngine = async () => {
  await nextTick();
  if (!gameCanvas.value) return;

  if (gameEngineInstance) {
    gameEngineInstance.dispose();
  }

  gameEngineInstance = new GameEngine(gameCanvas.value, {
    targetDistance: gameStore.targetDistance,
    boxInterval: gameStore.boxInterval,
    onProgressUpdate: (dt) => {
      gameStore.updateFrame(dt);
    },
    onBoxHit: (distance) => {
      // Determinar dificultad de la pregunta según la distancia recorrida (1000m total)
      let level = "facil";
      if (distance >= 700) level = "dificil";
      else if (distance >= 300) level = "media";

      activeQuestion.value = questionStore.getRandomQuestion(level);
      gameStore.pauseForQuestion(distance);
      showQuestionModal.value = true;
    },
    onSparkCollect: () => {
      gameStore.collectSpark();
    },
    onObstacleHit: (obs) => {
      handleObstacleCollision(obs);
    },
    onVictoryReached: () => {
      handleVictoryReached();
    }
  });

  gameEngineInstance.setPlayerCharacter(gameStore.selectedCharacter);
};

const handleStartGame = async () => {
  soundManager.unlock();
  showVictoryModal.value = false;
  showGameOverModal.value = false;
  showPauseModal.value = false;
  lastObstacleHit.value = null;

  gameStore.startRace();
  questionStore.resetSession();

  await initGameEngine();
  if (gameEngineInstance) {
    gameEngineInstance.start();
  }
};

const handleMoveLane = (dir) => {
  if (gameEngineInstance) {
    gameEngineInstance.moveLane(dir);
  }
};

const handleJump = () => {
  if (gameEngineInstance) {
    gameEngineInstance.jump();
  }
};

// Control de la tecla Esc (solo activo durante la carrera en vivo)
const handleGlobalKeyDown = (e) => {
  if (e.code === "Escape") {
    if (showPauseModal.value) {
      handleResumeGame();
      return;
    }

    // La tecla Esc solo funciona cuando está jugando
    if (
      gameStore.state === GameState.PLAYING &&
      !showQuestionModal.value &&
      !showGameOverModal.value &&
      !showVictoryModal.value
    ) {
      handlePauseGame();
    }
  }
};

const handlePauseGame = () => {
  if (gameEngineInstance) {
    gameEngineInstance.pause();
    showPauseModal.value = true;
  }
};

const handleResumeGame = () => {
  showPauseModal.value = false;
  if (gameEngineInstance) {
    gameEngineInstance.resume();
  }
};

const handleRestartFromPause = () => {
  showPauseModal.value = false;
  handleStartGame();
};

const handleGoMenuFromPause = () => {
  showPauseModal.value = false;
  handleReturnToMenu();
};

const onAnswerSubmitted = ({ isCorrect, selectedIndex }) => {
  questionStore.submitAnswer(selectedIndex);
};

const onContinueRace = (isCorrect) => {
  gameStore.resumeAfterQuestion(isCorrect);
  if (gameEngineInstance) {
    gameEngineInstance.resume();
  }
};

const handleVictoryReached = () => {
  gameStore.triggerVictory();

  // Guardar en userStore
  userStore.recordGameResult({
    completed: true,
    time: gameStore.elapsedTime,
    score: gameStore.score,
    characterId: gameStore.selectedCharacter.id
  });

  // Guardar récord oficial en ranking
  leaderboardStore.addRecord({
    username: userStore.currentUser?.username || "Buscador Anónimo",
    character: gameStore.selectedCharacter.name,
    time: gameStore.elapsedTime,
    score: gameStore.score,
    completed: true
  });

  showVictoryModal.value = true;
};

const handleReturnToMenu = () => {
  showVictoryModal.value = false;
  showGameOverModal.value = false;
  showPauseModal.value = false;
  gameStore.returnToMenu();
  if (gameEngineInstance) {
    gameEngineInstance.stop();
  }
};
</script>

<style>
.app-container {
  background-color: var(--bg-deep) !important;
}

.game-viewport {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.three-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
