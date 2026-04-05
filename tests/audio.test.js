/**
 * @jest-environment jsdom
 */

global.AudioContext = jest.fn(() => ({
  createOscillator: jest.fn(() => ({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    frequency: {
      setValueAtTime: jest.fn(),
      exponentialRampToValueAtTime: jest.fn()
    },
    type: 'square'
  })),
  createGain: jest.fn(() => ({
    connect: jest.fn(),
    gain: {
      setValueAtTime: jest.fn(),
      exponentialRampToValueAtTime: jest.fn()
    }
  })),
  destination: {},
  currentTime: 0
}));

require('../js/audio');

describe('AudioManager Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('init', () => {
    test('should create AudioContext', () => {
      AudioManager.init();
      expect(AudioContext).toHaveBeenCalled();
    });

    test('should not recreate AudioContext if already initialized', () => {
      AudioManager.init();
      AudioManager.init();
      expect(AudioContext).toHaveBeenCalledTimes(1);
    });
  });

  describe('play', () => {
    beforeEach(() => {
      AudioManager.init();
    });

    test('should not play if AudioContext not initialized', () => {
      AudioManager.ctx = null;
      AudioManager.play('eat');
      // Should not throw
    });

    test('should play eat sound', () => {
      expect(() => AudioManager.play('eat')).not.toThrow();
    });

    test('should play eat-special sound', () => {
      expect(() => AudioManager.play('eat-special')).not.toThrow();
    });

    test('should play powerup sound', () => {
      expect(() => AudioManager.play('powerup')).not.toThrow();
    });

    test('should play powerdown sound', () => {
      expect(() => AudioManager.play('powerdown')).not.toThrow();
    });

    test('should play die sound', () => {
      expect(() => AudioManager.play('die')).not.toThrow();
    });

    test('should play levelup sound', () => {
      expect(() => AudioManager.play('levelup')).not.toThrow();
    });

    test('should play hurt sound', () => {
      expect(() => AudioManager.play('hurt')).not.toThrow();
    });

    test('should not throw for unknown sound type', () => {
      expect(() => AudioManager.play('unknown')).not.toThrow();
    });
  });
});
