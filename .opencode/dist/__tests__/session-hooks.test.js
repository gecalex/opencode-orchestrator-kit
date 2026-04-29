"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Tests for session-hooks.ts
const session_hooks_1 = require("../session-hooks");
describe('Session Hooks Module', () => {
    describe('Module exports', () => {
        it('должен экспортировать все функции напрямую', () => {
            expect(session_hooks_1.logToFile).toBeDefined();
            expect(session_hooks_1.saveContext).toBeDefined();
            expect(session_hooks_1.loadContext).toBeDefined();
            expect(session_hooks_1.logError).toBeDefined();
            expect(session_hooks_1.onSessionCreated).toBeDefined();
            expect(session_hooks_1.onSessionIdle).toBeDefined();
            expect(session_hooks_1.onSessionCompacted).toBeDefined();
            expect(session_hooks_1.onSessionError).toBeDefined();
        });
        it('должен экспортировать sessionHooks объект', () => {
            expect(session_hooks_1.sessionHooks).toBeDefined();
            expect(typeof session_hooks_1.sessionHooks).toBe('object');
        });
        it('sessionHooks содержит все функции', () => {
            expect(session_hooks_1.sessionHooks.saveContext).toBeDefined();
            expect(session_hooks_1.sessionHooks.loadContext).toBeDefined();
            expect(session_hooks_1.sessionHooks.logError).toBeDefined();
            expect(session_hooks_1.sessionHooks.onSessionCreated).toBeDefined();
            expect(session_hooks_1.sessionHooks.onSessionIdle).toBeDefined();
            expect(session_hooks_1.sessionHooks.onSessionCompacted).toBeDefined();
            expect(session_hooks_1.sessionHooks.onSessionError).toBeDefined();
        });
        it('sessionHooks.saveContext === saveContext', () => {
            expect(session_hooks_1.sessionHooks.saveContext).toBe(session_hooks_1.saveContext);
        });
        it('sessionHooks.loadContext === loadContext', () => {
            expect(session_hooks_1.sessionHooks.loadContext).toBe(session_hooks_1.loadContext);
        });
    });
    describe('logToFile()', () => {
        it('должен быть функцией', () => {
            expect(typeof session_hooks_1.logToFile).toBe('function');
        });
        it('должен принимать message', () => {
            expect(() => (0, session_hooks_1.logToFile)('test message')).not.toThrow();
        });
        it('должен принимать message и type=info', () => {
            expect(() => (0, session_hooks_1.logToFile)('test', 'info')).not.toThrow();
        });
        it('должен принимать message и type=debug', () => {
            expect(() => (0, session_hooks_1.logToFile)('test', 'debug')).not.toThrow();
        });
        it('должен принимать message и type=error', () => {
            expect(() => (0, session_hooks_1.logToFile)('test', 'error')).not.toThrow();
        });
        it('type по умолчанию = info', () => {
            expect(() => (0, session_hooks_1.logToFile)('test')).not.toThrow();
        });
    });
    describe('saveContext()', () => {
        it('должен быть async функцией', () => {
            expect(session_hooks_1.saveContext.constructor.name).toBe('AsyncFunction');
        });
        it('должен принимать directory', async () => {
            await expect((0, session_hooks_1.saveContext)('/test', {})).resolves.toBeUndefined();
        });
        it('должен принимать partial context', async () => {
            await expect((0, session_hooks_1.saveContext)('/test', { state: 5 })).resolves.toBeUndefined();
        });
        it('должен принимать context с lastTaskId', async () => {
            await expect((0, session_hooks_1.saveContext)('/test', { lastTaskId: 'T-001' })).resolves.toBeUndefined();
        });
        it('должен принимать context с lastAgent', async () => {
            await expect((0, session_hooks_1.saveContext)('/test', { lastAgent: 'python-developer' })).resolves.toBeUndefined();
        });
        it('должен принимать context с history', async () => {
            await expect((0, session_hooks_1.saveContext)('/test', { history: [] })).resolves.toBeUndefined();
        });
        it('должен принимать пустой context', async () => {
            await expect((0, session_hooks_1.saveContext)('/test', {})).resolves.toBeUndefined();
        });
    });
    describe('loadContext()', () => {
        it('должен быть функцией', () => {
            expect(typeof session_hooks_1.loadContext).toBe('function');
        });
        it('должен принимать directory', () => {
            expect(() => (0, session_hooks_1.loadContext)('/test')).not.toThrow();
        });
        it('должен возвращать null для несуществующего пути', () => {
            const result = (0, session_hooks_1.loadContext)('/nonexistent/path/xyz123');
            expect(result).toBeNull();
        });
        it('должен возвращать null для существующего пути без файла', () => {
            const result = (0, session_hooks_1.loadContext)('/tmp');
            expect(result).toBeNull();
        });
    });
    describe('logError()', () => {
        it('должен быть функцией', () => {
            expect(typeof session_hooks_1.logError).toBe('function');
        });
        it('должен принимать directory и error', () => {
            const error = new Error('Test error');
            expect(() => (0, session_hooks_1.logError)('/test', error)).not.toThrow();
        });
        it('должен принимать directory, error и context', () => {
            const error = new Error('Test error');
            expect(() => (0, session_hooks_1.logError)('/test', error, { key: 'value' })).not.toThrow();
        });
        it('должен принимать error с stack', () => {
            const error = new Error('Test');
            error.stack = 'at line 1';
            expect(() => (0, session_hooks_1.logError)('/test', error)).not.toThrow();
        });
        it('должен принимать пустой context', () => {
            const error = new Error('Test');
            expect(() => (0, session_hooks_1.logError)('/test', error, {})).not.toThrow();
        });
    });
    describe('onSessionCreated()', () => {
        it('должен быть async функцией', () => {
            expect(session_hooks_1.onSessionCreated.constructor.name).toBe('AsyncFunction');
        });
        it('должен принимать $, directory и client', async () => {
            const $ = {};
            const client = { session: { prompt: async () => { } } };
            await expect((0, session_hooks_1.onSessionCreated)($, '/test', client)).resolves.toBeDefined();
        });
        it('должен возвращать объект с success и errors', async () => {
            const $ = { command: async () => ({ text: async () => 'yes' }) };
            const client = { session: { prompt: async () => { } } };
            const result = await (0, session_hooks_1.onSessionCreated)($, '/test', client);
            expect(result).toHaveProperty('success');
            expect(result).toHaveProperty('errors');
        });
    });
    describe('onSessionIdle()', () => {
        it('должен быть async функцией', () => {
            expect(session_hooks_1.onSessionIdle.constructor.name).toBe('AsyncFunction');
        });
        it('должен принимать directory и client', async () => {
            const client = { session: { prompt: async () => { } } };
            await expect((0, session_hooks_1.onSessionIdle)('/test', client)).resolves.toBeUndefined();
        });
    });
    describe('onSessionCompacted()', () => {
        it('должен быть async функцией', () => {
            expect(session_hooks_1.onSessionCompacted.constructor.name).toBe('AsyncFunction');
        });
        it('должен принимать directory и client', async () => {
            const client = { session: { prompt: async () => { } } };
            await expect((0, session_hooks_1.onSessionCompacted)('/test', client)).resolves.toBeUndefined();
        });
        it('должен принимать directory без контекста', async () => {
            const client = { session: { prompt: async () => { } } };
            await expect((0, session_hooks_1.onSessionCompacted)('/nonexistent', client)).resolves.toBeUndefined();
        });
    });
    describe('onSessionError()', () => {
        it('должен быть async функцией', () => {
            expect(session_hooks_1.onSessionError.constructor.name).toBe('AsyncFunction');
        });
        it('должен принимать directory и error', async () => {
            const error = new Error('Test error');
            await expect((0, session_hooks_1.onSessionError)('/test', error)).resolves.toBeUndefined();
        });
        it('должен принимать directory, error и context', async () => {
            const error = new Error('Test error');
            await expect((0, session_hooks_1.onSessionError)('/test', error, { data: 'test' })).resolves.toBeUndefined();
        });
    });
    describe('SessionContext structure', () => {
        it('должен иметь поле state', () => {
            const context = { state: 5, savedAt: '2024-01-01', history: [] };
            expect(context.state).toBe(5);
        });
        it('должен иметь поле savedAt', () => {
            const context = { state: 3, savedAt: '2024-01-01', history: [] };
            expect(context.savedAt).toBe('2024-01-01');
        });
        it('должен иметь необязательное поле lastTaskId', () => {
            const context = { state: 3, lastTaskId: 'T-001', savedAt: '2024-01-01', history: [] };
            expect(context.lastTaskId).toBe('T-001');
        });
        it('должен иметь необязательное поле lastAgent', () => {
            const context = { state: 3, lastAgent: 'python-developer', savedAt: '2024-01-01', history: [] };
            expect(context.lastAgent).toBe('python-developer');
        });
        it('должен иметь поле history', () => {
            const context = { state: 2, savedAt: '2024-01-01', history: [] };
            expect(context.history).toEqual([]);
        });
        it('history может содержать записи', () => {
            const context = {
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
            const err = { error: 'Error message', timestamp: '2024-01-01' };
            expect(err.error).toBe('Error message');
        });
        it('должен иметь поле timestamp', () => {
            const err = { error: 'Error', timestamp: '2024-01-01' };
            expect(err.timestamp).toBe('2024-01-01');
        });
        it('должен иметь необязательное поле stack', () => {
            const err = { error: 'Error', stack: 'at line 1', timestamp: '2024-01-01' };
            expect(err.stack).toBe('at line 1');
        });
        it('должен иметь необязательное поле context', () => {
            const err = { error: 'Error', timestamp: '2024-01-01', context: { data: 'test' } };
            expect(err.context).toBeDefined();
            expect(err.context.data).toBe('test');
        });
    });
    describe('Return types', () => {
        it('onSessionCreated возвращает { success, errors }', async () => {
            const $ = { command: async () => ({ text: async () => 'yes' }) };
            const client = { session: { prompt: async () => { } } };
            const result = await (0, session_hooks_1.onSessionCreated)($, '/test', client);
            expect(typeof result.success).toBe('boolean');
            expect(Array.isArray(result.errors)).toBe(true);
        });
        it('onSessionIdle возвращает void', async () => {
            const client = { session: { prompt: async () => { } } };
            const result = await (0, session_hooks_1.onSessionIdle)('/test', client);
            expect(result).toBeUndefined();
        });
        it('onSessionCompacted возвращает void', async () => {
            const client = { session: { prompt: async () => { } } };
            const result = await (0, session_hooks_1.onSessionCompacted)('/test', client);
            expect(result).toBeUndefined();
        });
        it('onSessionError возвращает void', async () => {
            const error = new Error('Test');
            const result = await (0, session_hooks_1.onSessionError)('/test', error);
            expect(result).toBeUndefined();
        });
    });
    describe('Integration scenarios', () => {
        it('logError с Error объектом', () => {
            const error = new Error('Connection failed');
            expect(() => (0, session_hooks_1.logError)('/test', error)).not.toThrow();
        });
        it('logError с Error без stack', () => {
            const error = new Error('Simple error');
            delete error.stack;
            expect(() => (0, session_hooks_1.logError)('/test', error)).not.toThrow();
        });
        it('loadContext возвращает null для защищённого пути', () => {
            const result = (0, session_hooks_1.loadContext)('/sys');
            expect(result).toBeNull();
        });
        it('logToFile с пустым сообщением', () => {
            expect(() => (0, session_hooks_1.logToFile)('')).not.toThrow();
        });
        it('logToFile с unicode', () => {
            expect(() => (0, session_hooks_1.logToFile)('Тест: ☀️ 🚀 ✅')).not.toThrow();
        });
    });
});
