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
  describe('checkAllRules()', () => {
    it('должен быть async функцией', () => {
      expect(checkAllRules.constructor.name).toBe('AsyncFunction');
    });

    it('должен возвращать объект с passed и violations', async () => {
      const result = await checkAllRules();
      
      expect(result).toHaveProperty('passed');
      expect(result).toHaveProperty('violations');
      expect(Array.isArray(result.violations)).toBe(true);
    });

    it('должен возвращать passed как boolean', async () => {
      const result = await checkAllRules();
      
      expect(typeof result.passed).toBe('boolean');
    });
  });

  describe('checkRule()', () => {
    it('должен быть async функцией', () => {
      expect(checkRule.constructor.name).toBe('AsyncFunction');
    });

    it('должен возвращать false для незарегистрированного правила', async () => {
      const result = await checkRule('nonexistent-rule-xyz');
      
      expect(result).toBe(false);
    });

    it('должен принимать ruleId', async () => {
      const result = await checkRule('state-valid');
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getViolationLog()', () => {
    it('должен быть функцией', () => {
      expect(getViolationLog).toBeDefined();
      expect(typeof getViolationLog).toBe('function');
    });

    it('должен возвращать массив', () => {
      const result = getViolationLog();
      
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('autoFix()', () => {
    it('должен быть async функцией', () => {
      expect(autoFix.constructor.name).toBe('AsyncFunction');
    });

    it('должен возвращать false для ruleId без автоисправления', async () => {
      const result = await autoFix('nonexistent-rule');
      
      expect(result).toBe(false);
    });

    it('должен возвращать boolean', async () => {
      const result = await autoFix('state-valid');
      expect(typeof result).toBe('boolean');
    });
  });

  describe('registerRule()', () => {
    it('должен быть функцией', () => {
      expect(registerRule).toBeDefined();
      expect(typeof registerRule).toBe('function');
    });

    it('должен принимать rule объект', () => {
      const rule = {
        id: 'test-rule',
        name: 'Test Rule',
        description: 'Test description',
        severity: 'error' as const,
        check: async () => true
      };
      
      expect(() => registerRule(rule)).not.toThrow();
    });
  });

  describe('getRules()', () => {
    it('должен быть функцией', () => {
      expect(getRules).toBeDefined();
      expect(typeof getRules).toBe('function');
    });

    it('должен возвращать массив', () => {
      const result = getRules();
      
      expect(Array.isArray(result)).toBe(true);
    });

    it('должен содержать правила', () => {
      const result = getRules();
      
      expect(result.length).toBeGreaterThan(0);
    });

    it('каждое правило должно иметь id, name, description, severity, check', () => {
      const rules = getRules();
      
      rules.forEach(rule => {
        expect(rule.id).toBeDefined();
        expect(rule.name).toBeDefined();
        expect(rule.description).toBeDefined();
        expect(rule.severity).toMatch(/^(error|warning)$/);
        expect(typeof rule.check).toBe('function');
      });
    });
  });

  describe('blockingRules default export', () => {
    it('должен экспортировать checkAllRules', () => {
      expect(blockingRules.checkAllRules).toBeDefined();
    });

    it('должен экспортировать checkRule', () => {
      expect(blockingRules.checkRule).toBeDefined();
    });

    it('должен экспортировать getViolationLog', () => {
      expect(blockingRules.getViolationLog).toBeDefined();
    });

    it('должен экспортировать autoFix', () => {
      expect(blockingRules.autoFix).toBeDefined();
    });

    it('должен экспортировать registerRule', () => {
      expect(blockingRules.registerRule).toBeDefined();
    });

    it('должен экспортировать getRules', () => {
      expect(blockingRules.getRules).toBeDefined();
    });

    it('должен использовать правильные функции', async () => {
      const rules = blockingRules.getRules();
      expect(rules.length).toBeGreaterThan(0);
    });
  });

  describe('Rule registration', () => {
    it('должен регистрировать новое правило', () => {
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

    it('должен сохранять severity error правила', () => {
      const rule = {
        id: 'error-rule',
        name: 'Error Rule',
        description: 'Error severity test',
        severity: 'error' as const,
        check: async () => false
      };
      
      registerRule(rule);
      const rules = getRules();
      const found = rules.find(r => r.id === 'error-rule');
      
      expect(found?.severity).toBe('error');
    });

    it('должен сохранять severity warning правила', () => {
      const rule = {
        id: 'warning-rule',
        name: 'Warning Rule',
        description: 'Warning severity test',
        severity: 'warning' as const,
        check: async () => false
      };
      
      registerRule(rule);
      const rules = getRules();
      const found = rules.find(r => r.id === 'warning-rule');
      
      expect(found?.severity).toBe('warning');
    });
  });

  describe('BlockingRule interface', () => {
    it('должен иметь все необходимые поля', () => {
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
    it('getViolationLog должен возвращать структурированные данные', () => {
      const log = getViolationLog();
      
      log.forEach(violation => {
        expect(violation).toHaveProperty('ruleId');
        expect(violation).toHaveProperty('timestamp');
        expect(violation).toHaveProperty('details');
      });
    });
  });
});