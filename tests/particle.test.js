/**
 * @jest-environment jsdom
 */

// Create mock canvas
document.body.innerHTML = `
  <canvas id="particle-canvas"></canvas>
`;

require('../js/particle');

describe('ParticleSystem Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ParticleSystem.particles = [];
  });

  describe('init', () => {
    test('should get canvas element', () => {
      ParticleSystem.init();
      expect(ParticleSystem.canvas).not.toBeNull();
    });

    test('should get 2d context', () => {
      ParticleSystem.init();
      expect(ParticleSystem.ctx).not.toBeNull();
    });

    test('should set canvas dimensions', () => {
      ParticleSystem.init();
      expect(ParticleSystem.canvas.width).toBe(window.innerWidth);
      expect(ParticleSystem.canvas.height).toBe(window.innerHeight);
    });
  });

  describe('emit', () => {
    beforeEach(() => {
      ParticleSystem.init();
    });

    test('should create particles', () => {
      ParticleSystem.emit(100, 100, '#ff0000', 10);
      expect(ParticleSystem.particles.length).toBe(10);
    });

    test('should create particle with correct properties', () => {
      ParticleSystem.emit(100, 100, '#ff0000', 1);
      const particle = ParticleSystem.particles[0];
      expect(particle.x).toBe(100);
      expect(particle.y).toBe(100);
      expect(particle.color).toBe('#ff0000');
      expect(particle.life).toBe(1);
    });

    test('should use default count of 10', () => {
      ParticleSystem.emit(100, 100, '#ff0000');
      expect(ParticleSystem.particles.length).toBe(10);
    });
  });

  describe('update', () => {
    beforeEach(() => {
      ParticleSystem.init();
    });

    test('should remove dead particles', () => {
      ParticleSystem.particles = [
        { x: 0, y: 0, vx: 0, vy: 0, life: 0, decay: 0.1, color: '#fff', size: 2 }
      ];
      ParticleSystem.update();
      expect(ParticleSystem.particles.length).toBe(0);
    });

    test('should update particle position', () => {
      ParticleSystem.particles = [
        { x: 0, y: 0, vx: 1, vy: 1, life: 1, decay: 0.1, color: '#fff', size: 2 }
      ];
      ParticleSystem.update();
      expect(ParticleSystem.particles[0].x).toBe(1);
      expect(ParticleSystem.particles[0].y).toBe(1);
    });

    test('should decrease particle life', () => {
      ParticleSystem.particles = [
        { x: 0, y: 0, vx: 0, vy: 0, life: 1, decay: 0.1, color: '#fff', size: 2 }
      ];
      ParticleSystem.update();
      expect(ParticleSystem.particles[0].life).toBeLessThan(1);
    });
  });

  describe('resize', () => {
    test('should update canvas dimensions on resize', () => {
      ParticleSystem.init();
      Object.defineProperty(window, 'innerWidth', { value: 800, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 600, writable: true });
      ParticleSystem.resize();
      expect(ParticleSystem.canvas.width).toBe(800);
      expect(ParticleSystem.canvas.height).toBe(600);
    });
  });
});
