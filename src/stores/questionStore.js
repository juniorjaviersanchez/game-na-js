import { defineStore } from "pinia";
import questionsData from "../data/questions.json";

export const useQuestionStore = defineStore("question", {
  state: () => ({
    allQuestions: questionsData,
    usedQuestionIds: new Set(),
    currentQuestion: null,
    totalAnswered: 0,
    totalCorrect: 0,
    totalWrong: 0,
    streak: 0,
    bestStreak: 0
  }),

  getters: {
    easyQuestions: (state) => state.allQuestions.filter((q) => q.nivel === "facil"),
    mediumQuestions: (state) => state.allQuestions.filter((q) => q.nivel === "media"),
    hardQuestions: (state) => state.allQuestions.filter((q) => q.nivel === "dificil")
  },

  actions: {
    resetSession() {
      this.usedQuestionIds.clear();
      this.currentQuestion = null;
      this.totalAnswered = 0;
      this.totalCorrect = 0;
      this.totalWrong = 0;
      this.streak = 0;
      this.bestStreak = 0;
    },

    getRandomQuestion(level = "facil") {
      let pool = this.allQuestions.filter(
        (q) => q.nivel === level && !this.usedQuestionIds.has(q.id)
      );

      // Si se agotaron las del nivel, reiniciamos el historial de ese nivel
      if (pool.length === 0) {
        this.allQuestions
          .filter((q) => q.nivel === level)
          .forEach((q) => this.usedQuestionIds.delete(q.id));
        pool = this.allQuestions.filter((q) => q.nivel === level);
      }

      if (pool.length === 0) {
        pool = this.allQuestions;
      }

      const randomIndex = Math.floor(Math.random() * pool.length);
      const chosen = pool[randomIndex];
      this.usedQuestionIds.add(chosen.id);

      // Barajamos las alternativas preservando el índice correcto
      const correctAnswerText = chosen.alternativas[chosen.correcta];
      const shuffledOptions = [...chosen.alternativas].sort(() => Math.random() - 0.5);
      const newCorrectIndex = shuffledOptions.indexOf(correctAnswerText);

      this.currentQuestion = {
        ...chosen,
        alternativas: shuffledOptions,
        correcta: newCorrectIndex
      };

      return this.currentQuestion;
    },

    submitAnswer(selectedIndex) {
      if (!this.currentQuestion) return { isCorrect: false, explanation: "" };

      const isCorrect = selectedIndex === this.currentQuestion.correcta;
      this.totalAnswered += 1;

      if (isCorrect) {
        this.totalCorrect += 1;
        this.streak += 1;
        if (this.streak > this.bestStreak) {
          this.bestStreak = this.streak;
        }
      } else {
        this.totalWrong += 1;
        this.streak = 0;
      }

      return {
        isCorrect,
        correctIndex: this.currentQuestion.correcta,
        explanation: this.currentQuestion.explicacion
      };
    }
  }
});
