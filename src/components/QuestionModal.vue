<template>
  <v-dialog v-model="isOpen" max-width="680" persistent>
    <v-card class="question-modal-card text-white position-relative overflow-hidden" rounded="xl">
      <!-- Glow superior místico de la caja -->
      <div class="box-glow-header mb-5 text-center">
        <div class="d-flex justify-center align-center flex-wrap gap-2 mb-3">
          <v-chip
            :color="levelColor"
            variant="flat"
            size="default"
            class="level-chip font-weight-black text-uppercase"
          >
            <v-icon icon="mdi-cube-outline" class="mr-2" size="20"></v-icon>
            CAJA MÍSTICA: NIVEL {{ question?.nivel || 'FÁCIL' }}
          </v-chip>

          <!-- Cronómetro Activo en Vivo -->
          <v-chip
            color="amber-accent-2"
            variant="outlined"
            size="default"
            class="live-timer-chip font-mono font-weight-black"
          >
            <v-icon icon="mdi-timer-sand" class="mr-1 pulse-clock" size="18"></v-icon>
            ⏱️ {{ gameStore.formattedTime }}
          </v-chip>
        </div>

        <h2 class="text-h4 font-weight-black text-glow-gold line-height-1 mb-2">
          DILEMA FILOSÓFICO
        </h2>
        <div class="header-desc text-body-2 text-grey-lighten-1">
          La caja se ha fracturado. El cronómetro no se detiene: ¡responde rápido para tu posición en el ranking!
        </div>
      </div>

      <!-- Pregunta Actual con Padding Amplio y Fondo Luminoso -->
      <div class="question-text-box text-center mb-5">
        <div class="question-title-text">
          {{ question?.pregunta }}
        </div>
      </div>

      <!-- Alternativas de Respuesta (4 Opciones) con Generosa Separación -->
      <div class="alternatives-grid d-flex flex-column mb-4">
        <button
          v-for="(alt, idx) in question?.alternativas"
          :key="idx"
          type="button"
          class="alternative-choice-btn d-flex align-center"
          :class="getOptionClass(idx)"
          :disabled="isAnswered"
          @click="selectOption(idx)"
        >
          <span class="option-letter mr-4">{{ ['A', 'B', 'C', 'D'][idx] }}</span>
          <span class="text-body-1 font-weight-bold text-left flex-grow-1 option-text">{{ alt }}</span>
          <v-icon v-if="isAnswered && idx === question.correcta" icon="mdi-check-circle" color="success" size="26" class="ml-3"></v-icon>
          <v-icon v-else-if="isAnswered && idx === selectedOptionIndex && !isCorrect" icon="mdi-close-circle" color="error" size="26" class="ml-3"></v-icon>
        </button>
      </div>

      <!-- Retroalimentación y Explicación Pedagógica -->
      <v-expand-transition>
        <div v-if="isAnswered" class="explanation-box pa-4 rounded-xl mb-4" :class="isCorrect ? 'bg-success-dark' : 'bg-error-dark'">
          <div class="d-flex align-center mb-2">
            <v-icon :icon="isCorrect ? 'mdi-lightbulb-on' : 'mdi-alert-circle'" class="mr-2" size="24"></v-icon>
            <span class="font-weight-black text-subtitle-1 text-uppercase">
              {{ isCorrect ? '¡RESPUESTA ACERTADA!' : 'CONOCIMIENTO REVELADO:' }}
            </span>
            <v-spacer></v-spacer>
            <span class="font-weight-black text-caption reward-tag" :class="isCorrect ? 'text-amber-accent-2' : 'text-grey-lighten-2'">
              {{ isCorrect ? '+50 Puntos de Sabiduría' : '-10 Puntos' }}
            </span>
          </div>
          <div class="text-body-2 text-grey-lighten-1 explanation-content">
            {{ question?.explicacion }}
          </div>
        </div>
      </v-expand-transition>

      <!-- Botón para Continuar la Carrera -->
      <v-btn
        v-if="isAnswered"
        block
        size="x-large"
        color="primary"
        class="btn-arcade text-surface elevation-8 pulse-anim font-weight-black btn-continue-race mt-2"
        rounded="pill"
        @click="continueRace"
      >
        <v-icon icon="mdi-play-speed" class="mr-2" size="26"></v-icon>
        CONTINUAR EL VIAJE HACIA LA LUZ
      </v-btn>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from "vue";
import { useGameStore } from "../stores/gameStore";

const gameStore = useGameStore();

const props = defineProps({
  modelValue: Boolean,
  question: Object
});
const emit = defineEmits(["update:modelValue", "answer-submitted", "continue-race"]);

const isAnswered = ref(false);
const selectedOptionIndex = ref(null);
const isCorrect = ref(false);

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
});

const levelColor = computed(() => {
  if (props.question?.nivel === "dificil") return "amber-darken-2";
  if (props.question?.nivel === "media") return "secondary";
  return "primary";
});

