/**
 * @jest-environment jsdom
 */

// Mock dependencies
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value; }),
    removeItem: jest.fn((key) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; })
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

global.AudioContext = jest.fn(() => ({
  createOscillator: jest.fn(() => ({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    frequency: { setValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn() },
    type: ''
  })),
  createGain: jest.fn(() => ({
    connect: jest.fn(),
    gain: { setValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn() }
  })),
  destination: {},
  currentTime: 0
}));

// Mock ParticleSystem
global.ParticleSystem = {
  emit: jest.fn()
};

// Mock AudioManager
global.AudioManager = {
  init: jest.fn(),
  play: jest.fn()
};

// Load game-core module
require('../js/storage');
require('../js/game-core');

describe('GameCore Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset GameCore state
    GameCore.state = 'start';
    GameCore.score = 0;
    GameCore.level = 1;
    GameCore.lives = 3;
    GameCore.mode = 'classic';
    GameCore.moveInterval = 140;
    GameCore.baseMoveInterval = 140;
    GameCore.sessionStats = {
      foodEaten: 0,
      survivalTime: 0,
      maxLevel: 1,
      usedPower: false,
      speedUsed: false,
      won: false
    };
    Object.values(GameCore.powerUps).forEach(p => {
      p.active = false;
      p.timer = 0;
    });
  });

  describe('State', () => {
    test('should have correct state values', () => {
      expect(GameCore.State.START).toBe('start');
      expect(GameCore.State.PLAYING).toBe('playing');
      expect(GameCore.State.PAUSED).toBe('paused');
      expect(GameCore.State.GAME_OVER).toBe('game_over');
    });
  });

  describe('reset', () => {
    test('should reset score to 0', () => {
      GameCore.score = 100;
      GameCore.reset();
      expect(GameCore.score).toBe(0);
    });

    test('should reset level to 1', () => {
      GameCore.level = 5;
      GameCore.reset();
      expect(GameCore.level).toBe(1);
    });

    test('should reset lives based on mode', () => {
      GameCore.mode = 'classic';
      GameCore.lives = 1;
      GameCore.reset();
      expect(GameCore.lives).toBe(3);

      GameCore.mode = 'zen';
      GameCore.reset();
      expect(GameCore.lives).toBe(999);
    });

    test('should reset sessionStats', () => {
      GameCore.sessionStats.foodEaten = 50;
      GameCore.sessionStats.usedPower = true;
      GameCore.reset();
      expect(GameCore.sessionStats.foodEaten).toBe(0);
      expect(GameCore.sessionStats.usedPower).toBe(false);
    });
  });

  describe('addScore', () => {
    test('should add points to score', () => {
      GameCore.addScore(10);
      expect(GameCore.score).toBe(10);
    });

    test('should multiply score when speed powerup is active', () => {
      GameCore.powerUps.speed.active = true;
      GameCore.addScore(10);
      expect(GameCore.score).toBe(20);
    });
  });

  describe('levelUp', () => {
    test('should increment level', () => {
      GameCore.level = 1;
      GameCore.levelUp();
      expect(GameCore.level).toBe(2);
    });

    test('should update maxLevel in sessionStats', () => {
      GameCore.sessionStats.maxLevel = 1;
      GameCore.level = 3;
      GameCore.levelUp();
      expect(GameCore.sessionStats.maxLevel).toBe(3);
    });

    test('should decrease moveInterval', () => {
      GameCore.baseMoveInterval = 140;
      GameCore.level = 1;
      GameCore.levelUp();
      // moveInterval = 140 - (2-1) * 8 = 132
      expect(GameCore.moveInterval).toBe(132);
    });
  });

  describe('loseLife', () => {
    test('should decrement lives', () => {
      GameCore.lives = 3;
      GameCore.loseLife();
      expect(GameCore.lives).toBe(2);
    });

    test('should not decrement lives when shield is active', () => {
      GameCore.lives = 3;
      GameCore.powerUps.shield.active = true;
      GameCore.loseLife();
      expect(GameCore.lives).toBe(3);
      expect(GameCore.powerUps.shield.active).toBe(false);
    });
  });

  describe('activatePowerUp', () => {
    test('should activate powerup', () => {
      GameCore.activatePowerUp('speed');
      expect(GameCore.powerUps.speed.active).toBe(true);
    });

    test('should set usedPower to true', () => {
      GameCore.sessionStats.usedPower = false;
      GameCore.activatePowerUp('shield');
      expect(GameCore.sessionStats.usedPower).toBe(true);
    });

    test('should set speedUsed to true when activating speed', () => {
      GameCore.sessionStats.speedUsed = false;
      GameCore.activatePowerUp('speed');
      expect(GameCore.sessionStats.speedUsed).toBe(true);
    });
  });

  describe('checkAchievements', () => {
    test('should return new achievements', () => {
      localStorage.getItem.mockReturnValue('[]');
      GameCore.sessionStats.foodEaten = 1;
      const achievements = GameCore.checkAchievements('classic');
      expect(achievements.length).toBeGreaterThan(0);
    });

    test('should not return already unlocked achievements', () => {
      localStorage.getItem.mockReturnValue('["first_bite"]');
      GameCore.sessionStats.foodEaten = 1;
      const achievements = GameCore.checkAchievements('classic');
      expect(achievements.length).toBe(0);
    });
  });
});
