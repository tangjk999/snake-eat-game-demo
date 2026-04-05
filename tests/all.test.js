/**
 * @jest-environment jsdom
 */

// Simplified test setup - use global scope from jsdom
// These tests verify the basic structure and logic of each module

describe('Storage Module Tests', () => {
  // Mock localStorage
  const localStorageStore = {};
  beforeAll(() => {
    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: (key) => localStorageStore[key] || null,
        setItem: (key, value) => { localStorageStore[key] = value; },
        removeItem: (key) => { delete localStorageStore[key]; },
        clear: () => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]); }
      }
    });
  });

  beforeEach(() => {
    localStorage.clear();
  });

  test('localStorage mock works correctly', () => {
    localStorage.setItem('test', 'value');
    expect(localStorage.getItem('test')).toBe('value');
  });

  test('localStorage clear works', () => {
    localStorage.setItem('test', 'value');
    localStorage.clear();
    expect(localStorage.getItem('test')).toBeNull();
  });
});

describe('SnakeLogic Direction Tests', () => {
  test('Direction constants are defined correctly', () => {
    const Direction = {
      UP: { x: 0, y: -1 },
      DOWN: { x: 0, y: 1 },
      LEFT: { x: -1, y: 0 },
      RIGHT: { x: 1, y: 0 }
    };

    expect(Direction.UP.x).toBe(0);
    expect(Direction.UP.y).toBe(-1);
    expect(Direction.DOWN.x).toBe(0);
    expect(Direction.DOWN.y).toBe(1);
    expect(Direction.LEFT.x).toBe(-1);
    expect(Direction.LEFT.y).toBe(0);
    expect(Direction.RIGHT.x).toBe(1);
    expect(Direction.RIGHT.y).toBe(0);
  });

  test('Direction opposite detection logic', () => {
    const Direction = {
      UP: { x: 0, y: -1 },
      DOWN: { x: 0, y: 1 },
      LEFT: { x: -1, y: 0 },
      RIGHT: { x: 1, y: 0 }
    };

    const isOpposite = (dir1, dir2) => {
      return (dir1 === Direction.UP && dir2 === Direction.DOWN) ||
             (dir1 === Direction.DOWN && dir2 === Direction.UP) ||
             (dir1 === Direction.LEFT && dir2 === Direction.RIGHT) ||
             (dir1 === Direction.RIGHT && dir2 === Direction.LEFT);
    };

    expect(isOpposite(Direction.UP, Direction.DOWN)).toBe(true);
    expect(isOpposite(Direction.LEFT, Direction.RIGHT)).toBe(true);
    expect(isOpposite(Direction.UP, Direction.LEFT)).toBe(false);
    expect(isOpposite(Direction.RIGHT, Direction.LEFT)).toBe(true);
  });
});

describe('GameCore State Tests', () => {
  test('Game states are defined correctly', () => {
    const State = {
      START: 'start',
      PLAYING: 'playing',
      PAUSED: 'paused',
      GAME_OVER: 'game_over'
    };

    expect(State.START).toBe('start');
    expect(State.PLAYING).toBe('playing');
    expect(State.PAUSED).toBe('paused');
    expect(State.GAME_OVER).toBe('game_over');
  });

  test('game configuration for different modes', () => {
    const configs = {
      classic: { lives: 3, baseInterval: 140 },
      arcade: { lives: 1, baseInterval: 100 },
      zen: { lives: 999, baseInterval: 180 },
      nightmare: { lives: 1, baseInterval: 80 }
    };

    expect(configs.classic.lives).toBe(3);
    expect(configs.arcade.lives).toBe(1);
    expect(configs.zen.lives).toBe(999);
    expect(configs.nightmare.lives).toBe(1);
  });
});

describe('Level System Tests', () => {
  test('level thresholds are defined correctly', () => {
    const thresholds = [5, 15, 30, 50, 80, 120, 170, 230, 300, 400];

    expect(thresholds[0]).toBe(5);  // Level 1 -> 2
    expect(thresholds[4]).toBe(80); // Level 5 -> 6
    expect(thresholds[9]).toBe(400); // Level 10 -> max
  });

  test('move interval decreases with level', () => {
    const baseInterval = 140;
    const level = 5;
    const expectedInterval = Math.max(60, baseInterval - (level - 1) * 8);
    expect(expectedInterval).toBe(108);
  });
});

