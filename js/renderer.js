// ============================================================
// 渲染器模块
// ============================================================
var Renderer = {
  canvas: null,
  ctx: null,
  gridSize: 0,
  cellCount: 0,
  foodPulse: 0,
  specialPulse: 0,

  init() {
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.cellCount = GameCore.CELL_COUNT;
    this.gridSize = GameCore.GRID_SIZE;
    this.canvas.width = this.cellCount * this.gridSize;
    this.canvas.height = this.cellCount * this.gridSize;
  },

  clear() {
    this.ctx.fillStyle = '#0a0a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  },

  drawGrid() {
    for (let x = 0; x < this.cellCount; x++) {
      for (let y = 0; y < this.cellCount; y++) {
        if ((x + y) % 2 === 0) {
          this.ctx.fillStyle = '#0f0f25';
          this.ctx.fillRect(x * this.gridSize, y * this.gridSize, this.gridSize, this.gridSize);
        }
      }
    }
  },

  drawObstacles() {
    this.ctx.fillStyle = '#3a3a5e';
    SnakeLogic.obstacles.forEach(o => {
      const x = o.x * this.gridSize;
      const y = o.y * this.gridSize;
      this.ctx.fillRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2);

      this.ctx.fillStyle = '#4a4a7e';
      this.ctx.fillRect(x + 3, y + 3, 4, 4);
      this.ctx.fillStyle = '#3a3a5e';
    });
  },

  drawSnake() {
    SnakeLogic.body.forEach((seg, i) => {
      const x = seg.x * this.gridSize;
      const y = seg.y * this.gridSize;
      const size = this.gridSize - 2;

      // Ghost effect
      if (GameCore.powerUps.ghost.active) {
        this.ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 100) * 0.2;
      }

      if (i === 0) {
        this.ctx.fillStyle = '#39ff14';
        this.ctx.fillRect(x + 2, y + 2, size - 2, size - 2);

        this.ctx.fillStyle = '#7fff5f';
        this.ctx.fillRect(x + 4, y + 4, 4, 4);

        this.ctx.fillStyle = '#000';
        const { direction } = SnakeLogic;
        let eyeX = 5, eyeY = 4;
        if (direction === SnakeLogic.Direction.LEFT) eyeX = 2;
        if (direction === SnakeLogic.Direction.RIGHT) eyeX = 9;
        if (direction === SnakeLogic.Direction.UP) { eyeX = 4; eyeY = 2; }
        if (direction === SnakeLogic.Direction.DOWN) { eyeX = 4; eyeY = 9; }
        this.ctx.fillRect(x + eyeX, y + eyeY, 3, 3);
        this.ctx.fillRect(x + eyeX + 4, y + eyeY, 3, 3);

        if (GameCore.powerUps.shield.active) {
          this.ctx.strokeStyle = '#00ffff';
          this.ctx.lineWidth = 2;
          this.ctx.strokeRect(x, y, this.gridSize, this.gridSize);
        }
      } else {
        const green = Math.max(80, 180 - i * 6);
        this.ctx.fillStyle = `rgb(40, ${green}, 40)`;
        this.ctx.fillRect(x + 2, y + 2, size - 2, size - 2);

        if (i % 3 === 0) {
          this.ctx.fillStyle = '#2a4a2a';
          this.ctx.fillRect(x + 4, y + 4, 3, 3);
        }
      }

      this.ctx.globalAlpha = 1;
    });
  },

  drawFood() {
    if (!SnakeLogic.food) return;

    const x = SnakeLogic.food.x * this.gridSize + this.gridSize / 2;
    const y = SnakeLogic.food.y * this.gridSize + this.gridSize / 2;
    const pulse = Math.sin(this.foodPulse) * 2;

    this.ctx.fillStyle = '#ff3333';
    this.ctx.beginPath();
    this.ctx.arc(x, y, 6 - pulse/2, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#ff6666';
    this.ctx.beginPath();
    this.ctx.arc(x - 2, y - 2, 2, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#8b4513';
    this.ctx.fillRect(x - 1, y - 9, 2, 4);

    this.ctx.fillStyle = '#39ff14';
    this.ctx.fillRect(x + 1, y - 8, 4, 2);
  },

  drawSpecialFood() {
    if (!SnakeLogic.specialFood) return;

    const x = SnakeLogic.specialFood.x * this.gridSize + this.gridSize / 2;
    const y = SnakeLogic.specialFood.y * this.gridSize + this.gridSize / 2;
    const pulse = Math.sin(this.specialPulse) * 3;
    const type = SnakeLogic.specialFood.type;

    const colors = {
      shield: '#00ffff',
      speed: '#ffff00',
      slow: '#00ff00',
      ghost: '#ff00ff',
      magnet: '#ff8800',
      life: '#ff6b6b'
    };

    this.ctx.fillStyle = colors[type] || '#fff';
    this.ctx.beginPath();
    this.ctx.arc(x, y, 8 + pulse, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#fff';
    this.ctx.beginPath();
    this.ctx.arc(x - 2, y - 2, 2, 0, Math.PI * 2);
    this.ctx.fill();

    // Glow
    this.ctx.shadowColor = colors[type];
    this.ctx.shadowBlur = 10 + pulse * 2;
    this.ctx.beginPath();
    this.ctx.arc(x, y, 5, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    // Icon
    this.ctx.fillStyle = '#000';
    this.ctx.font = '8px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    const icons = { shield: '🛡', speed: '⚡', slow: '🐢', ghost: '👻', magnet: '🧲', life: '❤' };
    this.ctx.fillText(icons[type] || '?', x, y + 1);
  },

  updateAnimations(dt) {
    this.foodPulse += 0.1;
    this.specialPulse += 0.15;
  },

  render(dt) {
    this.updateAnimations(dt);
    this.clear();
    this.drawGrid();
    this.drawObstacles();
    this.drawFood();
    this.drawSpecialFood();
    this.drawSnake();
  }
};
