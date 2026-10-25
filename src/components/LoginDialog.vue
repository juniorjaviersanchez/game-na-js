<template>
  <v-dialog v-model="isOpen" max-width="500" persistent>
    <v-card class="glass-panel modal-login-card text-white" rounded="xl">
      <!-- Encabezado con Icono -->
      <div class="text-center mb-5">
        <v-avatar color="primary" size="64" class="mb-3 elevation-8">
          <v-icon icon="mdi-account-circle" size="44" color="surface"></v-icon>
        </v-avatar>
        <h2 class="text-h5 font-weight-black text-glow-cyan letter-spacing-1">
          REGISTRO DE FILÓSOFO
        </h2>
        <p class="text-body-2 text-grey-lighten-1 mt-2 line-height-14">
          Ingresa tu nombre para guardar tus récords de tiempo y puntuación en el ranking oficial.
        </p>
      </div>

      <v-form @submit.prevent="handleConfirm">
        <!-- Campo de Texto con espaciado -->
        <div class="input-container mb-4">
          <v-text-field
            v-model="usernameInput"
            label="Nombre de Usuario (ej. javier1)"
            variant="outlined"
            color="primary"
            bg-color="rgba(0,0,0,0.35)"
            prepend-inner-icon="mdi-account"
            :rules="[v => !!v.trim() || 'El nombre es obligatorio']"
            autofocus
            rounded="lg"
            class="user-input-field"
            @keyup.enter="handleConfirm"
          ></v-text-field>
        </div>

        <!-- Lista de usuarios guardados previamente en LocalStorage -->
        <div v-if="userStore.usersList.length > 0" class="saved-profiles-section mb-5">
          <div class="saved-profiles-title text-grey-lighten-2 font-weight-bold mb-2">
            Perfiles guardados en este navegador:
          </div>
          <div class="d-flex flex-wrap gap-2">
            <button
              v-for="u in userStore.usersList"
              :key="u.username"
              type="button"
              class="saved-user-pill"
              @click="quickSelectUser(u.username)"
            >
              <v-icon icon="mdi-account" size="16" class="mr-1 text-primary"></v-icon>
              <span class="user-pill-name font-weight-bold">{{ u.username }}</span>
              <span v-if="u.bestTime" class="user-pill-time font-mono">
                ({{ formatTime(u.bestTime) }}s)
              </span>
            </button>
          </div>
        </div>

        <!-- Botón Continuar -->
        <v-btn
          type="submit"
          block
          size="large"
          color="primary"
          class="btn-arcade text-surface btn-submit-login"
          rounded="pill"
          elevation="6"
          :disabled="!usernameInput.trim()"
        >
          <v-icon icon="mdi-check-bold" class="mr-2" size="20"></v-icon>
          CONTINUAR AL DESPERTAR
        </v-btn>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from "vue";
import { useUserStore } from "../stores/userStore";
import soundManager from "../audio/SoundManager";

const props = defineProps({
  modelValue: Boolean
});
const emit = defineEmits(["update:modelValue", "user-logged"]);

const userStore = useUserStore();
const usernameInput = ref("");

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
});

const formatTime = (timeVal) => {
  const num = Number(timeVal);
  return isNaN(num) ? timeVal : num.toFixed(2);
};

const handleConfirm = () => {
  if (!usernameInput.value.trim()) return;
  soundManager.unlock();
  const user = userStore.loginUser(usernameInput.value.trim());
  emit("user-logged", user);
  isOpen.value = false;
};

const quickSelectUser = (name) => {
  usernameInput.value = name;
  handleConfirm();
};
</script>

<style scoped>
.modal-login-card {
  padding: 28px 30px !important;
}

.line-height-14 {
  line-height: 1.45;
}

.saved-profiles-section {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 12px 14px;
}

.saved-profiles-title {
  font-size: 0.78rem;
  letter-spacing: 0.4px;
}

/* Píldora de usuario guardado */
.saved-user-pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  background: rgba(0, 229, 255, 0.12);
  border: 1px solid rgba(0, 229, 255, 0.35);
  border-radius: 999px;
  color: #ffffff;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.saved-user-pill:hover {
  background: rgba(0, 229, 255, 0.25);
  border-color: #00e5ff;
  transform: translateY(-1px);
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
}

.user-pill-name {
  color: #ffffff;
  margin-right: 4px;
}

.user-pill-time {
  color: #ffd700;
  font-weight: 700;
  font-size: 0.76rem;
}

.btn-submit-login {
  height: 50px !important;
  font-weight: 900 !important;
  letter-spacing: 1.2px !important;
  font-size: 0.95rem !important;
}
</style>
