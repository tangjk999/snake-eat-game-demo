// ============================================================
// 游戏核心模块
// ============================================================
var GameCore = {
  State: { START: 'start', PLAYING: 'playing', PAUSED: 'paused', GAME_OVER: 'game_over' },
  GRID_SIZE: 18,
  CELL_COUNT: 20,

  state: 'start',
  score: 0,
  highScore: 0,
  level: 1,
  lives: 3,
  mode: 'classic',

  moveInterval: 140,
  baseMoveInterval: 140,
  lastMoveTime: 0,
  survivalTime: 0,
  survivalTimer: 0,

  powerUps: {
    shield: { active: false, timer: 0, duration: 8000 },
    speed: { active: false, timer: 0, duration: 5000 },
    slow: { active: false, timer: 0, duration: 6000 },
    ghost: { active: false, timer: 0, duration: 4000 },
    magnet: { active: false, timer: 0, duration: 5000 },
    life: { active: false, timer: 0, duration: 0 }
  },

  achievements: [
    { id: 'first_bite', name: '初尝', desc: '吃掉第一个食物', check: s => s.foodEaten >= 1 },
    { id: 'glutton', name: '暴食', desc: '单局吃50个食物', check: s => s.foodEaten >= 50 },
    { id: 'survivor_100', name: '生存100秒', desc: '存活100秒', check: s => s.survivalTime >= 100 },
    { id: 'level_5', name: '五级跳', desc: '达到5级', check: s => s.maxLevel >= 5 },
    { id: 'level_10', name: '十级满', desc: '达到10级', check: s => s.maxLevel >= 10 },
    { id: 'score_1000', name: '千分王', desc: '单局得1000分', check: s => s.score >= 1000 },
    { id: 'score_5000', name: '五千分', desc: '单局得5000分', check: s => s.score >= 5000 },
    { id: 'no_power', name: '纯技术', desc: '不使用任何能量通关', check: s => s.usedPower === false },
    { id: 'marathon', name: '马拉松', desc: '通关经典模式', check: (s, m) => m === 'classic' && s.won },
    { id: 'speed_demon', name: '速度恶魔', desc: '使用加速通过5级', check: s => s.speedUsed && s.maxLevel >= 5 }
  ],

  sessionStats: { foodEaten: 0, survivalTime: 0, maxLevel: 1, usedPower: false, speedUsed: false, won: false },

  init() {
    this.highScore = Storage.getHighScore();
    document.getElementById('high-score').textContent = this.highScore;
  },

  reset() {
    this.score = 0;
    this.level = 1;
    this.lives = this.mode === 'zen' ? 999 : 3;
    this.moveInterval = this.baseMoveInterval;
    this.survivalTime = 0;
    this.survivalTimer = 0;
    this.sessionStats = { foodEaten: 0, survivalTime: 0, maxLevel: 1, usedPower: false, speedUsed: false, won: false };

    Object.values(this.powerUps).forEach(p => { p.active = false; p.timer = 0; });

    this.updateUI();
  },

  updateUI() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('level').textContent = this.level;
    document.getElementById('lives').textContent = this.lives;

    const powerNames = Object.entries(this.powerUps)
      .filter(([_, p]) => p.active)
      .map(([name, _]) => ({ name, timer: Math.ceil(this.powerUps[name].timer / 1000) }));

    document.getElementById('power').textContent = powerNames.length
      ? powerNames.map(p => `${p.name}[${p.timer}s]`).join(' ')
      : '-';

    ['shield', 'speed', 'slow', 'ghost', 'magnet'].forEach(name => {
      const el = document.getElementById(`status-${name}`);
      el.classList.toggle('active', this.powerUps[name].active);
    });

    if (this.score > this.highScore) {
      this.highScore = this.score;
      document.getElementById('high-score').textContent = this.highScore;
      Storage.setHighScore(this.highScore);
    }
  },

  addScore(points) {
    const multiplier = this.powerUps.speed.active ? 2 : 1;
    this.score += points * multiplier;
    this.updateUI();
  },

  addTimeScore() {
    if (this.state === this.State.PLAYING) {
      this.addScore(1);
    }
  },

  levelUp() {
    this.level++;
    this.sessionStats.maxLevel = Math.max(this.sessionStats.maxLevel, this.level);
    this.moveInterval = Math.max(60, this.baseMoveInterval - (this.level - 1) * 8);
    AudioManager.play('levelup');

    const canvas = document.getElementById('canvas');
    ParticleSystem.emit(canvas.width/2, canvas.height/2, '#ffd700', 30);
  },

  loseLife() {
    if (this.powerUps.shield.active) {
      this.powerUps.shield.active = false;
      AudioManager.play('powerdown');
      return;
    }

    this.lives--;
    AudioManager.play('hurt');
    this.updateUI();

    const canvas = document.getElementById('canvas');
    ParticleSystem.emit(canvas.width/2, canvas.height/2, '#ff3333', 20);

    if (this.lives <= 0) {
      this.gameOver();
    }
  },

  activatePowerUp(type) {
    const power = this.powerUps[type];
    if (!power) return;

    power.active = true;
    power.timer = power.duration;
    this.sessionStats.usedPower = true;

    if (type === 'speed') this.sessionStats.speedUsed = true;

    AudioManager.play(type === 'powerup' ? 'powerup' : 'powerdown');
    this.updateUI();
  },

  updatePowerUps(dt) {
    Object.values(this.powerUps).forEach(power => {
      if (power.active) {
        power.timer -= dt;
        if (power.timer <= 0) {
          power.active = false;
          AudioManager.play('powerdown');
        }
      }
    });
    this.updateUI();
  },

  checkAchievements(mode) {
    const stats = { ...this.sessionStats, score: this.score, mode };
    const newAchievements = [];

    this.achievements.forEach(a => {
      if (Storage.addAchievement(a.id) && a.check(stats, mode)) {
        newAchievements.push(a);
      }
    });

    return newAchievements;
  },

  gameOver() {
    this.state = this.State.GAME_OVER;
    AudioManager.play('die');

    const stats = Storage.getStats();
    stats.games++;
    stats.totalScore += this.score;
    stats.foodEaten += this.sessionStats.foodEaten;
    stats.maxLevel = Math.max(stats.maxLevel, this.sessionStats.maxLevel);
    Storage.updateStats(stats);
  },

  setState(newState) {
    this.state = newState;
  }
};
