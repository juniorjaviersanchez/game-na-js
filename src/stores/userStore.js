import { defineStore } from "pinia";

const STORAGE_USERS_KEY = "game_na_users_profiles";
const STORAGE_ACTIVE_USER_KEY = "game_na_active_username";

export const useUserStore = defineStore("user", {
  state: () => ({
    currentUser: null,
    usersList: [],
    selectedCharacterId: "selina"
  }),

  actions: {
    loadFromStorage() {
      try {
        const storedUsers = localStorage.getItem(STORAGE_USERS_KEY);
        this.usersList = storedUsers ? JSON.parse(storedUsers) : [];

        const activeUsername = localStorage.getItem(STORAGE_ACTIVE_USER_KEY);
        if (activeUsername) {
          const user = this.usersList.find((u) => u.username === activeUsername);
          if (user) {
            this.currentUser = user;
            this.selectedCharacterId = user.preferredCharacter || "selina";
          }
        }
      } catch (e) {
        console.error("Error al cargar usuarios de localStorage:", e);
      }
    },

    loginUser(username, characterId = "selina") {
      const cleanName = username.trim();
      if (!cleanName) return null;

      let user = this.usersList.find(
        (u) => u.username.toLowerCase() === cleanName.toLowerCase()
      );

      if (!user) {
        user = {
          username: cleanName,
          preferredCharacter: characterId,
          gamesPlayed: 0,
          victories: 0,
          bestTime: null,
          bestScore: 0,
          createdAt: new Date().toISOString()
        };
        this.usersList.push(user);
      } else {
        if (characterId) {
          user.preferredCharacter = characterId;
        }
      }

      this.currentUser = user;
      this.selectedCharacterId = user.preferredCharacter;
      this.saveToStorage();
      return user;
    },

    selectCharacter(characterId) {
      this.selectedCharacterId = characterId;
      if (this.currentUser) {
        this.currentUser.preferredCharacter = characterId;
        this.saveToStorage();
      }
    },

    logout() {
      this.currentUser = null;
      localStorage.removeItem(STORAGE_ACTIVE_USER_KEY);
    },

    recordGameResult({ completed, time, score, characterId }) {
      if (!this.currentUser) return;

      this.currentUser.gamesPlayed += 1;
      if (completed) {
        this.currentUser.victories += 1;
        if (!this.currentUser.bestTime || time < this.currentUser.bestTime) {
          this.currentUser.bestTime = time;
        }
      }
      if (score > this.currentUser.bestScore) {
        this.currentUser.bestScore = score;
      }
      this.saveToStorage();
    },

    saveToStorage() {
      try {
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(this.usersList));
        if (this.currentUser) {
          localStorage.setItem(STORAGE_ACTIVE_USER_KEY, this.currentUser.username);
        }
      } catch (e) {
        console.error("Error al guardar en localStorage:", e);
      }
    }
  }
});
