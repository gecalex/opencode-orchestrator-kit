// Tests for tdd-workflow.ts
import {
  registerTestTask,
  updateTestStatus,
  canStartCode,
  tryStartCodeTask,
  getTestTaskId,
  getPendingTasks,
  tddWorkflow
} from '../tdd-workflow';

describe('TDD Workflow Module', () => {
  describe('registerTestTask()', () => {
    it('должен регистрировать TEST задачу', () => {
      registerTestTask('TEST:T-001', 'T-001');
      
      const testId = getTestTaskId('T-001');
      expect(testId).toBe('TEST:T-001');
    });

    it('должен устанавливать статус waiting для code', () => {
      registerTestTask('TEST:T-002', 'T-002');
      
      const result = canStartCode('T-002');
      expect(result.canStartCode).toBe(false);
    });
  });

  describe('updateTestStatus()', () => {
    it('должен обновлять статус на passed', () => {
      registerTestTask('TEST:T-003', 'T-003');
      updateTestStatus('T-003', true);
      
      const result = canStartCode('T-003');
      expect(result.testPassed).toBe(true);
    });

    it('должен обновлять статус на failed', () => {
      registerTestTask('TEST:T-004', 'T-004');
      updateTestStatus('T-004', false);
      
      const result = canStartCode('T-004');
      expect(result.testPassed).toBe(false);
    });

    it('должен блокировать код при failed тесте', () => {
      registerTestTask('TEST:T-005', 'T-005');
      updateTestStatus('T-005', false);
      
      const result = canStartCode('T-005');
      expect(result.canStartCode).toBe(false);
    });
  });

  describe('canStartCode()', () => {
    it('должен возвращать hasTestTask: false для незарегистрированной задачи', () => {
      const result = canStartCode('nonexistent-task');
      
      expect(result.hasTestTask).toBe(false);
    });

    it('должен возвращать canStartCode: false когда нет TEST задачи', () => {
      const result = canStartCode('nonexistent-task');
      
      expect(result.canStartCode).toBe(false);
    });

    it('должен возвращать canStartCode: false когда тест не пройден', () => {
      registerTestTask('TEST:T-006', 'T-006');
      
      const result = canStartCode('T-006');
      expect(result.canStartCode).toBe(false);
    });

    it('должен возвращать canStartCode: true когда тест пройден', () => {
      registerTestTask('TEST:T-007', 'T-007');
      updateTestStatus('T-007', true);
      
      const result = canStartCode('T-007');
      expect(result.canStartCode).toBe(true);
    });
  });

  describe('tryStartCodeTask()', () => {
    it('должен возвращать allowed: false для незарегистрированной задачи', () => {
      const result = tryStartCodeTask('nonexistent-task');
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('не найдена');
    });

    it('должен возвращать allowed: false когда тест не пройден', () => {
      registerTestTask('TEST:T-008', 'T-008');
      
      const result = tryStartCodeTask('T-008');
      expect(result.allowed).toBe(false);
    });

    it('должен возвращать allowed: true когда тест пройден', () => {
      registerTestTask('TEST:T-009', 'T-009');
      updateTestStatus('T-009', true);
      
      const result = tryStartCodeTask('T-009');
      expect(result.allowed).toBe(true);
    });

    it('должен обновлять codeStatus на pending', () => {
      registerTestTask('TEST:T-010', 'T-010');
      updateTestStatus('T-010', true);
      tryStartCodeTask('T-010');
      
      const dep = canStartCode('T-010');
      expect(dep.canStartCode).toBe(false); // уже not waiting
    });
  });

  describe('getTestTaskId()', () => {
    it('должен возвращать testTaskId для существующей задачи', () => {
      registerTestTask('TEST:T-011', 'T-011');
      
      const result = getTestTaskId('T-011');
      expect(result).toBe('TEST:T-011');
    });

    it('должен возвращать null для незарегистрированной задачи', () => {
      const result = getTestTaskId('nonexistent-task');
      
      expect(result).toBeNull();
    });
  });

  describe('getPendingTasks()', () => {
    it('должен возвращать массив', () => {
      const result = getPendingTasks();
      
      expect(Array.isArray(result)).toBe(true);
    });

    it('должен включать задачи в статусе waiting', () => {
      registerTestTask('TEST:T-012', 'T-012');
      const before = getPendingTasks().length;
      
      expect(before).toBeGreaterThan(0);
    });
  });

  describe('tddWorkflow default export', () => {
    it('должен экспортировать registerTestTask', () => {
      expect(tddWorkflow.registerTestTask).toBeDefined();
    });

    it('должен экспортировать updateTestStatus', () => {
      expect(tddWorkflow.updateTestStatus).toBeDefined();
    });

    it('должен экспортировать canStartCode', () => {
      expect(tddWorkflow.canStartCode).toBeDefined();
    });

    it('должен экспортировать tryStartCodeTask', () => {
      expect(tddWorkflow.tryStartCodeTask).toBeDefined();
    });

    it('должен экспортировать getTestTaskId', () => {
      expect(tddWorkflow.getTestTaskId).toBeDefined();
    });

    it('должен экспортировать getPendingTasks', () => {
      expect(tddWorkflow.getPendingTasks).toBeDefined();
    });

    it('должен использовать правильные функции', () => {
      tddWorkflow.registerTestTask('TEST:T-013', 'T-013');
      const testId = tddWorkflow.getTestTaskId('T-013');
      expect(testId).toBe('TEST:T-013');
    });
  });

  describe('TDD workflow logic', () => {
    it('TEST → CODE разделение должно работать', () => {
      registerTestTask('TEST:T-014', 'T-014');
      
      const pending = tryStartCodeTask('T-014');
      expect(pending.allowed).toBe(false);
      
      updateTestStatus('T-014', true);
      
      const allowed = tryStartCodeTask('T-014');
      expect(allowed.allowed).toBe(true);
    });

    it('failed тест должен блокировать код', () => {
      registerTestTask('TEST:T-015', 'T-015');
      updateTestStatus('T-015', false);
      
      const result = tryStartCodeTask('T-015');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Сначала пройди TEST');
    });
  });
});