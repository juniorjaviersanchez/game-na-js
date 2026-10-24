import { defineStore } from "pinia";
import gameConfig from "../data/gameConfig.json";
import charactersData from "../data/characters.json";
import soundManager from "../audio/SoundManager";

export const GameState = {
  MENU: "MENU",
  PLAYING: "PLAYING",
  PAUSED_QUESTION: "PAUSED_QUESTION",
  GAME_OVER: "GAME_OVER",
  VICTORY: "VICTORY"
};

export const useGameStore = defineStore("game", {
  state: () => ({
    state: GameState.MENU,
    distance: 0,
    targetDistance: gameConfig.targetDistance || 200,
    boxInterval: gameConfig.boxInterval || 20,
    speed: gameConfig.initialSpeed || 10,
    baseSpeed: gameConfig.initialSpeed || 10,
    maxSpeed: gameConfig.maxSpeed || 20,
    score: 0,
    sparksCollected: 0,
    multiplier: 1,
    multiplierTimer: 0,
    elapsedTime: 0,
    startTime: 0,
    activeBoxIndex: 0,
    selectedCharacter: charactersData[0],
    characters: charactersData,
    currentZone: gameConfig.zones[0],
    isMuted: false,
    sfxVolume: 0.8,
    musicVolume: 0.5,
    lastBoxTriggerDistance: 0
  }),

  getters: {
    progressPercent: (state) => {
      return Math.min(Math.round((state.distance / state.targetDistance) * 100), 100);
    },
    formattedTime: (state) => {
      const mins = Math.floor(state.elapsedTime / 60);
      const secs = (state.elapsedTime % 60).toFixed(2);
      return `${mins > 0 ? mins + ":" : ""}${secs.padStart(5, "0")}s`;
    },
    isGameActive: (state) => state.state === GameState.PLAYING
  },

  actions: {
    selectCharacterById(id) {
      const char = this.characters.find((c) => c.id === id);
      if (char) {
        this.selectedCharacter = char;
      }
    },

    startRace() {
      this.state = GameState.PLAYING;
      this.distance = 0;
      this.score = 0;
      this.sparksCollected = 0;
      this.multiplier = 1;
      this.elapsedTime = 0;
      this.startTime = performance.now();
      this.activeBoxIndex = 0;
      this.lastBoxTriggerDistance = 0;
      this.speed = this.baseSpeed * (this.selectedCharacter.speedBonus || 1.0);
      this.updateCurrentZone();

      soundManager.unlock();
      soundManager.startAmbient();
      soundManager.updateAmbientProgression(0, this.targetDistance);
    },

    updateFrame(deltaSeconds) {
      if (this.state !== GameState.PLAYING) return;

      // Actualizar tiempo transcurrido
      this.elapsedTime += deltaSeconds;

      // Calcular aceleración progresiva de 0m a 200m
      const progress = this.distance / this.targetDistance;
      const speedRamp = this.baseSpeed + progress * (this.maxSpeed - this.baseSpeed);
      this.speed = speedRamp * (this.selectedCharacter.speedBonus || 1.0);

      // Avanzar distancia
      const deltaDist = this.speed * deltaSeconds;
      this.distance += deltaDist;

      // Actualizar zona del mito de la caverna
      this.updateCurrentZone();

      // Modular música procedural ambiental
      soundManager.updateAmbientProgression(this.distance, this.targetDistance);

      // Verificar meta (200 metros alcanzados)
      if (this.distance >= this.targetDistance) {
        this.distance = this.targetDistance;
        this.triggerVictory();
      }
    },

    updateCurrentZone() {
      const zone = gameConfig.zones.find(
        (z) => this.distance >= z.start && this.distance < z.end
      ) || gameConfig.zones[gameConfig.zones.length - 1];

      if (this.currentZone.name !== zone.name) {
        this.currentZone = zone;
      }
    },

    collectSpark() {
      this.sparksCollected += 1;
      const points = gameConfig.sparkValue * this.multiplier;
      this.score += points;
      soundManager.playCollectSpark();
    },

    pauseForQuestion(boxDistance) {
      this.state = GameState.PAUSED_QUESTION;
      this.lastBoxTriggerDistance = boxDistance;
      soundManager.playBoxShatter();
      soundManager.playQuestionReveal();
    },

    resumeAfterQuestion(isCorrect) {
      if (isCorrect) {
        let points = gameConfig.correctQuestionScore;
        if (this.selectedCharacter.id === "lumina") {
          points = Math.round(points * 1.5); // Perk de Diotima
        }
        this.score += points;
        this.multiplier = Math.min(this.multiplier + 1, 5);
        soundManager.playCorrect();
      } else {
        this.score = Math.max(0, this.score - gameConfig.wrongQuestionPenalty);
        this.multiplier = 1;
        soundManager.playWrong();
      }

      this.state = GameState.PLAYING;
    },

    hitObstacle() {
      soundManager.playHit();
      // Pequeña pérdida de velocidad temporal y penalización de combo
      this.multiplier = 1;
      this.score = Math.max(0, this.score - 15);
    },

    triggerVictory() {
      this.state = GameState.VICTORY;
      soundManager.playVictory();
    },

    triggerGameOver() {
      this.state = GameState.GAME_OVER;
      soundManager.stopAmbient();
    },

    returnToMenu() {
      this.state = GameState.MENU;
      soundManager.stopAmbient();
    },

    toggleMute() {
      this.isMuted = !this.isMuted;
      soundManager.setMuted(this.isMuted);
    },

    setAudioVolumes(sfx, music) {
      this.sfxVolume = sfx;
      this.musicVolume = music;
      soundManager.setVolumes(sfx, music);
    }
  }
});
