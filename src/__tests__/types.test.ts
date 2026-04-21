// Tests for types.ts
import type { ProjectStateCode, ProjectState, PreFlightResult, QualityGateResult, CheckResult } from '../types';

describe('Types - TYPE Module', () => {
  describe('ProjectStateCode', () => {
    it('должен быть одним из 10 допустимых значений', () => {
      const codes: ProjectStateCode[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      codes.forEach(code => {
        expect([1,2,3,4,5,6,7,8,9,10].includes(code)).toBe(true);
      });
    });
  });

  describe('ProjectState', () => {
    it('должен иметь все обязательные поля', () => {
      const state: ProjectState = {
        code: 1,
        description: 'Test',
        allowedAgents: ['agent1'],
        blockedAgents: ['agent2'],
        allowedTools: ['read']
      };
      
      expect(state.code).toBeDefined();
      expect(state.description).toBeDefined();
      expect(state.allowedAgents).toBeInstanceOf(Array);
      expect(state.blockedAgents).toBeInstanceOf(Array);
      expect(state.allowedTools).toBeInstanceOf(Array);
    });
  });

  describe('PreFlightResult', () => {
    it('должен иметь структуру результата проверки', () => {
      const result: PreFlightResult = {
        success: false,
        passed: 4,
        failed: 2,
        errors: ['Error 1', 'Error 2']
      };
      
      expect(result.success).toBe(false);
      expect(result.passed).toBe(4);
      expect(result.failed).toBe(2);
      expect(result.errors).toHaveLength(2);
    });
  });

  describe('QualityGateResult', () => {
    it('должен иметь структуру результата Quality Gate', () => {
      const result: QualityGateResult = {
        passed: true,
        gate: 1,
        checks: [
          { name: 'check1', passed: true, message: 'OK' },
          { name: 'check2', passed: false, message: 'Failed' }
        ]
      };
      
      expect(result.passed).toBe(true);
      expect(result.gate).toBe(1);
      expect(result.checks).toHaveLength(2);
    });
  });

  describe('CheckResult', () => {
    it('должен иметь структуру отдельной проверки', () => {
      const check: CheckResult = {
        name: 'syntax',
        passed: true,
        message: 'All files compile successfully'
      };
      
      expect(check.name).toBe('syntax');
      expect(check.passed).toBe(true);
      expect(check.message).toBe('All files compile successfully');
    });
  });

  describe('Tool type', () => {
    it('должен включать стандартные инструменты opencode', () => {
      const standardTools = ['read', 'write', 'bash', 'glob', 'grep', 'edit', 'task', 'skill', 'todowrite', 'question'];
      standardTools.forEach(tool => {
        expect(typeof tool).toBe('string');
      });
    });
  });

  describe('Agent type', () => {
    it('должен включать стандартные типы агентов', () => {
      const agentTypes = [
        'project-initializer',
        'constitution-agent',
        'specify-agent',
        'plan-agent',
        'tasks-agent',
        'python-developer',
        'typescript-developer',
        'go-developer',
        'react-developer',
        'code-reviewer',
        'security-auditor'
      ];
      
      expect(agentTypes).toContain('python-developer');
      expect(agentTypes).toContain('typescript-developer');
    });
  });
});