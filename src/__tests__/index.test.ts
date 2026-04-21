// Tests for index.ts (OrchestratorKit plugin entry point)
import * as index from '../index';

describe('OrchestratorKit Plugin Entry Point', () => {
  describe('Module exports', () => {
    it('OrchestratorKit экспортирован', () => {
      expect(index.OrchestratorKit).toBeDefined();
    });

    it('default экспортирован', () => {
      expect(index.default).toBeDefined();
    });

    it('default === OrchestratorKit', () => {
      expect(index.default).toBe(index.OrchestratorKit);
    });
  });

  describe('OrchestratorKit function type', () => {
    it('является функцией', () => {
      expect(typeof index.OrchestratorKit).toBe('function');
    });

    it('имеет длину 1', () => {
      expect(index.OrchestratorKit.length).toBeGreaterThanOrEqual(1);
    });

    it('имя определено', () => {
      expect(index.OrchestratorKit.name).toBeDefined();
      expect(index.OrchestratorKit.name.length).toBeGreaterThan(0);
    });
  });
});