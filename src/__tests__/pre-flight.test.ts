// Tests for pre-flight.ts
import { preFlight } from '../pre-flight';
import type { PreFlightResult } from '../types';

describe('Pre-Flight Module', () => {
  describe('preFlight export', () => {
    it('должен экспортировать run функцию', () => {
      expect(preFlight.run).toBeDefined();
      expect(typeof preFlight.run).toBe('function');
    });
  });

  describe('run() function exists', () => {
    it('run должна быть async функцией', async () => {
      expect(preFlight.run.constructor.name).toBe('AsyncFunction');
    });
  });

  describe('PreFlightResult type structure', () => {
    it('PreFlightResult должен иметь правильную структуру', () => {
      const result: PreFlightResult = {
        success: true,
        passed: 10,
        failed: 0,
        errors: []
      };
      
      expect(result.success).toBe(true);
      expect(result.passed).toBe(10);
      expect(result.failed).toBe(0);
      expect(result.errors).toEqual([]);
    });

    it('PreFlightResult с ошибками должен иметь failed > 0', () => {
      const result: PreFlightResult = {
        success: false,
        passed: 8,
        failed: 2,
        errors: ['Error 1', 'Error 2']
      };
      
      expect(result.success).toBe(false);
      expect(result.passed).toBe(8);
      expect(result.failed).toBe(2);
      expect(result.errors).toHaveLength(2);
    });
  });
});