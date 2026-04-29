"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Tests for tdd-workflow.ts
const tdd_workflow_1 = require("../tdd-workflow");
describe('TDD Workflow Module', () => {
    describe('registerTestTask()', () => {
        it('должен регистрировать TEST задачу', () => {
            (0, tdd_workflow_1.registerTestTask)('TEST:T-001', 'T-001');
            const testId = (0, tdd_workflow_1.getTestTaskId)('T-001');
            expect(testId).toBe('TEST:T-001');
        });
        it('должен устанавливать статус waiting для code', () => {
            (0, tdd_workflow_1.registerTestTask)('TEST:T-002', 'T-002');
            const result = (0, tdd_workflow_1.canStartCode)('T-002');
            expect(result.canStartCode).toBe(false);
        });
    });
    describe('updateTestStatus()', () => {
        it('должен обновлять статус на passed', () => {
            (0, tdd_workflow_1.registerTestTask)('TEST:T-003', 'T-003');
            (0, tdd_workflow_1.updateTestStatus)('T-003', true);
            const result = (0, tdd_workflow_1.canStartCode)('T-003');
            expect(result.testPassed).toBe(true);
        });
        it('должен обновлять статус на failed', () => {
            (0, tdd_workflow_1.registerTestTask)('TEST:T-004', 'T-004');
            (0, tdd_workflow_1.updateTestStatus)('T-004', false);
            const result = (0, tdd_workflow_1.canStartCode)('T-004');
            expect(result.testPassed).toBe(false);
        });
        it('должен блокировать код при failed тесте', () => {
            (0, tdd_workflow_1.registerTestTask)('TEST:T-005', 'T-005');
            (0, tdd_workflow_1.updateTestStatus)('T-005', false);
            const result = (0, tdd_workflow_1.canStartCode)('T-005');
            expect(result.canStartCode).toBe(false);
        });
    });
    describe('canStartCode()', () => {
        it('должен возвращать hasTestTask: false для незарегистрированной задачи', () => {
            const result = (0, tdd_workflow_1.canStartCode)('nonexistent-task');
            expect(result.hasTestTask).toBe(false);
        });
        it('должен возвращать canStartCode: false когда нет TEST задачи', () => {
            const result = (0, tdd_workflow_1.canStartCode)('nonexistent-task');
            expect(result.canStartCode).toBe(false);
        });
        it('должен возвращать canStartCode: false когда тест не пройден', () => {
            (0, tdd_workflow_1.registerTestTask)('TEST:T-006', 'T-006');
            const result = (0, tdd_workflow_1.canStartCode)('T-006');
            expect(result.canStartCode).toBe(false);
        });
        it('должен возвращать canStartCode: true когда тест пройден', () => {
            (0, tdd_workflow_1.registerTestTask)('TEST:T-007', 'T-007');
            (0, tdd_workflow_1.updateTestStatus)('T-007', true);
            const result = (0, tdd_workflow_1.canStartCode)('T-007');
            expect(result.canStartCode).toBe(true);
        });
    });
    describe('tryStartCodeTask()', () => {
        it('должен возвращать allowed: false для незарегистрированной задачи', () => {
            const result = (0, tdd_workflow_1.tryStartCodeTask)('nonexistent-task');
            expect(result.allowed).toBe(false);
            expect(result.reason).toContain('не найдена');
        });
        it('должен возвращать allowed: false когда тест не пройден', () => {
            (0, tdd_workflow_1.registerTestTask)('TEST:T-008', 'T-008');
            const result = (0, tdd_workflow_1.tryStartCodeTask)('T-008');
            expect(result.allowed).toBe(false);
        });
        it('должен возвращать allowed: true когда тест пройден', () => {
            (0, tdd_workflow_1.registerTestTask)('TEST:T-009', 'T-009');
            (0, tdd_workflow_1.updateTestStatus)('T-009', true);
            const result = (0, tdd_workflow_1.tryStartCodeTask)('T-009');
            expect(result.allowed).toBe(true);
        });
        it('должен обновлять codeStatus на pending', () => {
            (0, tdd_workflow_1.registerTestTask)('TEST:T-010', 'T-010');
            (0, tdd_workflow_1.updateTestStatus)('T-010', true);
            (0, tdd_workflow_1.tryStartCodeTask)('T-010');
            const dep = (0, tdd_workflow_1.canStartCode)('T-010');
            expect(dep.canStartCode).toBe(false); // уже not waiting
        });
    });
    describe('getTestTaskId()', () => {
        it('должен возвращать testTaskId для существующей задачи', () => {
            (0, tdd_workflow_1.registerTestTask)('TEST:T-011', 'T-011');
            const result = (0, tdd_workflow_1.getTestTaskId)('T-011');
            expect(result).toBe('TEST:T-011');
        });
        it('должен возвращать null для незарегистрированной задачи', () => {
            const result = (0, tdd_workflow_1.getTestTaskId)('nonexistent-task');
            expect(result).toBeNull();
        });
    });
    describe('getPendingTasks()', () => {
        it('должен возвращать массив', () => {
            const result = (0, tdd_workflow_1.getPendingTasks)();
            expect(Array.isArray(result)).toBe(true);
        });
        it('должен включать задачи в статусе waiting', () => {
            (0, tdd_workflow_1.registerTestTask)('TEST:T-012', 'T-012');
            const before = (0, tdd_workflow_1.getPendingTasks)().length;
            expect(before).toBeGreaterThan(0);
        });
    });
    describe('tddWorkflow default export', () => {
        it('должен экспортировать registerTestTask', () => {
            expect(tdd_workflow_1.tddWorkflow.registerTestTask).toBeDefined();
        });
        it('должен экспортировать updateTestStatus', () => {
            expect(tdd_workflow_1.tddWorkflow.updateTestStatus).toBeDefined();
        });
        it('должен экспортировать canStartCode', () => {
            expect(tdd_workflow_1.tddWorkflow.canStartCode).toBeDefined();
        });
        it('должен экспортировать tryStartCodeTask', () => {
            expect(tdd_workflow_1.tddWorkflow.tryStartCodeTask).toBeDefined();
        });
        it('должен экспортировать getTestTaskId', () => {
            expect(tdd_workflow_1.tddWorkflow.getTestTaskId).toBeDefined();
        });
        it('должен экспортировать getPendingTasks', () => {
            expect(tdd_workflow_1.tddWorkflow.getPendingTasks).toBeDefined();
        });
        it('должен использовать правильные функции', () => {
            tdd_workflow_1.tddWorkflow.registerTestTask('TEST:T-013', 'T-013');
            const testId = tdd_workflow_1.tddWorkflow.getTestTaskId('T-013');
            expect(testId).toBe('TEST:T-013');
        });
    });
    describe('TDD workflow logic', () => {
        it('TEST → CODE разделение должно работать', () => {
            (0, tdd_workflow_1.registerTestTask)('TEST:T-014', 'T-014');
            const pending = (0, tdd_workflow_1.tryStartCodeTask)('T-014');
            expect(pending.allowed).toBe(false);
            (0, tdd_workflow_1.updateTestStatus)('T-014', true);
            const allowed = (0, tdd_workflow_1.tryStartCodeTask)('T-014');
            expect(allowed.allowed).toBe(true);
        });
        it('failed тест должен блокировать код', () => {
            (0, tdd_workflow_1.registerTestTask)('TEST:T-015', 'T-015');
            (0, tdd_workflow_1.updateTestStatus)('T-015', false);
            const result = (0, tdd_workflow_1.tryStartCodeTask)('T-015');
            expect(result.allowed).toBe(false);
            expect(result.reason).toContain('Сначала пройди TEST');
        });
    });
});
