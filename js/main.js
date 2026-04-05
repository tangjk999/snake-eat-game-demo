// ============================================================
// 主入口模块
// ============================================================
let lastFrameTime = 0;
let survivalInterval = null;

function showOverlay(title, subtitle, btnText, btnCallback, extra = '') {
  const overlay = document.getElementById('overlay');
  overlay.classList.remove('hidden');
  overlay.innerHTML = `
    <h1 class="${GameCore.state === 'game_over' ? 'game-over' : GameCore.state === 'paused' ? 'paused' : ''}">${title}</h1>
    ${subtitle ? `<div class="stats">${subtitle}</div>` : ''}
    ${extra ? `<div class="achievements">${extra}</div>` : ''}
    ${btnText ? `<button id="action-btn" class="pixel-btn">${btnText}</button>` : ''}
  `;
  if (btnText && btnCallback) {
    document.getElementById('action-btn').addEventListener('click', btnCallback);
  }
}

function showLevelUp() {
  showOverlay(`等级 ${GameCore.level}!`, `速度加快`, '继续', () => {
    document.getElementById('overlay').classList.add('hidden');
  }, '');
}

function startGame() {
  AudioManager.init();
  GameCore.reset();
  SnakeLogic.init();
  SnakeLogic.spawnObstacles();
  GameCore.setState(GameCore.State.PLAYING);
  document.getElementById('overlay').classList.add('hidden');

  clearInterval(survivalInterval);
  survivalInterval = setInterval(() => {
    if (GameCore.state === GameCore.State.PLAYING) {
      GameCore.sessionStats.survivalTime++;
      GameCore.addTimeScore();
    }
  }, 1000);

  lastFrameTime = performance.now();
  requestAnimationFrame(gameLoop);
}

function gameOver() {
  GameCore.gameOver();

  const newAchievements = GameCore.checkAchievements(GameCore.mode);
  let achievementText = '';

  if (newAchievements.length > 0) {
    achievementText = newAchievements.map(a => `🏆 ${a.name}: ${a.desc}`).join('<br>');
  }

  showOverlay(
    'GAME OVER',
    `得分: ${GameCore.score}<br>等级: ${GameCore.level}<br>食物: ${GameCore.sessionStats.foodEaten}`,
    '再来一局',
    startGame,
    achievementText
  );
}

function gameLoop(timestamp) {
  if (GameCore.state !== GameCore.State.PLAYING) return;

  const dt = timestamp - lastFrameTime;
  const moveDelay = GameCore.powerUps.slow.active ? GameCore.moveInterval * 1.5 :
                    GameCore.powerUps.speed.active ? GameCore.moveInterval * 0.5 :
                    GameCore.moveInterval;

  GameCore.updatePowerUps(dt);

  if (dt >= moveDelay) {
    lastFrameTime = timestamp;
    const result = SnakeLogic.move();

    if (result === 'wall_crash' || result === 'self_crash' || result === 'obstacle_crash') {
      if (GameCore.state === GameCore.State.GAME_OVER) {
        gameOver();
        return;
      }
      SnakeLogic.init();
      SnakeLogic.spawnObstacles();
    }

    Renderer.render(dt);
  } else {
    Renderer.render(dt);
    ParticleSystem.update();
  }

  requestAnimationFrame(gameLoop);
}

function init() {
  GameCore.init();
  Renderer.init();
  InputHandler.init();
  ParticleSystem.init();

  document.getElementById('start-btn').addEventListener('click', startGame);

  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      GameCore.mode = btn.dataset.mode;

      const configs = {
        classic: { lives: 3, baseInterval: 140 },
        arcade: { lives: 1, baseInterval: 100 },
        zen: { lives: 999, baseInterval: 180 },
        nightmare: { lives: 1, baseInterval: 80 }
      };

      const config = configs[GameCore.mode] || configs.classic;
      GameCore.lives = config.lives;
      GameCore.baseMoveInterval = config.baseInterval;
      GameCore.moveInterval = config.baseInterval;
    });
  });

  Renderer.render(0);
}

window.addEventListener('DOMContentLoaded', init);
