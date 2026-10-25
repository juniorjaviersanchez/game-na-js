<template>
  <v-dialog v-model="isOpen" max-width="640" persistent>
    <v-card class="glass-panel text-white pa-6 pa-md-8 position-relative overflow-hidden" rounded="xl">
      <!-- Glow superior místico de la caja -->
      <div class="box-glow-header mb-4 text-center">
        <v-chip
          :color="levelColor"
          variant="flat"
          size="small"
          class="font-weight-black text-uppercase mb-2"
        >
          <v-icon icon="mdi-cube-outline" class="mr-1"></v-icon>
          CAJA MÍSTICA: NIVEL {{ question?.nivel || 'FÁCIL' }}
        </v-chip>

        <h2 class="text-h5 text-md-h4 font-weight-black text-glow-gold line-height-1 mb-1">
          DILEMA FILOSÓFICO
        </h2>
        <div class="text-caption text-grey-lighten-1">
          La caja se ha fracturado. Responde correctamente para acelerar tu liberación.
        </div>
      </div>

      <!-- Pregunta Actual -->
      <div class="question-text-box pa-4 rounded-lg mb-4">
        <div class="text-subtitle-1 text-md-h6 font-weight-bold text-center text-cyan-accent-2">
          {{ question?.pregunta }}
        </div>
      </div>

      <!-- Alternativas de Respuesta (4 Opciones) -->
      <div class="alternatives-grid d-flex flex-column mb-4">
        <button
          v-for="(alt, idx) in question?.alternativas"
          :key="idx"
          type="button"
          class="alternative-choice-btn mb-2 d-flex align-center"
          :class="getOptionClass(idx)"
          :disabled="isAnswered"
          @click="selectOption(idx)"
        >
          <span class="option-letter mr-3">{{ ['A', 'B', 'C', 'D'][idx] }}</span>
          <span class="text-body-1 font-weight-medium text-left flex-grow-1 option-text">{{ alt }}</span>
          <v-icon v-if="isAnswered && idx === question.correcta" icon="mdi-check-circle" color="success" size="24" class="ml-2"></v-icon>
          <v-icon v-else-if="isAnswered && idx === selectedOptionIndex && !isCorrect" icon="mdi-close-circle" color="error" size="24" class="ml-2"></v-icon>
        </button>
      </div>

      <!-- Retroalimentación y Explicación Pedagógica -->
      <v-expand-transition>
        <div v-if="isAnswered" class="explanation-box pa-4 rounded-lg mb-4" :class="isCorrect ? 'bg-success-dark' : 'bg-error-dark'">
          <div class="d-flex align-center mb-1">
            <v-icon :icon="isCorrect ? 'mdi-lightbulb-on' : 'mdi-alert-circle'" class="mr-2" size="22"></v-icon>
            <span class="font-weight-black text-subtitle-2 text-uppercase">
              {{ isCorrect ? '¡RESPUESTA ACERTADA!' : 'CONOCIMIENTO REVELADO:' }}
            </span>
            <v-spacer></v-spacer>
            <span class="font-weight-black text-caption" :class="isCorrect ? 'text-amber-accent-2' : 'text-grey-lighten-2'">
              {{ isCorrect ? '+50 Puntos de Sabiduría' : '-10 Puntos' }}
            </span>
          </div>
          <div class="text-body-2 text-grey-lighten-1">
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
        class="btn-arcade text-surface elevation-6 pulse-anim font-weight-black"
        @click="continueRace"
      >
        <v-icon icon="mdi-play-speed" class="mr-2"></v-icon>
        CONTINUAR EL VIAJE HACIA LA LUZ
      </v-btn>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from "vue";

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

const getOptionColor = (idx) => {
  if (!isAnswered.value) return "cyan-accent-2";
  if (idx === props.question?.correcta) return "success";
  if (idx === selectedOptionIndex.value) return "error";
  return "grey-darken-2";
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
.question-text-box {
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(0, 229, 255, 0.2);
}

.alternative-choice-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1.5px solid rgba(0, 229, 255, 0.3);
  padding: 12px 18px;
  border-radius: 10px;
  width: 100%;
  cursor: pointer;
  color: #ffffff;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
}

.alternative-choice-btn:hover:not(:disabled) {
  background: rgba(0, 229, 255, 0.15);
  border-color: #00e5ff;
  transform: translateX(4px);
  box-shadow: 0 0 12px rgba(0, 229, 255, 0.3);
}

.alternative-choice-btn:disabled {
  cursor: default;
}

.option-text {
  line-height: 1.35;
}

.option-letter {
  background: rgba(0, 229, 255, 0.2);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-family: var(--font-title);
  color: #00e5ff;
}

.correct-choice {
  background: rgba(0, 230, 118, 0.2) !important;
  border-color: #00e676 !important;
  box-shadow: 0 0 15px rgba(0, 230, 118, 0.4);
}

.wrong-choice {
  background: rgba(255, 82, 82, 0.2) !important;
  border-color: #ff5252 !important;
}

.dimmed-choice {
  opacity: 0.4;
}

.bg-success-dark {
  background: rgba(0, 230, 118, 0.15);
  border: 1px solid rgba(0, 230, 118, 0.4);
}

.bg-error-dark {
  background: rgba(255, 82, 82, 0.15);
  border: 1px solid rgba(255, 82, 82, 0.4);
}
</style>
