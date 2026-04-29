"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Tests for quality-gates.ts
const quality_gates_1 = require("../quality-gates");
describe('Quality Gates Module', () => {
    describe('Module exports', () => {
        it('должен экспортировать preExecution', () => {
            expect(quality_gates_1.preExecution).toBeDefined();
            expect(typeof quality_gates_1.preExecution).toBe('function');
        });
        it('должен экспортировать postExecution', () => {
            expect(quality_gates_1.postExecution).toBeDefined();
            expect(typeof quality_gates_1.postExecution).toBe('function');
        });
        it('должен экспортировать preCommit', () => {
            expect(quality_gates_1.preCommit).toBeDefined();
            expect(typeof quality_gates_1.preCommit).toBe('function');
        });
        it('должен экспортировать preMerge', () => {
            expect(quality_gates_1.preMerge).toBeDefined();
            expect(typeof quality_gates_1.preMerge).toBe('function');
        });
        it('должен экспортировать preImplementation', () => {
            expect(quality_gates_1.preImplementation).toBeDefined();
            expect(typeof quality_gates_1.preImplementation).toBe('function');
        });
        it('должен экспортировать mcpCheck', () => {
            expect(quality_gates_1.mcpCheck).toBeDefined();
            expect(typeof quality_gates_1.mcpCheck).toBe('function');
        });
        it('должен экспортировать qualityGates объект', () => {
            expect(quality_gates_1.qualityGates).toBeDefined();
            expect(typeof quality_gates_1.qualityGates).toBe('object');
        });
    });
    describe('preExecution()', () => {
        it('должен быть async функцией', () => {
            expect(quality_gates_1.preExecution.constructor.name).toBe('AsyncFunction');
        });
        it('пропускает task input с prompt', async () => {
            const result = await (0, quality_gates_1.preExecution)({ prompt: 'test task' });
            expect(result.passed).toBe(true);
            expect(result.gate).toBe(1);
            expect(result.checks).toHaveLength(1);
            expect(result.checks[0].name).toBe('Task input');
        });
        it('пропускает task input с subagent_type', async () => {
            const result = await (0, quality_gates_1.preExecution)({ subagent_type: 'python-developer' });
            expect(result.passed).toBe(true);
        });
        it('пропускает task input с description', async () => {
            const result = await (0, quality_gates_1.preExecution)({ description: 'test description' });
            expect(result.passed).toBe(true);
        });
        it('пропускает с prompt и subagent_type', async () => {
            const result = await (0, quality_gates_1.preExecution)({ prompt: 'test', subagent_type: 'python' });
            expect(result.passed).toBe(true);
            expect(result.checks).toHaveLength(1);
        });
        it('отклоняет пустой ввод', async () => {
            const result = await (0, quality_gates_1.preExecution)({});
            expect(result.passed).toBe(false);
            expect(result.checks).toHaveLength(2);
        });
        it('отклоняет null ввод', async () => {
            const result = await (0, quality_gates_1.preExecution)(null);
            expect(result.passed).toBe(false);
        });
        it('отклоняет undefined ввод', async () => {
            const result = await (0, quality_gates_1.preExecution)(undefined);
            expect(result.passed).toBe(false);
        });
        it('возвращает gate=1', async () => {
            const result = await (0, quality_gates_1.preExecution)({ prompt: 'test' });
            expect(result.gate).toBe(1);
        });
        it('checks содержит правильную структуру', async () => {
            const result = await (0, quality_gates_1.preExecution)({ prompt: 'test' });
            result.checks.forEach(check => {
                expect(check).toHaveProperty('name');
                expect(check).toHaveProperty('passed');
                expect(check).toHaveProperty('message');
            });
        });
    });
    describe('postExecution()', () => {
        it('должен быть async функцией', () => {
            expect(quality_gates_1.postExecution.constructor.name).toBe('AsyncFunction');
        });
        it('принимает успешный результат', async () => {
            const result = await (0, quality_gates_1.postExecution)({ status: 'success', result: { data: 'test' } });
            expect(result.passed).toBe(true);
            expect(result.gate).toBe(2);
        });
        it('отклоняет неуспешный статус', async () => {
            const result = await (0, quality_gates_1.postExecution)({ status: 'error', result: null });
            expect(result.passed).toBe(false);
        });
        it('отклоняет статус failed', async () => {
            const result = await (0, quality_gates_1.postExecution)({ status: 'failed', result: null });
            expect(result.passed).toBe(false);
        });
        it('требует результат', async () => {
            const result = await (0, quality_gates_1.postExecution)({ status: 'success', result: null });
            expect(result.passed).toBe(false);
        });
        it('принимает результат с data', async () => {
            const result = await (0, quality_gates_1.postExecution)({ status: 'success', result: { items: [] } });
            expect(result.passed).toBe(true);
        });
        it('проверяет структуру checks', async () => {
            const result = await (0, quality_gates_1.postExecution)({ status: 'success', result: {} });
            expect(result.checks).toBeDefined();
            expect(Array.isArray(result.checks)).toBe(true);
        });
        it('возвращает gate=2', async () => {
            const result = await (0, quality_gates_1.postExecution)({ status: 'success', result: {} });
            expect(result.gate).toBe(2);
        });
    });
    describe('preCommit()', () => {
        it('должен быть async функцией', () => {
            expect(quality_gates_1.preCommit.constructor.name).toBe('AsyncFunction');
        });
        it('функция существует', () => {
            expect(typeof quality_gates_1.preCommit).toBe('function');
        });
    });
    describe('preMerge()', () => {
        it('должен быть async функцией', () => {
            expect(quality_gates_1.preMerge.constructor.name).toBe('AsyncFunction');
        });
        it('функция существует', () => {
            expect(typeof quality_gates_1.preMerge).toBe('function');
        });
    });
    describe('preImplementation()', () => {
        it('должен быть async функцией', () => {
            expect(quality_gates_1.preImplementation.constructor.name).toBe('AsyncFunction');
        });
        it('принимает specFile', async () => {
            await expect((0, quality_gates_1.preImplementation)('SPEC/module.md')).resolves.toBeDefined();
        });
        it('принимает существующий файл', async () => {
            const result = await (0, quality_gates_1.preImplementation)('SPEC/module.md');
            expect(result.passed).toBe(true);
            expect(result.gate).toBe(5);
        });
        it('отклоняет пустой файл', async () => {
            const result = await (0, quality_gates_1.preImplementation)('');
            expect(result.passed).toBe(false);
        });
        it('отклоняет null', async () => {
            const result = await (0, quality_gates_1.preImplementation)(null);
            expect(result.passed).toBe(false);
        });
        it('отклоняет undefined', async () => {
            const result = await (0, quality_gates_1.preImplementation)(undefined);
            expect(result.passed).toBe(false);
        });
        it('gate равен 5', async () => {
            const result = await (0, quality_gates_1.preImplementation)('test.md');
            expect(result.gate).toBe(5);
        });
        it('первый check называется "Спецификация существует"', async () => {
            const result = await (0, quality_gates_1.preImplementation)('test.md');
            expect(result.checks[0].name).toBe('Спецификация существует');
        });
    });
    describe('mcpCheck()', () => {
        it('должен быть async функцией', () => {
            expect(quality_gates_1.mcpCheck.constructor.name).toBe('AsyncFunction');
        });
        it('принимает $ и directory', async () => {
            await expect((0, quality_gates_1.mcpCheck)({}, '/test')).resolves.toBeDefined();
        });
        it('возвращает QualityGateResult', async () => {
            const result = await (0, quality_gates_1.mcpCheck)({}, '/test');
            expect(result).toHaveProperty('passed');
            expect(result).toHaveProperty('gate');
            expect(result).toHaveProperty('checks');
        });
        it('gate равен 6', async () => {
            const result = await (0, quality_gates_1.mcpCheck)({}, '/test');
            expect(result.gate).toBe(6);
        });
        it('checks является массивом', async () => {
            const result = await (0, quality_gates_1.mcpCheck)({}, '/test');
            expect(Array.isArray(result.checks)).toBe(true);
        });
        it('принимает пустой directory', async () => {
            const result = await (0, quality_gates_1.mcpCheck)({}, '');
            expect(result).toBeDefined();
        });
        it('принимает /nonexistent', async () => {
            const result = await (0, quality_gates_1.mcpCheck)({}, '/nonexistent');
            expect(result).toBeDefined();
        });
    });
    describe('qualityGates default export', () => {
        it('содержит все функции', () => {
            expect(quality_gates_1.qualityGates.preExecution).toBeDefined();
            expect(quality_gates_1.qualityGates.postExecution).toBeDefined();
            expect(quality_gates_1.qualityGates.preCommit).toBeDefined();
            expect(quality_gates_1.qualityGates.preMerge).toBeDefined();
            expect(quality_gates_1.qualityGates.preImplementation).toBeDefined();
            expect(quality_gates_1.qualityGates.mcpCheck).toBeDefined();
        });
        it('использует правильные функции', async () => {
            const result = await quality_gates_1.qualityGates.preExecution({ prompt: 'test' });
            expect(result.gate).toBe(1);
        });
    });
    describe('QualityGateResult structure', () => {
        it('каждый gate возвращает правильную структуру', async () => {
            const result = await (0, quality_gates_1.preExecution)({ prompt: 'test' });
            expect(result).toHaveProperty('passed');
            expect(result).toHaveProperty('gate');
            expect(result).toHaveProperty('checks');
            expect(Array.isArray(result.checks)).toBe(true);
        });
        it('каждый check имеет name, passed, message', async () => {
            const result = await (0, quality_gates_1.preExecution)({ prompt: 'test' });
            result.checks.forEach(check => {
                expect(check).toHaveProperty('name');
                expect(check).toHaveProperty('passed');
                expect(check).toHaveProperty('message');
            });
        });
        it('passed может быть true', async () => {
            const result = await (0, quality_gates_1.preExecution)({ prompt: 'test' });
            expect(result.passed).toBe(true);
        });
        it('passed может быть false', async () => {
            const result = await (0, quality_gates_1.preExecution)({});
            expect(result.passed).toBe(false);
        });
    });
    describe('CheckResult structure', () => {
        it('CheckResult имеет правильную структуру', () => {
            const check = { name: 'Test', passed: true, message: 'OK' };
            expect(check.name).toBe('Test');
            expect(check.passed).toBe(true);
            expect(check.message).toBe('OK');
        });
        it('CheckResult passed=false', () => {
            const check = { name: 'Test', passed: false, message: 'Error' };
            expect(check.passed).toBe(false);
        });
    });
    describe('Edge cases', () => {
        it('preExecution с пустым prompt', async () => {
            const result = await (0, quality_gates_1.preExecution)({ prompt: '' });
            expect(result.passed).toBe(false);
        });
        it('preExecution с пустым subagent_type', async () => {
            const result = await (0, quality_gates_1.preExecution)({ subagent_type: '' });
            expect(typeof result.passed).toBe('boolean');
        });
        it('postExecution с пустым result', async () => {
            const result = await (0, quality_gates_1.postExecution)({ status: 'success', result: {} });
            expect(result.passed).toBe(true);
        });
        it('preImplementation с очень длинным путём', async () => {
            const result = await (0, quality_gates_1.preImplementation)('/very/long/path/to/spec/file.md');
            expect(result).toBeDefined();
        });
    });
});
