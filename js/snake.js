// ============================================================
// 蛇逻辑模块
// ============================================================
const SnakeLogic = {
  Direction: {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
  },

  body: [],
  direction: null,
  nextDirection: null,
  food: null,
  specialFood: null,
  obstacles: [],

  init() {
    const cx = Math.floor(GameCore.CELL_COUNT / 2);
    const cy = Math.floor(GameCore.CELL_COUNT / 2);
    this.body = [
      { x: cx, y: cy },
      { x: cx - 1, y: cy },
      { x: cx - 2, y: cy }
    ];
    this.direction = this.Direction.RIGHT;
    this.nextDirection = this.Direction.RIGHT;
    this.obstacles = [];
    this.specialFood = null;
    this.spawnFood();
  },

  spawnFood() {
    let pos;
    do {
      pos = {
        x: Math.floor(Math.random() * GameCore.CELL_COUNT),
        y: Math.floor(Math.random() * GameCore.CELL_COUNT)
      };
    } while (this.body.some(seg => seg.x === pos.x && seg.y === pos.y) ||
             this.obstacles.some(o => o.x === pos.x && o.y === pos.y));
    this.food = pos;

    if (Math.random() < 0.15 + GameCore.level * 0.02) {
      this.spawnSpecialFood();
    }
  },

  spawnSpecialFood() {
    const types = ['shield', 'speed', 'slow', 'ghost', 'magnet', 'life'];
    const weights = [0.2, 0.15, 0.15, 0.15, 0.15, 0.2];

    let r = Math.random();
    let type = types[0];
    let cumulative = 0;

    for (let i = 0; i < types.length; i++) {
      cumulative += weights[i];
      if (r < cumulative) {
        type = types[i];
        break;
      }
    }

    let pos;
    let attempts = 0;
    do {
      pos = {
        x: Math.floor(Math.random() * GameCore.CELL_COUNT),
        y: Math.floor(Math.random() * GameCore.CELL_COUNT)
      };
      attempts++;
    } while ((this.body.some(seg => seg.x === pos.x && seg.y === pos.y) ||
              this.obstacles.some(o => o.x === pos.x && o.y === pos.y) ||
              (this.food && this.food.x === pos.x && this.food.y === pos.y)) && attempts < 50);

    if (attempts < 50) {
      this.specialFood = { ...pos, type };
    }
  },

  spawnObstacles() {
    if (GameCore.level < 3) return;

    const count = Math.min((GameCore.level - 2) * 2, 15);
    this.obstacles = [];

    for (let i = 0; i < count; i++) {
      let pos;
      let attempts = 0;
      do {
        pos = {
          x: Math.floor(Math.random() * GameCore.CELL_COUNT),
          y: Math.floor(Math.random() * GameCore.CELL_COUNT)
        };
        attempts++;
      } while ((this.body.some(s => s.x === pos.x && s.y === pos.y) ||
               (this.food && this.food.x === pos.x && this.food.y === pos.y) ||
               (this.specialFood && this.specialFood.x === pos.x && this.specialFood.y === pos.y)) && attempts < 30);

      if (attempts < 30) {
        this.obstacles.push(pos);
      }
    }
  },

  setDirection(dir) {
    const opposite = (
      (this.direction === this.Direction.UP && dir === this.Direction.DOWN) ||
      (this.direction === this.Direction.DOWN && dir === this.Direction.UP) ||
      (this.direction === this.Direction.LEFT && dir === this.Direction.RIGHT) ||
      (this.direction === this.Direction.RIGHT && dir === this.Direction.LEFT)
    );
    if (!opposite) {
      this.nextDirection = dir;
    }
  },

  move() {
    this.direction = this.nextDirection;
    const head = this.body[0];
    let newHead = {
      x: head.x + this.direction.x,
      y: head.y + this.direction.y
    };

    const wrap = GameCore.powerUps.ghost.active;
    const wallCrash = newHead.x < 0 || newHead.x >= GameCore.CELL_COUNT ||
                      newHead.y < 0 || newHead.y >= GameCore.CELL_COUNT;

    if (wallCrash) {
      if (wrap) {
        newHead.x = (newHead.x + GameCore.CELL_COUNT) % GameCore.CELL_COUNT;
        newHead.y = (newHead.y + GameCore.CELL_COUNT) % GameCore.CELL_COUNT;
      } else {
        GameCore.loseLife();
        return 'wall_crash';
      }
    }

    const selfCrash = this.body.some((seg, i) => i > 0 && seg.x === newHead.x && seg.y === newHead.y);
    if (selfCrash) {
      GameCore.loseLife();
      return 'self_crash';
    }

    const obstacleHit = this.obstacles.some(o => o.x === newHead.x && o.y === newHead.y);
    if (obstacleHit && !GameCore.powerUps.shield.active) {
      GameCore.loseLife();
      return 'obstacle_crash';
    }

    this.body.unshift(newHead);

    // Magnet effect
    if (GameCore.powerUps.magnet.active && this.food) {
      const dx = this.food.x - newHead.x;
      const dy = this.food.y - newHead.y;
      if (Math.abs(dx) <= 3 && Math.abs(dy) <= 3) {
        newHead.x += Math.sign(dx);
        newHead.y += Math.sign(dy);
        this.body[0] = newHead;
      }
    }

    // Eat food
    if (this.food && newHead.x === this.food.x && newHead.y === this.food.y) {
      GameCore.sessionStats.foodEaten++;
      GameCore.addScore(10 + GameCore.level * 2);
      AudioManager.play('eat');

      const canvas = document.getElementById('canvas');
      const rect = canvas.getBoundingClientRect();
      ParticleSystem.emit(
        rect.left + (newHead.x + 0.5) * GameCore.GRID_SIZE,
        rect.top + (newHead.y + 0.5) * GameCore.GRID_SIZE,
        '#ff3333', 15
      );

      this.checkLevelUp();
      this.spawnFood();
      return 'ate';
    }

    // Eat special food
    if (this.specialFood && newHead.x === this.specialFood.x && newHead.y === this.specialFood.y) {
      const type = this.specialFood.type;
      AudioManager.play('eat-special');

      const canvas = document.getElementById('canvas');
      const rect = canvas.getBoundingClientRect();
      const colors = { shield: '#00ffff', speed: '#ffff00', slow: '#00ff00', ghost: '#ff00ff', magnet: '#ff8800', life: '#ff6b6b' };
      ParticleSystem.emit(
        rect.left + (newHead.x + 0.5) * GameCore.GRID_SIZE,
        rect.top + (newHead.y + 0.5) * GameCore.GRID_SIZE,
        colors[type] || '#ffffff', 25
      );

      if (type === 'life') {
        GameCore.lives = Math.min(GameCore.lives + 1, 9);
      } else {
        GameCore.activatePowerUp(type);
      }

      this.specialFood = null;
      return 'ate_special';
    }

    this.body.pop();
    return 'moved';
  },

  checkLevelUp() {
    const thresholds = [5, 15, 30, 50, 80, 120, 170, 230, 300, 400];
    if (GameCore.level <= thresholds.length && GameCore.sessionStats.foodEaten >= thresholds[GameCore.level - 1]) {
      GameCore.levelUp();
      this.spawnObstacles();
      if (Math.random() < 0.3) {
        this.spawnSpecialFood();
      }
    }
  },

  reset() {
    this.init();
  }
};
