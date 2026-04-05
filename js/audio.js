// ============================================================
// 音频管理模块
// ============================================================
const AudioManager = {
  ctx: null,

  init() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  },

  play(type) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = 'square';

    const now = this.ctx.currentTime;

    switch(type) {
      case 'eat':
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(660, now + 0.05);
        osc.frequency.setValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        break;

      case 'eat-special':
        osc.frequency.setValueAtTime(523, now);
        osc.frequency.setValueAtTime(659, now + 0.08);
        osc.frequency.setValueAtTime(784, now + 0.16);
        osc.frequency.setValueAtTime(1047, now + 0.24);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
        break;

      case 'powerup':
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.2);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
        break;

      case 'powerdown':
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
        break;

      case 'die':
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.5);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        break;

      case 'levelup':
        [523, 659, 784, 1047].forEach((freq, i) => {
          const o = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          o.connect(g);
          g.connect(this.ctx.destination);
          o.type = 'square';
          o.frequency.setValueAtTime(freq, now + i * 0.1);
          g.gain.setValueAtTime(0.12, now + i * 0.1);
          g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.15);
          o.start(now + i * 0.1);
          o.stop(now + i * 0.1 + 0.15);
        });
        break;

      case 'hurt':
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.setValueAtTime(150, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
    }
  }
};
