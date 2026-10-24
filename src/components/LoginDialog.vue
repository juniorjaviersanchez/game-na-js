<template>
  <v-dialog v-model="isOpen" max-width="480" persistent>
    <v-card class="glass-panel pa-6 text-white" rounded="xl">
      <div class="text-center mb-4">
        <v-avatar color="primary" size="64" class="mb-3 elevation-8">
          <v-icon icon="mdi-account-circle" size="44" color="surface"></v-icon>
        </v-avatar>
        <h2 class="text-h5 font-weight-black text-glow-cyan">REGISTRO DE FILÓSOFO</h2>
        <p class="text-body-2 text-grey-lighten-1 mt-1">
          Ingresa tu nombre para guardar tus récords de tiempo y puntuación en el ranking.
        </p>
      </div>

      <v-form @submit.prevent="handleConfirm">
        <v-text-field
          v-model="usernameInput"
          label="Nombre de Usuario (ej. javier1)"
          variant="outlined"
          color="primary"
          bg-color="rgba(0,0,0,0.3)"
          prepend-inner-icon="mdi-account"
          :rules="[v => !!v.trim() || 'El nombre es obligatorio']"
          autofocus
          rounded="lg"
          class="mb-3"
          @keyup.enter="handleConfirm"
        ></v-text-field>

        <!-- Lista de usuarios guardados previamente en LocalStorage -->
        <div v-if="userStore.usersList.length > 0" class="mb-4">
          <div class="text-caption text-grey-lighten-2 font-weight-bold mb-2">
            Perfiles guardados en este navegador:
          </div>
          <div class="d-flex flex-wrap gap-2">
            <v-chip
              v-for="u in userStore.usersList"
              :key="u.username"
              color="primary"
              variant="tonal"
              size="small"
              class="ma-1 cursor-pointer"
              prepend-icon="mdi-account"
              @click="quickSelectUser(u.username)"
            >
              {{ u.username }}
              <span v-if="u.bestTime" class="text-amber-accent-2 ml-1">
                ({{ u.bestTime }}s)
              </span>
            </v-chip>
          </div>
        </div>

        <v-btn
          type="submit"
          block
          size="large"
          color="primary"
          class="btn-arcade text-surface"
          elevation="6"
          :disabled="!usernameInput.trim()"
        >
          <v-icon icon="mdi-check-bold" class="mr-2"></v-icon>
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