const selectOption = (idx) => {
  if (isAnswered.value || !props.question) return;

  selectedOptionIndex.value = idx;
  isCorrect.value = idx === props.question.correcta;
  isAnswered.value = true;

  emit("answer-submitted", {
    isCorrect: isCorrect.value,
    selectedIndex: idx
  });
};

const getOptionClass = (idx) => {
  if (!isAnswered.value) return "";
  if (idx === props.question?.correcta) return "correct-choice";
  if (idx === selectedOptionIndex.value) return "wrong-choice";
  return "dimmed-choice";
};

const continueRace = () => {
  isAnswered.value = false;
  selectedOptionIndex.value = null;
  isOpen.value = false;
  emit("continue-race", isCorrect.value);
};
</script>

<style scoped>
/* Tarjeta del modal con fondo opaco y elegante para que no se trasluzca el juego */
.question-modal-card {
  background: rgba(12, 16, 32, 0.96) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(0, 229, 255, 0.4) !important;
  box-shadow: 0 16px 45px rgba(0, 0, 0, 0.75), 0 0 25px rgba(0, 229, 255, 0.2) !important;
  padding: 30px 34px !important;
}

.level-chip {
  padding: 6px 18px !important;
  font-size: 0.8rem !important;
  letter-spacing: 0.8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.live-timer-chip {
  background: rgba(255, 171, 0, 0.12) !important;
  border: 1px solid rgba(255, 171, 0, 0.5) !important;
  color: #ffd700 !important;
  letter-spacing: 0.5px;
  box-shadow: 0 0 14px rgba(255, 215, 0, 0.25);
  padding: 6px 14px !important;
}

.pulse-clock {
  animation: pulseClockAnim 1.2s infinite ease-in-out;
}

@keyframes pulseClockAnim {
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.2); opacity: 1; color: #ff5252; }
  100% { transform: scale(1); opacity: 0.8; }
}

.header-desc {
  font-size: 0.88rem;
  line-height: 1.4;
}

/* Caja de la Pregunta con padding y respiración */
.question-text-box {
  background: rgba(0, 229, 255, 0.08);
  border: 1.5px solid rgba(0, 229, 255, 0.35);
  padding: 20px 24px;
  border-radius: 14px;
  box-shadow: 0 4px 20px rgba(0, 229, 255, 0.12), inset 0 0 15px rgba(0, 229, 255, 0.04);
}

.question-title-text {
  font-size: 1.18rem;
  font-weight: 800;
  line-height: 1.45;
  color: #00e5ff;
  letter-spacing: 0.3px;
  text-shadow: 0 0 10px rgba(0, 229, 255, 0.4);
}

/* Botones de Alternativas Espaciados */
.alternative-choice-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  padding: 16px 20px;
  margin-bottom: 12px;
  border-radius: 12px;
  width: 100%;
  min-height: 60px;
  cursor: pointer;
  color: #ffffff;
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  user-select: none;
}

.alternative-choice-btn:hover:not(:disabled) {
  background: rgba(0, 229, 255, 0.16);
  border-color: #00e5ff;
  transform: translateX(6px);
  box-shadow: 0 4px 18px rgba(0, 229, 255, 0.35);
}

.alternative-choice-btn:active:not(:disabled) {
  transform: translateX(2px) scale(0.99);
}

.alternative-choice-btn:disabled {
  cursor: default;
}

.option-text {
  font-size: 1.02rem;
  font-weight: 600;
  line-height: 1.35;
  color: #f0f4fc;
}

.option-letter {
  background: rgba(0, 229, 255, 0.18);
  border: 1px solid rgba(0, 229, 255, 0.4);
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 0.95rem;
  font-family: var(--font-title);
  color: #00e5ff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

/* Estados de acierto / error */
.correct-choice {
  background: rgba(0, 230, 118, 0.22) !important;
  border-color: #00e676 !important;
  box-shadow: 0 0 20px rgba(0, 230, 118, 0.45) !important;
}

.correct-choice .option-letter {
  background: #00e676 !important;
  color: #0c1a10 !important;
  border-color: #00e676 !important;
}

.wrong-choice {
  background: rgba(255, 82, 82, 0.22) !important;
  border-color: #ff5252 !important;
  box-shadow: 0 0 20px rgba(255, 82, 82, 0.4) !important;
}

.wrong-choice .option-letter {
  background: #ff5252 !important;
  color: #ffffff !important;
  border-color: #ff5252 !important;
}

.dimmed-choice {
  opacity: 0.35;
}

/* Caja de Explicación */
.explanation-box {
  padding: 18px 22px !important;
}

.explanation-content {
  line-height: 1.5;
  font-size: 0.92rem;
}

.reward-tag {
  font-weight: 800;
  letter-spacing: 0.5px;
}

.bg-success-dark {
  background: rgba(0, 230, 118, 0.16);
  border: 1.5px solid rgba(0, 230, 118, 0.45);
}

.bg-error-dark {
  background: rgba(255, 82, 82, 0.16);
  border: 1.5px solid rgba(255, 82, 82, 0.45);
}

.btn-continue-race {
  height: 54px !important;
  font-size: 1.05rem !important;
  letter-spacing: 1.5px !important;
}
</style>
