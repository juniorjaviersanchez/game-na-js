import { defineStore } from "pinia";

const STORAGE_LEADERBOARD_KEY = "game_na_philosophical_ranking";

const DEFAULT_PHILOSOPHER_RECORDS = [
  {
    id: "def_1",
    username: "Platón",
    character: "Selina / Sophia",
    time: 54.42,
    score: 2850,
    completed: true,
    philosophicalRank: "Fundador de la Academia",
    date: "2026-10-15T12:00:00Z"
  },
  {
    id: "def_2",
    username: "Sócrates",
    character: "Kael / Noûs",
    time: 59.18,
    score: 2680,
    completed: true,
    philosophicalRank: "Tábano de Atenas",
    date: "2026-10-16T14:30:00Z"
  },
  {
    id: "def_3",
    username: "Diotima",
    character: "Lumina / Diotima",
    time: 63.05,
    score: 2720,
    completed: true,
    philosophicalRank: "Sacerdotisa del Amor",
    date: "2026-10-17T09:15:00Z"
  }
];

export const useLeaderboardStore = defineStore("leaderboard", {
  state: () => ({
    records: []
  }),

  getters: {
    sortedRecords: (state) => {
      return [...state.records].sort((a, b) => {
        // 1. Quienes completaron la carrera van primero
        if (a.completed && !b.completed) return -1;
        if (!a.completed && b.completed) return 1;

        if (a.completed && b.completed) {
          // 2. Menor tiempo es mejor
          if (a.time !== b.time) {
            return a.time - b.time;
          }
          // 3. Desempate por mayor puntuación
          return b.score - a.score;
        }

        // Si ninguno completó, mayor puntaje
        return b.score - a.score;
      });
    }
  },

  actions: {
    loadFromStorage() {
      try {
        const stored = localStorage.getItem(STORAGE_LEADERBOARD_KEY);
        if (stored) {
          this.records = JSON.parse(stored);
        } else {
          this.records = [...DEFAULT_PHILOSOPHER_RECORDS];
          this.saveToStorage();
        }
      } catch (e) {
        console.error("Error al cargar ranking de localStorage:", e);
        this.records = [...DEFAULT_PHILOSOPHER_RECORDS];
      }
    },

    addRecord({ username, character, time, score, completed = true }) {
      const newRecord = {
        id: "rec_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        username: username || "Buscador Anónimo",
        character: character || "Selina / Sophia",
        time: parseFloat(time.toFixed(2)),
        score: Math.round(score),
        completed: Boolean(completed),
        philosophicalRank: this.calculateRank(score, time, completed),
        date: new Date().toISOString()
      };

      this.records.push(newRecord);
      this.saveToStorage();
      return newRecord;
    },

    calculateRank(score, time, completed) {
      if (!completed) return "Prisionero en Despertar";
      if (time <= 60 && score >= 2000) return "Sabio Iluminado";
      if (time <= 90 && score >= 1200) return "Filósofo Libre";
      return "Buscador de la Verdad";
    },

    saveToStorage() {
      try {
        localStorage.setItem(STORAGE_LEADERBOARD_KEY, JSON.stringify(this.records));
      } catch (e) {
        console.error("Error al guardar ranking en localStorage:", e);
      }
    },

    resetToDefaults() {
      this.records = [...DEFAULT_PHILOSOPHER_RECORDS];
      this.saveToStorage();
    }
  }
});
