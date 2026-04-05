/**
 * @jest-environment jsdom
 */

// Mock localStorage before requiring the module
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

// Now require the storage module
const Storage = require('../js/storage').Storage;

describe('Storage Module', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('getHighScore', () => {
    test('should return 0 when no high score is stored', () => {
      expect(Storage.getHighScore()).toBe(0);
    });

    test('should return stored high score', () => {
      localStorage.getItem.mockReturnValue('100');
      expect(Storage.getHighScore()).toBe(100);
    });
  });

  describe('setHighScore', () => {
    test('should store high score as string', () => {
      Storage.setHighScore(200);
      expect(localStorage.setItem).toHaveBeenCalledWith('snake_evo_high_score', '200');
    });
  });

  describe('getAchievements', () => {
    test('should return empty array when no achievements stored', () => {
      expect(Storage.getAchievements()).toEqual([]);
    });

    test('should return parsed achievements array', () => {
      localStorage.getItem.mockReturnValue('["first_bite","glutton"]');
      expect(Storage.getAchievements()).toEqual(['first_bite', 'glutton']);
    });
  });

  describe('addAchievement', () => {
    test('should add new achievement', () => {
      localStorage.getItem.mockReturnValue('[]');
      const result = Storage.addAchievement('first_bite');
      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'snake_evo_achievements',
        JSON.stringify(['first_bite'])
      );
    });

    test('should not add duplicate achievement', () => {
      localStorage.getItem.mockReturnValue('["first_bite"]');
      const result = Storage.addAchievement('first_bite');
      expect(result).toBe(false);
    });
  });

  describe('getStats', () => {
    test('should return default stats when none stored', () => {
      const expected = { games: 0, totalScore: 0, foodEaten: 0, maxLevel: 1 };
      expect(Storage.getStats()).toEqual(expected);
    });

    test('should return stored stats', () => {
      const stats = { games: 5, totalScore: 1000, foodEaten: 50, maxLevel: 10 };
      localStorage.getItem.mockReturnValue(JSON.stringify(stats));
      expect(Storage.getStats()).toEqual(stats);
    });
  });

  describe('updateStats', () => {
    test('should store stats object', () => {
      const stats = { games: 10, totalScore: 5000, foodEaten: 100, maxLevel: 15 };
      Storage.updateStats(stats);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'snake_evo_stats',
        JSON.stringify(stats)
      );
    });
  });
});
