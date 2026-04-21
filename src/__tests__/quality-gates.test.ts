// Tests for quality-gates.ts
import {
  preExecution,
  postExecution,
  preCommit,
  preMerge,
  preImplementation,
  mcpCheck,
  qualityGates
} from '../quality-gates';

describe('Quality Gates Module', () => {
  describe('preExecution()', () => {
    it('должен пропускать task input с prompt', async () => {
      const result = await preExecution({ prompt: 'test task' });
      
      expect(result.passed).toBe(true);
      expect(result.gate).toBe(1);
      expect(result.checks).toHaveLength(1);
      expect(result.checks[0].name).toBe('Task input');
    });

    it('должен пропускать task input с subagent_type', async () => {
      const result = await preExecution({ subagent_type: 'python-developer' });
      
      expect(result.passed).toBe(true);
    });

    it('должен пропускать task input с description', async () => {
      const result = await preExecution({ description: 'test description' });
      
      expect(result.passed).toBe(true);
    });

    it('должен отклонять пустой ввод', async () => {
      const result = await preExecution({});
      
      expect(result.passed).toBe(false);
      expect(result.checks).toHaveLength(2);
    });

    it('должен отклонять null ввод', async () => {
      const result = await preExecution(null);
      
      expect(result.passed).toBe(false);
    });
  });

  describe('postExecution()', () => {
    it('должен принимать успешный результат', async () => {
      const result = await postExecution({ status: 'success', result: { data: 'test' } });
      
      expect(result.passed).toBe(true);
      expect(result.gate).toBe(2);
    });

    it('должен отклонять неуспешный статус', async () => {
      const result = await postExecution({ status: 'error', result: null });
      
      expect(result.passed).toBe(false);
      expect(result.checks[0].passed).toBe(false);
    });

    it('должен требовать результат', async () => {
      const result = await postExecution({ status: 'success', result: null });
      
      expect(result.passed).toBe(false);
      expect(result.checks[1].passed).toBe(false);
    });
  });

  describe('preMerge()', () => {
    it('должен экспортировать функцию', async () => {
      expect(preMerge).toBeDefined();
      expect(typeof preMerge).toBe('function');
    });
  });

  describe('preImplementation()', () => {
    it('должен принимать существующий файл', async () => {
      const result = await preImplementation('SPEC/module.md');
      
      expect(result.passed).toBe(true);
      expect(result.gate).toBe(5);
      expect(result.checks[0].name).toBe('Спецификация существует');
    });

    it('должен отклонять пустой файл', async () => {
      const result = await preImplementation('');
      
      expect(result.passed).toBe(false);
      expect(result.checks[0].passed).toBe(false);
    });

    it('должен отклонять null', async () => {
      const result = await preImplementation(null as any);
      
      expect(result.passed).toBe(false);
    });
  });

  describe('mcpCheck()', () => {
    it('должен экспортировать функцию', () => {
      expect(mcpCheck).toBeDefined();
      expect(typeof mcpCheck).toBe('function');
    });
  });

  describe('qualityGates default export', () => {
    it('должен экс��ортировать все функции', () => {
      expect(qualityGates.preExecution).toBeDefined();
      expect(qualityGates.postExecution).toBeDefined();
      expect(qualityGates.preCommit).toBeDefined();
      expect(qualityGates.preMerge).toBeDefined();
      expect(qualityGates.preImplementation).toBeDefined();
      expect(qualityGates.mcpCheck).toBeDefined();
    });

    it('должен использовать правильные функции', async () => {
      const result = await qualityGates.preExecution({ prompt: 'test' });
      expect(result.gate).toBe(1);
    });
  });

  describe('QualityGateResult structure', () => {
    it('каждый gate должен возвращать правильную структуру', async () => {
      const result = await preExecution({ prompt: 'test', subagent_type: 'test' });
      
      expect(result).toHaveProperty('passed');
      expect(result).toHaveProperty('gate');
      expect(result).toHaveProperty('checks');
      expect(Array.isArray(result.checks)).toBe(true);
    });

    it('каждый check должен иметь name, passed, message', async () => {
      const result = await preExecution({ prompt: 'test' });
      
      result.checks.forEach(check => {
        expect(check).toHaveProperty('name');
        expect(check).toHaveProperty('passed');
        expect(check).toHaveProperty('message');
      });
    });
  });

  describe('preCommit()', () => {
    it('должен быть async функцией', () => {
      expect(preCommit.constructor.name).toBe('AsyncFunction');
    });
  });

  describe('mcpCheck()', () => {
    it('должен быть async функцией', () => {
      expect(mcpCheck.constructor.name).toBe('AsyncFunction');
    });

    it('должен принимать $ и directory', async () => {
      const result = await mcpCheck({}, '/nonexistent');
      expect(result).toHaveProperty('passed');
      expect(result).toHaveProperty('gate');
      expect(result.gate).toBe(6);
    });

    it('должен возвращать checks массив', async () => {
      const result = await mcpCheck({}, '/test');
      expect(Array.isArray(result.checks)).toBe(true);
    });
  });
});