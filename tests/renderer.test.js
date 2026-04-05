/**
 * @jest-environment jsdom
 */

// Mock GameCore and SnakeLogic
global.GameCore = {
  CELL_COUNT: 20,
  GRID_SIZE: 18,
  powerUps: {
    shield: { active: false },
    speed: { active: false },
    slow: { active: false },
    ghost: { active: false },
    magnet: { active: false }
  }
};

global.SnakeLogic = {
  body: [{ x: 10, y: 10 }],
  direction: { x: 1, y: 0 },
  food: { x: 5, y: 5 },
  specialFood: null,
  obstacles: []
};

// Create mock canvas
document.body.innerHTML = `
  <canvas id="canvas"></canvas>
`;

require('../js/renderer');

describe('Renderer Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Renderer.foodPulse = 0;
    Renderer.specialPulse = 0;
  });

  describe('init', () => {
    test('should get canvas element', () => {
      Renderer.init();
      expect(Renderer.canvas).not.toBeNull();
    });

    test('should get 2d context', () => {
      Renderer.init();
      expect(Renderer.ctx).not.toBeNull();
    });

    test('should set canvas dimensions based on CELL_COUNT and GRID_SIZE', () => {
      Renderer.init();
      expect(Renderer.canvas.width).toBe(360); // 20 * 18
      expect(Renderer.canvas.height).toBe(360);
    });
  });

  describe('clear', () => {
    test('should fill canvas with background color', () => {
      Renderer.init();
      const fillRectSpy = jest.spyOn(Renderer.ctx, 'fillRect');
      Renderer.clear();
      expect(fillRectSpy).toHaveBeenCalledWith(0, 0, 360, 360);
    });
  });

  describe('drawGrid', () => {
    test('should draw grid cells', () => {
      Renderer.init();
      const fillRectSpy = jest.spyOn(Renderer.ctx, 'fillRect');
      Renderer.drawGrid();
      // Grid should draw alternating colored cells
      expect(fillRectSpy).toHaveBeenCalled();
    });
  });

  describe('drawSnake', () => {
    test('should draw snake body segments', () => {
      Renderer.init();
      SnakeLogic.body = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
      ];
      const fillRectSpy = jest.spyOn(Renderer.ctx, 'fillRect');
      Renderer.drawSnake();
      expect(fillRectSpy).toHaveBeenCalled();
    });

    test('should draw ghost effect when ghost powerup is active', () => {
      Renderer.init();
      GameCore.powerUps.ghost.active = true;
      SnakeLogic.body = [{ x: 10, y: 10 }];
      const globalAlphaSpy = jest.spyOn(Renderer.ctx, 'globalAlpha', 'get');
      Renderer.drawSnake();
      expect(globalAlphaSpy).toHaveBeenCalled();
    });
  });

  describe('drawFood', () => {
    test('should draw food when food exists', () => {
      Renderer.init();
      SnakeLogic.food = { x: 5, y: 5 };
      const fillSpy = jest.spyOn(Renderer.ctx, 'fill');
      Renderer.drawFood();
      expect(fillSpy).toHaveBeenCalled();
    });

    test('should not draw when no food', () => {
      Renderer.init();
      SnakeLogic.food = null;
      const fillSpy = jest.spyOn(Renderer.ctx, 'fill');
      Renderer.drawFood();
      expect(fillSpy).not.toHaveBeenCalled();
    });
  });

  describe('drawSpecialFood', () => {
    test('should draw special food when it exists', () => {
      Renderer.init();
      SnakeLogic.specialFood = { x: 5, y: 5, type: 'shield' };
      const fillSpy = jest.spyOn(Renderer.ctx, 'fill');
      Renderer.drawSpecialFood();
      expect(fillSpy).toHaveBeenCalled();
    });
  });

  describe('updateAnimations', () => {
    test('should increment foodPulse', () => {
      const initialPulse = Renderer.foodPulse;
      Renderer.updateAnimations(16);
      expect(Renderer.foodPulse).toBeGreaterThan(initialPulse);
    });

    test('should increment specialPulse', () => {
      const initialPulse = Renderer.specialPulse;
      Renderer.updateAnimations(16);
      expect(Renderer.specialPulse).toBeGreaterThan(initialPulse);
    });
  });

  describe('render', () => {
    test('should call clear, drawGrid, drawFood, drawSnake', () => {
      Renderer.init();
      const clearSpy = jest.spyOn(Renderer, 'clear');
      const drawGridSpy = jest.spyOn(Renderer, 'drawGrid');
      const drawFoodSpy = jest.spyOn(Renderer, 'drawFood');
      const drawSnakeSpy = jest.spyOn(Renderer, 'drawSnake');

      Renderer.render(16);

      expect(clearSpy).toHaveBeenCalled();
      expect(drawGridSpy).toHaveBeenCalled();
      expect(drawFoodSpy).toHaveBeenCalled();
      expect(drawSnakeSpy).toHaveBeenCalled();
    });
  });
});
