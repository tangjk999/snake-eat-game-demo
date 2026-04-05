// ============================================================
// 输入处理模块
// ============================================================
var InputHandler = {
  touchStartX: 0,
  touchStartY: 0,

  init() {
    document.addEventListener('keydown', this.onKeyDown.bind(this));

    const canvas = document.getElementById('canvas');
    canvas.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
    canvas.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false });

    document.getElementById('dpad-up').addEventListener('touchstart', e => { e.preventDefault(); this.handleDpad('UP'); });
    document.getElementById('dpad-down').addEventListener('touchstart', e => { e.preventDefault(); this.handleDpad('DOWN'); });
    document.getElementById('dpad-left').addEventListener('touchstart', e => { e.preventDefault(); this.handleDpad('LEFT'); });
    document.getElementById('dpad-right').addEventListener('touchstart', e => { e.preventDefault(); this.handleDpad('RIGHT'); });
  },

  handleDpad(dir) {
    const dirMap = { UP: SnakeLogic.Direction.UP, DOWN: SnakeLogic.Direction.DOWN, LEFT: SnakeLogic.Direction.LEFT, RIGHT: SnakeLogic.Direction.RIGHT };
    if (GameCore.state === GameCore.State.PLAYING) {
      SnakeLogic.setDirection(dirMap[dir]);
    } else if (GameCore.state === GameCore.State.START || GameCore.state === GameCore.State.GAME_OVER) {
      startGame();
    }
  },

  onKeyDown(e) {
    const keyMap = {
      'ArrowUp': SnakeLogic.Direction.UP, 'KeyW': SnakeLogic.Direction.UP,
      'ArrowDown': SnakeLogic.Direction.DOWN, 'KeyS': SnakeLogic.Direction.DOWN,
      'ArrowLeft': SnakeLogic.Direction.LEFT, 'KeyA': SnakeLogic.Direction.LEFT,
      'ArrowRight': SnakeLogic.Direction.RIGHT, 'KeyD': SnakeLogic.Direction.RIGHT
    };

    if (keyMap[e.code]) {
      e.preventDefault();
      if (GameCore.state === GameCore.State.PLAYING) {
        SnakeLogic.setDirection(keyMap[e.code]);
      }
    }

    if (e.code === 'Space' || e.code === 'KeyP') {
      e.preventDefault();
      this.togglePause();
    }
  },

  onTouchStart(e) {
    e.preventDefault();
    const t = e.touches[0];
    this.touchStartX = t.clientX;
    this.touchStartY = t.clientY;
  },

  onTouchEnd(e) {
    e.preventDefault();
    const t = e.changedTouches[0];
    const dx = t.clientX - this.touchStartX;
    const dy = t.clientY - this.touchStartY;

    if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) return;

    let dir;
    if (Math.abs(dx) > Math.abs(dy)) {
      dir = dx > 0 ? SnakeLogic.Direction.RIGHT : SnakeLogic.Direction.LEFT;
    } else {
      dir = dy > 0 ? SnakeLogic.Direction.DOWN : SnakeLogic.Direction.UP;
    }

    if (GameCore.state === GameCore.State.PLAYING) {
      SnakeLogic.setDirection(dir);
    } else if (GameCore.state === GameCore.State.START || GameCore.state === GameCore.State.GAME_OVER) {
      startGame();
    }
  },

  togglePause() {
    if (GameCore.state === GameCore.State.PLAYING) {
      GameCore.setState(GameCore.State.PAUSED);
      showOverlay('暂停', null, '继续', () => {
        GameCore.setState(GameCore.State.PLAYING);
        document.getElementById('overlay').classList.add('hidden');
      });
    } else if (GameCore.state === GameCore.State.PAUSED) {
      GameCore.setState(GameCore.State.PLAYING);
      document.getElementById('overlay').classList.add('hidden');
    }
  }
};
