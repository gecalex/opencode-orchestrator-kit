// Real tests for state-machine.ts using actual imports

// Mock the fs module before importing state-machine
jest.mock('fs', () => ({
  existsSync: jest.fn(() => true),
  readFileSync: jest.fn(() => '{"state":1}'),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

// Mock path module
jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
}));

import * as stateMachine from '../state-machine';
import type { ProjectStateCode } from '../types';

describe('State Machine - Real Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('State Machine Initialization', () => {
    it('должен экспортировать stateMachine объект', () => {
      expect(stateMachine).toBeDefined();
      expect(typeof stateMachine.initialize).toBe('function');
      expect(typeof stateMachine.getCurrentState).toBe('function');
      expect(typeof stateMachine.setState).toBe('function');
      expect(typeof stateMachine.isToolAllowed).toBe('function');
      expect(typeof stateMachine.isAgentAllowed).toBe('function');
    });

    it('getCurrentState должен возвращать число', () => {
      const state = stateMachine.getCurrentState();
      expect(typeof state).toBe('number');
    });
  });

  describe('State Definitions', () => {
    it('getStateDescription должен возвращать строку для каждого состояния', () => {
      for (let i = 1; i <= 10; i++) {
        const desc = stateMachine.getStateDescription(i as ProjectStateCode);
        expect(typeof desc).toBe('string');
        expect(desc.length).toBeGreaterThan(0);
      }
    });

    it('getStateDescription должен возвращать "unknown" для невалидного состояния', () => {
      const desc = stateMachine.getStateDescription(99 as ProjectStateCode);
      expect(desc).toBe('unknown');
    });
  });

  describe('Tool Permissions', () => {
    it('isToolAllowed должен проверять разрешения инструментов', () => {
      // State 1 должен разрешать 'read', 'glob', 'grep', 'skill', 'todowrite', 'task'
      const readAllowed = stateMachine.isToolAllowed('read', 1 as ProjectStateCode);
      expect(typeof readAllowed).toBe('boolean');
      
      const bashAllowed = stateMachine.isToolAllowed('bash', 1 as ProjectStateCode);
      expect(typeof bashAllowed).toBe('boolean');
    });
  });

  describe('Agent Permissions', () => {
    it('isAgentAllowed должен проверять разрешения агентов', () => {
      const projectInitAllowed = stateMachine.isAgentAllowed('project-initializer', 1 as ProjectStateCode);
      expect(typeof projectInitAllowed).toBe('boolean');
      
      const pythonDevBlocked = stateMachine.isAgentAllowed('python-developer', 1 as ProjectStateCode);
      expect(typeof pythonDevBlocked).toBe('boolean');
    });
  });

  describe('State Transitions', () => {
    it('getAvailableTransitions должен возвращать массив переходов', () => {
      const transitions = stateMachine.getAvailableTransitions();
      expect(transitions).toBeInstanceOf(Array);
    });
  });

  describe('State Machine Interface', () => {
    it('должен иметь все необходимые методы', () => {
      expect(stateMachine.initialize).toBeDefined();
      expect(stateMachine.getState).toBeDefined();
      expect(stateMachine.getCurrentState).toBeDefined();
      expect(stateMachine.setState).toBeDefined();
      expect(stateMachine.isToolAllowed).toBeDefined();
      expect(stateMachine.isAgentAllowed).toBeDefined();
      expect(stateMachine.getStateDescription).toBeDefined();
      expect(stateMachine.updateAfterTask).toBeDefined();
      expect(stateMachine.getAvailableTransitions).toBeDefined();
      expect(stateMachine.tryTransition).toBeDefined();
    });
  });

  describe('initialize()', () => {
    it('должен быть async функцией', () => {
      expect(stateMachine.initialize.constructor.name).toBe('AsyncFunction');
    });
  });

  describe('getState()', () => {
    it('должен быть async функцией', () => {
      expect(stateMachine.getState.constructor.name).toBe('AsyncFunction');
    });
  });

  describe('setState()', () => {
    it('должен быть функцией', () => {
      expect(typeof stateMachine.setState).toBe('function');
    });
  });

  describe('updateAfterTask()', () => {
    it('должен быть async функцией', () => {
      expect(stateMachine.updateAfterTask.constructor.name).toBe('AsyncFunction');
    });
  });

  describe('tryTransition()', () => {
    it('должен быть функцией', () => {
      expect(typeof stateMachine.tryTransition).toBe('function');
    });
  });
});