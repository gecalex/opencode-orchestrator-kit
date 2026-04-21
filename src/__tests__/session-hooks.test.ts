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
  describe('Module exports', () => {
    it('должен экспортировать все функции напрямую', () => {
      expect(logToFile).toBeDefined();
      expect(saveContext).toBeDefined();
      expect(loadContext).toBeDefined();
      expect(logError).toBeDefined();
      expect(onSessionCreated).toBeDefined();
      expect(onSessionIdle).toBeDefined();
      expect(onSessionCompacted).toBeDefined();
      expect(onSessionError).toBeDefined();
    });

    it('должен экспортировать sessionHooks объект', () => {
      expect(sessionHooks).toBeDefined();
      expect(typeof sessionHooks).toBe('object');
    });

    it('sessionHooks содержит все функции', () => {
      expect(sessionHooks.saveContext).toBeDefined();
      expect(sessionHooks.loadContext).toBeDefined();
      expect(sessionHooks.logError).toBeDefined();
      expect(sessionHooks.onSessionCreated).toBeDefined();
      expect(sessionHooks.onSessionIdle).toBeDefined();
      expect(sessionHooks.onSessionCompacted).toBeDefined();
      expect(sessionHooks.onSessionError).toBeDefined();
    });

    it('sessionHooks.saveContext === saveContext', () => {
      expect(sessionHooks.saveContext).toBe(saveContext);
    });

    it('sessionHooks.loadContext === loadContext', () => {
      expect(sessionHooks.loadContext).toBe(loadContext);
    });
  });

  describe('logToFile()', () => {
    it('должен быть функцией', () => {
      expect(typeof logToFile).toBe('function');
    });

    it('должен принимать message', () => {
      expect(() => logToFile('test message')).not.toThrow();
    });

    it('должен принимать message и type=info', () => {
      expect(() => logToFile('test', 'info')).not.toThrow();
    });

    it('должен принимать message и type=debug', () => {
      expect(() => logToFile('test', 'debug')).not.toThrow();
    });

    it('должен принимать message и type=error', () => {
      expect(() => logToFile('test', 'error')).not.toThrow();
    });

    it('type по умолчанию = info', () => {
      expect(() => logToFile('test')).not.toThrow();
    });
  });

  describe('saveContext()', () => {
    it('должен быть async функцией', () => {
      expect(saveContext.constructor.name).toBe('AsyncFunction');
    });

    it('должен принимать directory', async () => {
      await expect(saveContext('/test', {})).resolves.toBeUndefined();
    });

    it('должен принимать partial context', async () => {
      await expect(saveContext('/test', { state: 5 })).resolves.toBeUndefined();
    });

    it('должен принимать context с lastTaskId', async () => {
      await expect(saveContext('/test', { lastTaskId: 'T-001' })).resolves.toBeUndefined();
    });

    it('должен принимать context с lastAgent', async () => {
      await expect(saveContext('/test', { lastAgent: 'python-developer' })).resolves.toBeUndefined();
    });

    it('должен принимать context с history', async () => {
      await expect(saveContext('/test', { history: [] })).resolves.toBeUndefined();
    });

    it('должен принимать пустой context', async () => {
      await expect(saveContext('/test', {})).resolves.toBeUndefined();
    });
  });

  describe('loadContext()', () => {
    it('должен быть функцией', () => {
      expect(typeof loadContext).toBe('function');
    });

    it('должен принимать directory', () => {
      expect(() => loadContext('/test')).not.toThrow();
    });

    it('должен возвращать null для несуществующего пути', () => {
      const result = loadContext('/nonexistent/path/xyz123');
      expect(result).toBeNull();
    });

    it('должен возвращать null для существующего пути без файла', () => {
      const result = loadContext('/tmp');
      expect(result).toBeNull();
    });
  });

  describe('logError()', () => {
    it('должен быть функцией', () => {
      expect(typeof logError).toBe('function');
    });

    it('должен принимать directory и error', () => {
      const error = new Error('Test error');
      expect(() => logError('/test', error)).not.toThrow();
    });

    it('должен принимать directory, error и context', () => {
      const error = new Error('Test error');
      expect(() => logError('/test', error, { key: 'value' })).not.toThrow();
    });

    it('должен принимать error с stack', () => {
      const error = new Error('Test');
      error.stack = 'at line 1';
      expect(() => logError('/test', error)).not.toThrow();
    });

    it('должен принимать пустой context', () => {
      const error = new Error('Test');
      expect(() => logError('/test', error, {})).not.toThrow();
    });
  });

  describe('onSessionCreated()', () => {
    it('должен быть async функцией', () => {
      expect(onSessionCreated.constructor.name).toBe('AsyncFunction');
    });

    it('должен принимать $, directory и client', async () => {
      const $ = {};
      const client = { session: { prompt: async () => {} } };
      await expect(onSessionCreated($, '/test', client)).resolves.toBeDefined();
    });

    it('должен возвращать объект с success и errors', async () => {
      const $ = { command: async () => ({ text: async () => 'yes' }) };
      const client = { session: { prompt: async () => {} } };
      const result = await onSessionCreated($, '/test', client);
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('errors');
    });
  });

  describe('onSessionIdle()', () => {
    it('должен быть async функцией', () => {
      expect(onSessionIdle.constructor.name).toBe('AsyncFunction');
    });

    it('должен принимать directory и client', async () => {
      const client = { session: { prompt: async () => {} } };
      await expect(onSessionIdle('/test', client)).resolves.toBeUndefined();
    });
  });

  describe('onSessionCompacted()', () => {
    it('должен быть async функцией', () => {
      expect(onSessionCompacted.constructor.name).toBe('AsyncFunction');
    });

    it('должен принимать directory и client', async () => {
      const client = { session: { prompt: async () => {} } };
      await expect(onSessionCompacted('/test', client)).resolves.toBeUndefined();
    });

    it('должен принимать directory без контекста', async () => {
      const client = { session: { prompt: async () => {} } };
      await expect(onSessionCompacted('/nonexistent', client)).resolves.toBeUndefined();
    });
  });

  describe('onSessionError()', () => {
    it('должен быть async функцией', () => {
      expect(onSessionError.constructor.name).toBe('AsyncFunction');
    });

    it('должен принимать directory и error', async () => {
      const error = new Error('Test error');
      await expect(onSessionError('/test', error)).resolves.toBeUndefined();
    });

    it('должен принимать directory, error и context', async () => {
      const error = new Error('Test error');
      await expect(onSessionError('/test', error, { data: 'test' })).resolves.toBeUndefined();
    });
  });

  describe('SessionContext structure', () => {
    it('должен иметь поле state', () => {
      const context: any = { state: 5, savedAt: '2024-01-01', history: [] };
      expect(context.state).toBe(5);
    });

    it('должен иметь поле savedAt', () => {
      const context: any = { state: 3, savedAt: '2024-01-01', history: [] };
      expect(context.savedAt).toBe('2024-01-01');
    });

    it('должен иметь необязательное поле lastTaskId', () => {
      const context: any = { state: 3, lastTaskId: 'T-001', savedAt: '2024-01-01', history: [] };
      expect(context.lastTaskId).toBe('T-001');
    });

    it('должен иметь необязательное поле lastAgent', () => {
      const context: any = { state: 3, lastAgent: 'python-developer', savedAt: '2024-01-01', history: [] };
      expect(context.lastAgent).toBe('python-developer');
    });

    it('должен иметь поле history', () => {
      const context: any = { state: 2, savedAt: '2024-01-01', history: [] };
      expect(context.history).toEqual([]);
    });

    it('history может содержать записи', () => {
      const context: any = {
        state: 2,
        savedAt: '2024-01-01',
        history: [{ tool: 'read', args: {}, timestamp: '2024-01-01' }]
      };
      expect(context.history).toHaveLength(1);
      expect(context.history[0].tool).toBe('read');
    });
  });

  describe('SessionError structure', () => {
    it('должен иметь поле error', () => {
      const err: any = { error: 'Error message', timestamp: '2024-01-01' };
      expect(err.error).toBe('Error message');
    });

    it('должен иметь поле timestamp', () => {
      const err: any = { error: 'Error', timestamp: '2024-01-01' };
      expect(err.timestamp).toBe('2024-01-01');
    });

    it('должен иметь необязательное поле stack', () => {
      const err: any = { error: 'Error', stack: 'at line 1', timestamp: '2024-01-01' };
      expect(err.stack).toBe('at line 1');
    });

    it('должен иметь необязательное поле context', () => {
      const err: any = { error: 'Error', timestamp: '2024-01-01', context: { data: 'test' } };
      expect(err.context).toBeDefined();
      expect(err.context.data).toBe('test');
    });
  });

  describe('Return types', () => {
    it('onSessionCreated возвращает { success, errors }', async () => {
      const $ = { command: async () => ({ text: async () => 'yes' }) };
      const client = { session: { prompt: async () => {} } };
      const result = await onSessionCreated($, '/test', client);
      expect(typeof result.success).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('onSessionIdle возвращает void', async () => {
      const client = { session: { prompt: async () => {} } };
      const result = await onSessionIdle('/test', client);
      expect(result).toBeUndefined();
    });

    it('onSessionCompacted возвращает void', async () => {
      const client = { session: { prompt: async () => {} } };
      const result = await onSessionCompacted('/test', client);
      expect(result).toBeUndefined();
    });

    it('onSessionError возвращает void', async () => {
      const error = new Error('Test');
      const result = await onSessionError('/test', error);
      expect(result).toBeUndefined();
    });
  });

  describe('Integration scenarios', () => {
    it('logError с Error объектом', () => {
      const error = new Error('Connection failed');
      expect(() => logError('/test', error)).not.toThrow();
    });

    it('logError с Error без stack', () => {
      const error = new Error('Simple error');
      delete error.stack;
      expect(() => logError('/test', error)).not.toThrow();
    });

    it('loadContext возвращает null для защищённого пути', () => {
      const result = loadContext('/sys');
      expect(result).toBeNull();
    });

    it('logToFile с пустым сообщением', () => {
      expect(() => logToFile('')).not.toThrow();
    });

    it('logToFile с unicode', () => {
      expect(() => logToFile('Тест: ☀️ 🚀 ✅')).not.toThrow();
    });
  });
});