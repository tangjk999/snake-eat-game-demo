/**
 * @jest-environment jsdom
 */

// Mock dependencies
global.GameCore = {
  CELL_COUNT: 20,
  level: 1,
  powerUps: {
    shield: { active: false },
    speed: { active: false },
    slow: { active: false },
    ghost: { active: false },
    magnet: { active: false }
  },
  sessionStats: { foodEaten: 0 },
  loseLife: jest.fn(),
  addScore: jest.fn(),
  levelUp: jest.fn(),
  activatePowerUp: jest.fn()
};

global.AudioManager = {
  play: jest.fn()
};

global.ParticleSystem = {
  emit: jest.fn()
};

require('../js/snake');

describe('SnakeLogic Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    SnakeLogic.body = [];
    SnakeLogic.direction = null;
    SnakeLogic.nextDirection = null;
    SnakeLogic.food = null;
    SnakeLogic.specialFood = null;
    SnakeLogic.obstacles = [];
    GameCore.powerUps.shield.active = false;
    GameCore.powerUps.speed.active = false;
    GameCore.powerUps.ghost.active = false;
    GameCore.powerUps.magnet.active = false;
  });

  describe('Direction', () => {
    test('should have correct direction values', () => {
      expect(SnakeLogic.Direction.UP).toEqual({ x: 0, y: -1 });
      expect(SnakeLogic.Direction.DOWN).toEqual({ x: 0, y: 1 });
      expect(SnakeLogic.Direction.LEFT).toEqual({ x: -1, y: 0 });
      expect(SnakeLogic.Direction.RIGHT).toEqual({ x: 1, y: 0 });
    });
  });

  describe('init', () => {
    test('should initialize snake with 3 segments', () => {
      SnakeLogic.init();
      expect(SnakeLogic.body.length).toBe(3);
    });

    test('should initialize snake in center of grid', () => {
      SnakeLogic.init();
      expect(SnakeLogic.body[0].x).toBe(10);
      expect(SnakeLogic.body[0].y).toBe(10);
    });

    test('should initialize direction to RIGHT', () => {
      SnakeLogic.init();
      expect(SnakeLogic.direction).toEqual(SnakeLogic.Direction.RIGHT);
    });

    test('should spawn food', () => {
      SnakeLogic.init();
      expect(SnakeLogic.food).not.toBeNull();
    });
  });

  describe('setDirection', () => {
    test('should set next direction', () => {
      SnakeLogic.direction = SnakeLogic.Direction.UP;
      SnakeLogic.setDirection(SnakeLogic.Direction.DOWN);
      expect(SnakeLogic.nextDirection).toBe(SnakeLogic.Direction.DOWN);
    });

    test('should not allow opposite direction', () => {
      SnakeLogic.direction = SnakeLogic.Direction.UP;
      SnakeLogic.setDirection(SnakeLogic.Direction.DOWN);
      expect(SnakeLogic.nextDirection).toBe(SnakeLogic.Direction.UP);
    });
  });

  describe('spawnFood', () => {
    test('should spawn food at valid position', () => {
      SnakeLogic.body = [{ x: 0, y: 0 }];
      SnakeLogic.obstacles = [];
      SnakeLogic.spawnFood();
      expect(SnakeLogic.food).not.toBeNull();
      expect(SnakeLogic.food.x).toBeGreaterThanOrEqual(0);
      expect(SnakeLogic.food.x).toBeLessThan(20);
    });

    test('should not spawn food on snake body', () => {
      SnakeLogic.body = [{ x: 5, y: 5 }];
      SnakeLogic.obstacles = [];
      SnakeLogic.spawnFood();
      expect(SnakeLogic.food.x).not.toBe(5);
    });
  });

  describe('move', () => {
    test('should move snake forward', () => {
      SnakeLogic.init();
      SnakeLogic.direction = SnakeLogic.Direction.RIGHT;
      SnakeLogic.nextDirection = SnakeLogic.Direction.RIGHT;
      const initialHead = { ...SnakeLogic.body[0] };
      SnakeLogic.move();
      expect(SnakeLogic.body[0].x).toBe(initialHead.x + 1);
    });

    test('should grow snake when eating food', () => {
      SnakeLogic.init();
      SnakeLogic.food = { x: SnakeLogic.body[0].x + 1, y: SnakeLogic.body[0].y };
      const initialLength = SnakeLogic.body.length;
      SnakeLogic.move();
      expect(SnakeLogic.body.length).toBeGreaterThan(initialLength);
    });

    test('should call loseLife on wall collision without ghost powerup', () => {
      SnakeLogic.init();
      SnakeLogic.body = [{ x: 0, y: 0 }];
      SnakeLogic.direction = SnakeLogic.Direction.LEFT;
      SnakeLogic.nextDirection = SnakeLogic.Direction.LEFT;
      SnakeLogic.move();
      expect(GameCore.loseLife).toHaveBeenCalled();
    });

    test('should wrap around when ghost powerup is active', () => {
      SnakeLogic.init();
      SnakeLogic.powerUps.ghost.active = true;
      SnakeLogic.body = [{ x: 0, y: 0 }];
      SnakeLogic.direction = SnakeLogic.Direction.LEFT;
      SnakeLogic.nextDirection = SnakeLogic.Direction.LEFT;
      SnakeLogic.move();
      expect(GameCore.loseLife).not.toHaveBeenCalled();
    });
  });

  describe('spawnSpecialFood', () => {
    test('should spawn special food with valid type', () => {
      const types = ['shield', 'speed', 'slow', 'ghost', 'magnet', 'life'];
      SnakeLogic.spawnSpecialFood();
      expect(SnakeLogic.specialFood).not.toBeNull();
      expect(types).toContain(SnakeLogic.specialFood.type);
    });
  });

  describe('spawnObstacles', () => {
    test('should not spawn obstacles below level 3', () => {
      GameCore.level = 2;
      SnakeLogic.obstacles = [];
      SnakeLogic.spawnObstacles();
      expect(SnakeLogic.obstacles.length).toBe(0);
    });

    test('should spawn obstacles at level 3 or higher', () => {
      GameCore.level = 3;
      SnakeLogic.obstacles = [];
      SnakeLogic.body = [{ x: 10, y: 10 }];
      SnakeLogic.food = { x: 5, y: 5 };
      SnakeLogic.spawnObstacles();
      expect(SnakeLogic.obstacles.length).toBeGreaterThan(0);
    });
  });
});
