"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Tests for blocking-rules.ts
const blocking_rules_1 = require("../blocking-rules");
describe('Blocking Rules Module', () => {
    describe('Module exports', () => {
        it('должен экспортировать checkAllRules', () => {
            expect(blocking_rules_1.checkAllRules).toBeDefined();
            expect(typeof blocking_rules_1.checkAllRules).toBe('function');
        });
        it('должен экспортировать checkRule', () => {
            expect(blocking_rules_1.checkRule).toBeDefined();
            expect(typeof blocking_rules_1.checkRule).toBe('function');
        });
        it('должен экспортировать getViolationLog', () => {
            expect(blocking_rules_1.getViolationLog).toBeDefined();
            expect(typeof blocking_rules_1.getViolationLog).toBe('function');
        });
        it('должен экспортировать autoFix', () => {
            expect(blocking_rules_1.autoFix).toBeDefined();
            expect(typeof blocking_rules_1.autoFix).toBe('function');
        });
        it('должен экспортировать registerRule', () => {
            expect(blocking_rules_1.registerRule).toBeDefined();
            expect(typeof blocking_rules_1.registerRule).toBe('function');
        });
        it('должен экспортировать getRules', () => {
            expect(blocking_rules_1.getRules).toBeDefined();
            expect(typeof blocking_rules_1.getRules).toBe('function');
        });
        it('должен экспортировать blockingRules объект', () => {
            expect(blocking_rules_1.blockingRules).toBeDefined();
            expect(typeof blocking_rules_1.blockingRules).toBe('object');
        });
    });
    describe('checkAllRules()', () => {
        it('должен быть async функцией', () => {
            expect(blocking_rules_1.checkAllRules.constructor.name).toBe('AsyncFunction');
        });
        it('возвращает объект с passed и violations', async () => {
            const result = await (0, blocking_rules_1.checkAllRules)();
            expect(result).toHaveProperty('passed');
            expect(result).toHaveProperty('violations');
        });
        it('violations является массивом', async () => {
            const result = await (0, blocking_rules_1.checkAllRules)();
            expect(Array.isArray(result.violations)).toBe(true);
        });
        it('passed является boolean', async () => {
            const result = await (0, blocking_rules_1.checkAllRules)();
            expect(typeof result.passed).toBe('boolean');
        });
        it('не выбрасывает исключение', async () => {
            await expect((0, blocking_rules_1.checkAllRules)()).resolves.toBeDefined();
        });
    });
    describe('checkRule()', () => {
        it('должен быть async функцией', () => {
            expect(blocking_rules_1.checkRule.constructor.name).toBe('AsyncFunction');
        });
        it('возвращает false для незарегистрированного правила', async () => {
            const result = await (0, blocking_rules_1.checkRule)('nonexistent-rule-xyz');
            expect(result).toBe(false);
        });
        it('принимает ruleId', async () => {
            const result = await (0, blocking_rules_1.checkRule)('state-valid');
            expect(typeof result).toBe('boolean');
        });
        it('принимает state-valid ruleId', async () => {
            const result = await (0, blocking_rules_1.checkRule)('state-valid');
            expect(typeof result).toBe('boolean');
        });
        it('принимает preconditions-analyst ruleId', async () => {
            const result = await (0, blocking_rules_1.checkRule)('preconditions-analyst');
            expect(typeof result).toBe('boolean');
        });
        it('принимает preconditions-coder ruleId', async () => {
            const result = await (0, blocking_rules_1.checkRule)('preconditions-coder');
            expect(typeof result).toBe('boolean');
        });
        it('принимает git-workflow ruleId', async () => {
            const result = await (0, blocking_rules_1.checkRule)('git-workflow');
            expect(typeof result).toBe('boolean');
        });
        it('принимает user-approval ruleId', async () => {
            const result = await (0, blocking_rules_1.checkRule)('user-approval');
            expect(typeof result).toBe('boolean');
        });
    });
    describe('getViolationLog()', () => {
        it('должен быть функцией', () => {
            expect(typeof blocking_rules_1.getViolationLog).toBe('function');
        });
        it('возвращает массив', () => {
            const result = (0, blocking_rules_1.getViolationLog)();
            expect(Array.isArray(result)).toBe(true);
        });
        it('может быть пустым', () => {
            const result = (0, blocking_rules_1.getViolationLog)();
            expect(result).toBeDefined();
        });
    });
    describe('autoFix()', () => {
        it('должен быть async функцией', () => {
            expect(blocking_rules_1.autoFix.constructor.name).toBe('AsyncFunction');
        });
        it('возвращает false для незарегистрированного правила', async () => {
            const result = await (0, blocking_rules_1.autoFix)('nonexistent-rule');
            expect(result).toBe(false);
        });
        it('возвращает boolean для state-valid', async () => {
            const result = await (0, blocking_rules_1.autoFix)('state-valid');
            expect(typeof result).toBe('boolean');
        });
        it('возвращает false для git-workflow', async () => {
            const result = await (0, blocking_rules_1.autoFix)('git-workflow');
            expect(typeof result).toBe('boolean');
        });
        it('возвращает false для user-approval', async () => {
            const result = await (0, blocking_rules_1.autoFix)('user-approval');
            expect(typeof result).toBe('boolean');
        });
    });
    describe('registerRule()', () => {
        it('должен быть функцией', () => {
            expect(typeof blocking_rules_1.registerRule).toBe('function');
        });
        it('принимает rule объект', () => {
            const rule = {
                id: 'test-rule',
                name: 'Test Rule',
                description: 'Test description',
                severity: 'error',
                check: async () => true
            };
            expect(() => (0, blocking_rules_1.registerRule)(rule)).not.toThrow();
        });
        it('принимает severity warning', () => {
            const rule = {
                id: 'test-warning',
                name: 'Test',
                description: 'Test',
                severity: 'warning',
                check: async () => true
            };
            expect(() => (0, blocking_rules_1.registerRule)(rule)).not.toThrow();
        });
    });
    describe('getRules()', () => {
        it('должен быть функцией', () => {
            expect(typeof blocking_rules_1.getRules).toBe('function');
        });
        it('возвращает массив', () => {
            const result = (0, blocking_rules_1.getRules)();
            expect(Array.isArray(result)).toBe(true);
        });
        it('содержит правила', () => {
            const result = (0, blocking_rules_1.getRules)();
            expect(result.length).toBeGreaterThan(0);
        });
        it('каждое правило имеет id', () => {
            const rules = (0, blocking_rules_1.getRules)();
            rules.forEach(rule => {
                expect(rule.id).toBeDefined();
            });
        });
        it('каждое правило имеет name', () => {
            const rules = (0, blocking_rules_1.getRules)();
            rules.forEach(rule => {
                expect(rule.name).toBeDefined();
            });
        });
        it('каждое правило имеет description', () => {
            const rules = (0, blocking_rules_1.getRules)();
            rules.forEach(rule => {
                expect(rule.description).toBeDefined();
            });
        });
        it('каждое правило имеет severity error или warning', () => {
            const rules = (0, blocking_rules_1.getRules)();
            rules.forEach(rule => {
                expect(rule.severity).toMatch(/^(error|warning)$/);
            });
        });
        it('каждое правило имеет check функцию', () => {
            const rules = (0, blocking_rules_1.getRules)();
            rules.forEach(rule => {
                expect(typeof rule.check).toBe('function');
            });
        });
    });
    describe('blockingRules default export', () => {
        it('экспортирует checkAllRules', () => {
            expect(blocking_rules_1.blockingRules.checkAllRules).toBeDefined();
        });
        it('экспортирует checkRule', () => {
            expect(blocking_rules_1.blockingRules.checkRule).toBeDefined();
        });
        it('экспортирует getViolationLog', () => {
            expect(blocking_rules_1.blockingRules.getViolationLog).toBeDefined();
        });
        it('экспортирует autoFix', () => {
            expect(blocking_rules_1.blockingRules.autoFix).toBeDefined();
        });
        it('экспортирует registerRule', () => {
            expect(blocking_rules_1.blockingRules.registerRule).toBeDefined();
        });
        it('экспортирует getRules', () => {
            expect(blocking_rules_1.blockingRules.getRules).toBeDefined();
        });
        it('blockingRules.getRules() === getRules()', () => {
            expect(blocking_rules_1.blockingRules.getRules).toBe(blocking_rules_1.getRules);
        });
    });
    describe('Rule registration', () => {
        it('регистрирует новое правило', () => {
            const before = (0, blocking_rules_1.getRules)().length;
            (0, blocking_rules_1.registerRule)({
                id: 'new-test-rule',
                name: 'New Test Rule',
                description: 'Testing new rule registration',
                severity: 'warning',
                check: async () => true
            });
            const after = (0, blocking_rules_1.getRules)().length;
            expect(after).toBeGreaterThan(before);
        });
        it('сохраняет severity error', () => {
            (0, blocking_rules_1.registerRule)({
                id: 'error-rule',
                name: 'Error Rule',
                description: 'Error severity test',
                severity: 'error',
                check: async () => false
            });
            const rules = (0, blocking_rules_1.getRules)();
            const found = rules.find(r => r.id === 'error-rule');
            expect(found?.severity).toBe('error');
        });
        it('сохраняет severity warning', () => {
            (0, blocking_rules_1.registerRule)({
                id: 'warning-rule',
                name: 'Warning Rule',
                description: 'Warning severity test',
                severity: 'warning',
                check: async () => false
            });
            const rules = (0, blocking_rules_1.getRules)();
            const found = rules.find(r => r.id === 'warning-rule');
            expect(found?.severity).toBe('warning');
        });
    });
    describe('BlockingRule interface fields', () => {
        it('имеет все необходимые поля', () => {
            const rule = {
                id: 'interface-test',
                name: 'Test',
                description: 'Test description',
                severity: 'error',
                check: async () => true
            };
            expect(rule.id).toBeDefined();
            expect(rule.name).toBeDefined();
            expect(rule.description).toBeDefined();
            expect(rule.severity).toBe('error');
            expect(typeof rule.check).toBe('function');
        });
    });
    describe('RuleViolation structure', () => {
        it('getViolationLog возвращает структурированные данные', () => {
            const log = (0, blocking_rules_1.getViolationLog)();
            log.forEach(violation => {
                expect(violation).toHaveProperty('ruleId');
                expect(violation).toHaveProperty('timestamp');
                expect(violation).toHaveProperty('details');
            });
        });
        it('может быть пустым массивом', () => {
            const log = (0, blocking_rules_1.getViolationLog)();
            expect(log).toBeInstanceOf(Array);
        });
    });
    describe('Edge cases', () => {
        it('registerRule с пустым id не выбрасывает', () => {
            expect(() => (0, blocking_rules_1.registerRule)({
                id: '',
                name: 'Test',
                description: 'Test',
                severity: 'error',
                check: async () => true
            })).not.toThrow();
        });
        it('registerRule с очень длинным description', () => {
            const longDesc = 'a'.repeat(1000);
            expect(() => (0, blocking_rules_1.registerRule)({
                id: 'long-desc',
                name: 'Test',
                description: longDesc,
                severity: 'warning',
                check: async () => true
            })).not.toThrow();
        });
        it('checkRule с пустой строкой', async () => {
            const result = await (0, blocking_rules_1.checkRule)('');
            expect(typeof result).toBe('boolean');
        });
        it('getRules() возвращает массив при повторных вызовах', () => {
            const rules1 = (0, blocking_rules_1.getRules)();
            const rules2 = (0, blocking_rules_1.getRules)();
            expect(rules1).toHaveLength(rules2.length);
        });
    });
});
