export default class PersistentLearningEngine {
  constructor() {
    this.isReady = true;
    this.interactions = [];
    this.wordStats = new Map();
  }

  recordInteraction(userInput = '', bacteriaResponse = '', context = '', bacteriaId = '') {
    const words = userInput.split(/\s+/).filter(Boolean);
    words.forEach(word => {
      const stat = this.wordStats.get(word) || { count: 0, success: 0 };
      stat.count += 1;
      this.wordStats.set(word, stat);
    });
    this.interactions.push({ userInput, bacteriaResponse, context, bacteriaId, timestamp: Date.now() });
  }

  trackSpeech(_bacteria, message = '') {
    const words = message.split(/\s+/).filter(Boolean);
    words.forEach(word => {
      const stat = this.wordStats.get(word) || { count: 0, success: 0 };
      stat.count += 1;
      this.wordStats.set(word, stat);
    });
  }

  getWordSuccessRate(word) {
    const stat = this.wordStats.get(word);
    return stat ? (stat.success / stat.count) : 0;
  }

  getLearningStats() {
    return {
      totalInteractions: this.interactions.length,
      vocabularySize: this.wordStats.size,
      topWords: Array.from(this.wordStats.entries()).map(([word, s]) => ({ word, successRate: this.getWordSuccessRate(word) }))
    };
  }

  async clearDatabase() {
    this.interactions = [];
    this.wordStats.clear();
  }
}
