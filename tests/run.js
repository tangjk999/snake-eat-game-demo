/**
 * Simple test runner for Snake Game Evolution
 * This provides basic unit testing without external dependencies
 */

class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  describe(name, fn) {
    console.log(`\n${name}`);
    fn();
  }

  test(name, fn) {
    try {
      fn();
      console.log(`  ✓ ${name}`);
      this.passed++;
    } catch (e) {
      console.log(`  ✗ ${name}`);
      console.log(`    Error: ${e.message}`);
      this.failed++;
    }
  }

  expect(actual) {
    return {
      toBe: (expected) => {
        if (actual !== expected) {
          throw new Error(`Expected ${expected} but got ${actual}`);
        }
      },
      toEqual: (expected) => {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
        }
      },
      toBeGreaterThan: (expected) => {
        if (actual <= expected) {
          throw new Error(`Expected ${actual} to be greater than ${expected}`);
        }
      },
      toBeLessThan: (expected) => {
        if (actual >= expected) {
          throw new Error(`Expected ${actual} to be less than ${expected}`);
        }
      },
      toBeGreaterThanOrEqual: (expected) => {
        if (actual < expected) {
          throw new Error(`Expected ${actual} to be >= ${expected}`);
        }
      },
      toContain: (item) => {
        if (!actual.includes(item)) {
          throw new Error(`Expected ${JSON.stringify(actual)} to contain ${item}`);
        }
      },
      toHaveLength: (len) => {
        if (actual.length !== len) {
          throw new Error(`Expected length ${len} but got ${actual.length}`);
        }
      },
      toBeTruthy: () => {
        if (!actual) {
          throw new Error(`Expected truthy but got ${actual}`);
        }
      },
      toBeFalsy: () => {
        if (actual) {
          throw new Error(`Expected falsy but got ${actual}`);
        }
      },
      toBeNull: () => {
        if (actual !== null) {
          throw new Error(`Expected null but got ${actual}`);
        }
      },
      not: {
        toBe: (expected) => {
          if (actual === expected) {
            throw new Error(`Expected not ${expected}`);
          }
        },
        toEqual: (expected) => {
          if (JSON.stringify(actual) === JSON.stringify(expected)) {
            throw new Error(`Expected not ${JSON.stringify(expected)}`);
          }
        },
        toContain: (item) => {
          if (actual.includes(item)) {
            throw new Error(`Expected not to contain ${item}`);
          }
        },
        toBeTruthy: () => {
          if (actual) {
            throw new Error(`Expected falsy`);
          }
        }
      }
    };
  }

  beforeEach(fn) {
    this._beforeEach = fn;
  }

  summary() {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Tests: ${this.passed} passed, ${this.failed} failed`);
    console.log(`${'='.repeat(50)}\n`);
    return this.failed === 0;
  }
}

// Mock localStorage
const localStorageStore = {};
global.localStorage = {
  getItem: (key) => localStorageStore[key] || null,
  setItem: (key, value) => { localStorageStore[key] = value; },
  removeItem: (key) => { delete localStorageStore[key]; },
  clear: () => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]); }
};

// Mock AudioContext
global.AudioContext = jest.fn ? jest.fn() : function() {
  this.createOscillator = () => ({
    connect: () => {},
    start: () => {},
    stop: () => {},
    frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
    type: 'square'
  });
  this.createGain = () => ({
    connect: () => {},
    gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }
  });
  this.destination = {};
  this.currentTime = 0;
};

// Mock ParticleSystem
global.ParticleSystem = {
  emit: () => {},
  update: () => {}
};

// Mock AudioManager
global.AudioManager = {
  init: () => {},
  play: () => {}
};

module.exports = { TestRunner };
