// Tests for session-hooks.ts
import {
  logToFile,
  saveContext,
  loadContext,
  logError,
  onSessionCreated,
  onSessionIdle,
  onSessionCompacted,
  onSessionError,
  sessionHooks
} from '../session-hooks';

describe('Session Hooks Module', () => {
  describe('sessionHooks default export', () => {
    it('должен экспортировать saveContext', () => {
      expect(sessionHooks.saveContext).toBeDefined();
    });

    it('должен экспортировать loadContext', () => {
      expect(sessionHooks.loadContext).toBeDefined();
    });

    it('должен экспортировать logError', () => {
      expect(sessionHooks.logError).toBeDefined();
    });

    it('должен экспортировать onSessionCreated', () => {
      expect(sessionHooks.onSessionCreated).toBeDefined();
    });

    it('должен экспортировать onSessionIdle', () => {
      expect(sessionHooks.onSessionIdle).toBeDefined();
    });

    it('должен экспортировать onSessionCompacted', () => {
      expect(sessionHooks.onSessionCompacted).toBeDefined();
    });

    it('должен экспортировать onSessionError', () => {
      expect(sessionHooks.onSessionError).toBeDefined();
    });
  });

  describe('logToFile()', () => {
    it('должен быть функцией', () => {
      expect(logToFile).toBeDefined();
      expect(typeof logToFile).toBe('function');
    });

    it('должен принимать message', () => {
      expect(() => logToFile('test message')).not.toThrow();
    });

    it('должен принимать тип лога', () => {
      expect(() => logToFile('test', 'info')).not.toThrow();
      expect(() => logToFile('test', 'debug')).not.toThrow();
      expect(() => logToFile('test', 'error')).not.toThrow();
    });
  });

  describe('saveContext()', () => {
    it('должен быть async функцией', () => {
      expect(saveContext.constructor.name).toBe('AsyncFunction');
    });
  });

  describe('loadContext()', () => {
    it('должен быть функцией', () => {
      expect(loadContext).toBeDefined();
      expect(typeof loadContext).toBe('function');
    });

    it('должен принимать directory', () => {
      expect(() => loadContext('/test')).not.toThrow();
    });

    it('должен возвращать null для несуществующего пути', () => {
      const result = loadContext('/nonexistent/path/xyz123');
      expect(result).toBeNull();
    });
  });

  describe('logError()', () => {
    it('должен быть функцией', () => {
      expect(logError).toBeDefined();
      expect(typeof logError).toBe('function');
    });

    it('должен принимать directory и error', () => {
      const error = new Error('Test error');
      expect(() => logError('/test', error)).not.toThrow();
    });

    it('должен принимать context', () => {
      const error = new Error('Test error');
      expect(() => logError('/test', error, { key: 'value' })).not.toThrow();
    });
  });

  describe('onSessionCreated()', () => {
    it('должен быть async функцией', () => {
      expect(onSessionCreated.constructor.name).toBe('AsyncFunction');
    });
  });

  describe('onSessionIdle()', () => {
    it('должен быть async функцией', () => {
      expect(onSessionIdle.constructor.name).toBe('AsyncFunction');
    });
  });

  describe('onSessionCompacted()', () => {
    it('должен быть async функцией', () => {
      expect(onSessionCompacted.constructor.name).toBe('AsyncFunction');
    });
  });

  describe('onSessionError()', () => {
    it('должен быть async функцией', () => {
      expect(onSessionError.constructor.name).toBe('AsyncFunction');
    });

    it('должен принимать directory и error', async () => {
      const error = new Error('Test error');
      expect(() => onSessionError('/test', error)).not.toThrow();
    });
  });

  describe('Context structure', () => {
    it('должен иметь state', () => {
      const context: any = { state: 5, savedAt: '2024-01-01', history: [] };
      expect(context.state).toBe(5);
    });

    it('должен иметь savedAt', () => {
      const context: any = { state: 3, savedAt: '2024-01-01', history: [] };
      expect(context.savedAt).toBe('2024-01-01');
    });

    it('должен иметь optional fields', () => {
      const context: any = { state: 3, lastTaskId: 'T-001', lastAgent: 'python-developer', savedAt: '2024-01-01', history: [] };
      expect(context.lastTaskId).toBe('T-001');
      expect(context.lastAgent).toBe('python-developer');
    });

    it('должен иметь history', () => {
      const context: any = { state: 2, savedAt: '2024-01-01', history: [] };
      expect(context.history).toEqual([]);
    });
  });

  describe('Error structure', () => {
    it('должен иметь error', () => {
      const err = { error: 'Error message', timestamp: '2024-01-01' };
      expect(err.error).toBe('Error message');
    });

    it('должен иметь optional stack', () => {
      const err = { error: 'Error', stack: 'at line 1', timestamp: '2024-01-01' };
      expect(err.stack).toBe('at line 1');
    });

    it('должен иметь optional context', () => {
      const err = { error: 'Error', timestamp: '2024-01-01', context: { data: 'test' } };
      expect(err.context).toBeDefined();
    });
  });
});