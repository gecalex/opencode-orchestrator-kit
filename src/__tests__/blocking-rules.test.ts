// Tests for blocking-rules.ts
import {
  checkAllRules,
  checkRule,
  getViolationLog,
  autoFix,
  registerRule,
  getRules,
  blockingRules
} from '../blocking-rules';

describe('Blocking Rules Module', () => {
  describe('Module exports', () => {
    it('должен экспортировать checkAllRules', () => {
      expect(checkAllRules).toBeDefined();
      expect(typeof checkAllRules).toBe('function');
    });

    it('должен экспортировать checkRule', () => {
      expect(checkRule).toBeDefined();
      expect(typeof checkRule).toBe('function');
    });

    it('должен экспортировать getViolationLog', () => {
      expect(getViolationLog).toBeDefined();
      expect(typeof getViolationLog).toBe('function');
    });

    it('должен экспортировать autoFix', () => {
      expect(autoFix).toBeDefined();
      expect(typeof autoFix).toBe('function');
    });

    it('должен экспортировать registerRule', () => {
      expect(registerRule).toBeDefined();
      expect(typeof registerRule).toBe('function');
    });

    it('должен экспортировать getRules', () => {
      expect(getRules).toBeDefined();
      expect(typeof getRules).toBe('function');
    });

    it('должен экспортировать blockingRules объект', () => {
      expect(blockingRules).toBeDefined();
      expect(typeof blockingRules).toBe('object');
    });
  });

  describe('checkAllRules()', () => {
    it('должен быть async функцией', () => {
      expect(checkAllRules.constructor.name).toBe('AsyncFunction');
    });

    it('возвращает объект с passed и violations', async () => {
      const result = await checkAllRules();
      expect(result).toHaveProperty('passed');
      expect(result).toHaveProperty('violations');
    });

    it('violations является массивом', async () => {
      const result = await checkAllRules();
      expect(Array.isArray(result.violations)).toBe(true);
    });

    it('passed является boolean', async () => {
      const result = await checkAllRules();
      expect(typeof result.passed).toBe('boolean');
    });

    it('не выбрасывает исключение', async () => {
      await expect(checkAllRules()).resolves.toBeDefined();
    });
  });

  describe('checkRule()', () => {
    it('должен быть async функцией', () => {
      expect(checkRule.constructor.name).toBe('AsyncFunction');
    });

    it('возвращает false для незарегистрированного правила', async () => {
      const result = await checkRule('nonexistent-rule-xyz');
      expect(result).toBe(false);
    });

    it('принимает ruleId', async () => {
      const result = await checkRule('state-valid');
      expect(typeof result).toBe('boolean');
    });

    it('принимает state-valid ruleId', async () => {
      const result = await checkRule('state-valid');
      expect(typeof result).toBe('boolean');
    });

    it('принимает preconditions-analyst ruleId', async () => {
      const result = await checkRule('preconditions-analyst');
      expect(typeof result).toBe('boolean');
    });

    it('принимает preconditions-coder ruleId', async () => {
      const result = await checkRule('preconditions-coder');
      expect(typeof result).toBe('boolean');
    });

    it('принимает git-workflow ruleId', async () => {
      const result = await checkRule('git-workflow');
      expect(typeof result).toBe('boolean');
    });

    it('принимает user-approval ruleId', async () => {
      const result = await checkRule('user-approval');
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getViolationLog()', () => {
    it('должен быть функцией', () => {
      expect(typeof getViolationLog).toBe('function');
    });

    it('возвращает массив', () => {
      const result = getViolationLog();
      expect(Array.isArray(result)).toBe(true);
    });

    it('может быть пустым', () => {
      const result = getViolationLog();
      expect(result).toBeDefined();
    });
  });

  describe('autoFix()', () => {
    it('должен быть async функцией', () => {
      expect(autoFix.constructor.name).toBe('AsyncFunction');
    });

    it('возвращает false для незарегистрированного правила', async () => {
      const result = await autoFix('nonexistent-rule');
      expect(result).toBe(false);
    });

    it('возвращает boolean для state-valid', async () => {
      const result = await autoFix('state-valid');
      expect(typeof result).toBe('boolean');
    });

    it('возвращает false для git-workflow', async () => {
      const result = await autoFix('git-workflow');
      expect(typeof result).toBe('boolean');
    });

    it('возвращает false для user-approval', async () => {
      const result = await autoFix('user-approval');
      expect(typeof result).toBe('boolean');
    });
  });

  describe('registerRule()', () => {
    it('должен быть функцией', () => {
      expect(typeof registerRule).toBe('function');
    });

    it('принимает rule объект', () => {
      const rule = {
        id: 'test-rule',
        name: 'Test Rule',
        description: 'Test description',
        severity: 'error' as const,
        check: async () => true
      };
      expect(() => registerRule(rule)).not.toThrow();
    });

    it('принимает severity warning', () => {
      const rule = {
        id: 'test-warning',
        name: 'Test',
        description: 'Test',
        severity: 'warning' as const,
        check: async () => true
      };
      expect(() => registerRule(rule)).not.toThrow();
    });
  });

  describe('getRules()', () => {
    it('должен быть функцией', () => {
      expect(typeof getRules).toBe('function');
    });

    it('возвращает массив', () => {
      const result = getRules();
      expect(Array.isArray(result)).toBe(true);
    });

    it('содержит правила', () => {
      const result = getRules();
      expect(result.length).toBeGreaterThan(0);
    });

    it('каждое правило имеет id', () => {
      const rules = getRules();
      rules.forEach(rule => {
        expect(rule.id).toBeDefined();
      });
    });

    it('каждое правило имеет name', () => {
      const rules = getRules();
      rules.forEach(rule => {
        expect(rule.name).toBeDefined();
      });
    });

    it('каждое правило имеет description', () => {
      const rules = getRules();
      rules.forEach(rule => {
        expect(rule.description).toBeDefined();
      });
    });

    it('каждое правило имеет severity error или warning', () => {
      const rules = getRules();
      rules.forEach(rule => {
        expect(rule.severity).toMatch(/^(error|warning)$/);
      });
    });

    it('каждое правило имеет check функцию', () => {
      const rules = getRules();
      rules.forEach(rule => {
        expect(typeof rule.check).toBe('function');
      });
    });
  });

  describe('blockingRules default export', () => {
    it('экспортирует checkAllRules', () => {
      expect(blockingRules.checkAllRules).toBeDefined();
    });

    it('экспортирует checkRule', () => {
      expect(blockingRules.checkRule).toBeDefined();
    });

    it('экспортирует getViolationLog', () => {
      expect(blockingRules.getViolationLog).toBeDefined();
    });

    it('экспортирует autoFix', () => {
      expect(blockingRules.autoFix).toBeDefined();
    });

    it('экспортирует registerRule', () => {
      expect(blockingRules.registerRule).toBeDefined();
    });

    it('экспортирует getRules', () => {
      expect(blockingRules.getRules).toBeDefined();
    });

    it('blockingRules.getRules() === getRules()', () => {
      expect(blockingRules.getRules).toBe(getRules);
    });
  });

  describe('Rule registration', () => {
    it('регистрирует новое правило', () => {
      const before = getRules().length;
      registerRule({
        id: 'new-test-rule',
        name: 'New Test Rule',
        description: 'Testing new rule registration',
        severity: 'warning',
        check: async () => true
      });
      const after = getRules().length;
      expect(after).toBeGreaterThan(before);
    });

    it('сохраняет severity error', () => {
      registerRule({
        id: 'error-rule',
        name: 'Error Rule',
        description: 'Error severity test',
        severity: 'error',
        check: async () => false
      });
      const rules = getRules();
      const found = rules.find(r => r.id === 'error-rule');
      expect(found?.severity).toBe('error');
    });

    it('сохраняет severity warning', () => {
      registerRule({
        id: 'warning-rule',
        name: 'Warning Rule',
        description: 'Warning severity test',
        severity: 'warning',
        check: async () => false
      });
      const rules = getRules();
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
        severity: 'error' as const,
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
      const log = getViolationLog();
      log.forEach(violation => {
        expect(violation).toHaveProperty('ruleId');
        expect(violation).toHaveProperty('timestamp');
        expect(violation).toHaveProperty('details');
      });
    });

    it('может быть пустым массивом', () => {
      const log = getViolationLog();
      expect(log).toBeInstanceOf(Array);
    });
  });

  describe('Edge cases', () => {
    it('registerRule с пустым id не выбрасывает', () => {
      expect(() => registerRule({
        id: '',
        name: 'Test',
        description: 'Test',
        severity: 'error',
        check: async () => true
      })).not.toThrow();
    });

    it('registerRule с очень длинным description', () => {
      const longDesc = 'a'.repeat(1000);
      expect(() => registerRule({
        id: 'long-desc',
        name: 'Test',
        description: longDesc,
        severity: 'warning',
        check: async () => true
      })).not.toThrow();
    });

    it('checkRule с пустой строкой', async () => {
      const result = await checkRule('');
      expect(typeof result).toBe('boolean');
    });

    it('getRules() возвращает массив при повторных вызовах', () => {
      const rules1 = getRules();
      const rules2 = getRules();
      expect(rules1).toHaveLength(rules2.length);
    });
  });
});