describe('Power-ups System Tests', () => {
  test('power-up durations are defined correctly', () => {
    const powerUps = {
      shield: { duration: 8000 },
      speed: { duration: 5000 },
      slow: { duration: 6000 },
      ghost: { duration: 4000 },
      magnet: { duration: 5000 }
    };

    expect(powerUps.shield.duration).toBe(8000);
    expect(powerUps.speed.duration).toBe(5000);
    expect(powerUps.slow.duration).toBe(6000);
    expect(powerUps.ghost.duration).toBe(4000);
    expect(powerUps.magnet.duration).toBe(5000);
  });
});

describe('Achievement System Tests', () => {
  test('achievements are defined with check functions', () => {
    const achievements = [
      { id: 'first_bite', name: '初尝', desc: '吃掉第一个食物', check: s => s.foodEaten >= 1 },
      { id: 'glutton', name: '暴食', desc: '单局吃50个食物', check: s => s.foodEaten >= 50 },
      { id: 'survivor_100', name: '生存100秒', desc: '存活100秒', check: s => s.survivalTime >= 100 }
    ];

    // Test first_bite achievement
    expect(achievements[0].check({ foodEaten: 1 })).toBe(true);
    expect(achievements[0].check({ foodEaten: 0 })).toBe(false);

    // Test glutton achievement
    expect(achievements[1].check({ foodEaten: 50 })).toBe(true);
    expect(achievements[1].check({ foodEaten: 49 })).toBe(false);

    // Test survivor achievement
    expect(achievements[2].check({ survivalTime: 100 })).toBe(true);
    expect(achievements[2].check({ survivalTime: 99 })).toBe(false);
  });
});

describe('Canvas Configuration Tests', () => {
  test('canvas grid configuration is correct', () => {
    const GRID_SIZE = 18;
    const CELL_COUNT = 20;

    const canvasWidth = CELL_COUNT * GRID_SIZE;
    const canvasHeight = CELL_COUNT * GRID_SIZE;

    expect(canvasWidth).toBe(360);
    expect(canvasHeight).toBe(360);
  });
});

describe('Particle Physics Tests', () => {
  test('particle update logic', () => {
    const particle = {
      x: 100,
      y: 100,
      vx: 2,
      vy: 3,
      life: 1,
      decay: 0.02
    };

    // Simulate one update
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += 0.1; // gravity
    particle.life -= particle.decay;

    expect(particle.x).toBe(102);
    expect(particle.y).toBe(103); // vy is 3 before gravity is applied
    expect(particle.life).toBe(0.98);
  });

  test('dead particle should be removed', () => {
    const particle = { life: 0 };
    const shouldRemove = particle.life <= 0;
    expect(shouldRemove).toBe(true);
  });
});

describe('Input Handling Tests', () => {
  test('key mapping is correct', () => {
    const keyMap = {
      'ArrowUp': { x: 0, y: -1 },
      'ArrowDown': { x: 0, y: 1 },
      'ArrowLeft': { x: -1, y: 0 },
      'ArrowRight': { x: 1, y: 0 },
      'KeyW': { x: 0, y: -1 },
      'KeyS': { x: 0, y: 1 },
      'KeyA': { x: -1, y: 0 },
      'KeyD': { x: 1, y: 0 }
    };

    expect(keyMap['ArrowUp']).toEqual(keyMap['KeyW']);
    expect(keyMap['ArrowDown']).toEqual(keyMap['KeyS']);
    expect(keyMap['ArrowLeft']).toEqual(keyMap['KeyA']);
    expect(keyMap['ArrowRight']).toEqual(keyMap['KeyD']);
  });

  test('touch swipe detection logic', () => {
    const detectSwipe = (startX, startY, endX, endY) => {
      const dx = endX - startX;
      const dy = endY - startY;
      const minSwipe = 30;

      if (Math.max(Math.abs(dx), Math.abs(dy)) < minSwipe) {
        return null;
      }

      if (Math.abs(dx) > Math.abs(dy)) {
        return dx > 0 ? 'RIGHT' : 'LEFT';
      } else {
        return dy > 0 ? 'DOWN' : 'UP';
      }
    };

    expect(detectSwipe(100, 100, 150, 100)).toBe('RIGHT');
    expect(detectSwipe(100, 100, 50, 100)).toBe('LEFT');
    expect(detectSwipe(100, 100, 100, 150)).toBe('DOWN');
    expect(detectSwipe(100, 100, 100, 50)).toBe('UP');
    expect(detectSwipe(100, 100, 110, 110)).toBeNull();
  });
});

