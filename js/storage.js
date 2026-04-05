// ============================================================
// 存储管理模块
// ============================================================
var Storage = {
  KEYS: {
    HIGH_SCORE: 'snake_evo_high_score',
    ACHIEVEMENTS: 'snake_evo_achievements',
    STATS: 'snake_evo_stats'
  },

  getHighScore() {
    return parseInt(localStorage.getItem(this.KEYS.HIGH_SCORE) || '0', 10);
  },

  setHighScore(score) {
    localStorage.setItem(this.KEYS.HIGH_SCORE, String(score));
  },

  getAchievements() {
    return JSON.parse(localStorage.getItem(this.KEYS.ACHIEVEMENTS) || '[]');
  },

  addAchievement(id) {
    const achievements = this.getAchievements();
    if (!achievements.includes(id)) {
      achievements.push(id);
      localStorage.setItem(this.KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
      return true;
    }
    return false;
  },

  getStats() {
    return JSON.parse(localStorage.getItem(this.KEYS.STATS) || '{"games":0,"totalScore":0,"foodEaten":0,"maxLevel":1}');
  },

  updateStats(stats) {
    localStorage.setItem(this.KEYS.STATS, JSON.stringify(stats));
  }
};