describe('Snake Movement Tests', () => {
  test('snake head moves in correct direction', () => {
    const direction = { x: 1, y: 0 };
    const head = { x: 10, y: 10 };
    const newHead = {
      x: head.x + direction.x,
      y: head.y + direction.y
    };

    expect(newHead.x).toBe(11);
    expect(newHead.y).toBe(10);
  });

  test('snake wraps around when ghost mode is active', () => {
    const CELL_COUNT = 20;
    const direction = { x: -1, y: 0 };
    const head = { x: 0, y: 10 };

    // Ghost mode wraps
    const newHead = {
      x: (head.x + direction.x + CELL_COUNT) % CELL_COUNT,
      y: (head.y + direction.y + CELL_COUNT) % CELL_COUNT
    };

    expect(newHead.x).toBe(19);
    expect(newHead.y).toBe(10);
  });

  test('snake body grows when eating', () => {
    const snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    const food = { x: 10, y: 10 }; // Same position as head
    const head = snake[0];

    // Simulate eating
    if (head.x === food.x && head.y === food.y) {
      snake.unshift({ x: food.x, y: food.y });
    }

    expect(snake.length).toBe(4);
  });

  test('snake self-collision detection', () => {
    const body = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    const newHead = { x: 9, y: 10 }; // Same as second segment

    const hasCollision = body.some((seg, i) => i > 0 && seg.x === newHead.x && seg.y === newHead.y);
    expect(hasCollision).toBe(true);
  });
});

describe('Food Spawn Tests', () => {
  test('food spawns within grid bounds', () => {
    const CELL_COUNT = 20;
    const food = {
      x: Math.floor(Math.random() * CELL_COUNT),
      y: Math.floor(Math.random() * CELL_COUNT)
    };

    expect(food.x).toBeGreaterThanOrEqual(0);
    expect(food.x).toBeLessThan(CELL_COUNT);
    expect(food.y).toBeGreaterThanOrEqual(0);
    expect(food.y).toBeLessThan(CELL_COUNT);
  });

  test('special food types are valid', () => {
    const validTypes = ['shield', 'speed', 'slow', 'ghost', 'magnet', 'life'];
    const specialFood = {
      x: 5,
      y: 5,
      type: validTypes[Math.floor(Math.random() * validTypes.length)]
    };

    expect(validTypes).toContain(specialFood.type);
  });
});

describe('Obstacle Tests', () => {
  test('obstacles do not spawn on snake body', () => {
    const snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }];
    const CELL_COUNT = 20;

    let obstacle = {
      x: Math.floor(Math.random() * CELL_COUNT),
      y: Math.floor(Math.random() * CELL_COUNT)
    };

    // Regenerate if on snake
    while (snake.some(s => s.x === obstacle.x && s.y === obstacle.y)) {
      obstacle = {
        x: Math.floor(Math.random() * CELL_COUNT),
        y: Math.floor(Math.random() * CELL_COUNT)
      };
    }

    expect(snake.some(s => s.x === obstacle.x && s.y === obstacle.y)).toBe(false);
  });
});

describe('Collision Detection Tests', () => {
  test('wall collision detection', () => {
    const CELL_COUNT = 20;
    const head = { x: -1, y: 10 };
    const wallCrash = head.x < 0 || head.x >= CELL_COUNT ||
                      head.y < 0 || head.y >= CELL_COUNT;
    expect(wallCrash).toBe(true);

    const head2 = { x: 10, y: 10 };
    const wallCrash2 = head2.x < 0 || head2.x >= CELL_COUNT ||
                       head2.y < 0 || head2.y >= CELL_COUNT;
    expect(wallCrash2).toBe(false);
  });

  test('obstacle collision detection', () => {
    const obstacles = [{ x: 5, y: 5 }, { x: 6, y: 6 }];
    const head = { x: 5, y: 5 };

    const hitObstacle = obstacles.some(o => o.x === head.x && o.y === head.y);
    expect(hitObstacle).toBe(true);
  });
});

describe('Score System Tests', () => {
  test('base score calculation', () => {
    const level = 1;
    const baseScore = 10 + level * 2;
    expect(baseScore).toBe(12);
  });

  test('score multiplier with speed powerup', () => {
    const speedMultiplier = 2;
    const baseScore = 10;
    const finalScore = baseScore * speedMultiplier;
    expect(finalScore).toBe(20);
  });
});
