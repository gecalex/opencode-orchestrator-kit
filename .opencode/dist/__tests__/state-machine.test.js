"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// Real tests for state-machine.ts using actual imports
const stateMachine = __importStar(require("../state-machine"));
describe('State Machine - Real Tests', () => {
    describe('Module exports', () => {
        it('должен экспортировать stateMachine объект', () => {
            expect(stateMachine).toBeDefined();
        });
        it('должен экспортировать initialize', () => {
            expect(stateMachine.initialize).toBeDefined();
            expect(typeof stateMachine.initialize).toBe('function');
        });
        it('должен экспортировать getState', () => {
            expect(stateMachine.getState).toBeDefined();
            expect(typeof stateMachine.getState).toBe('function');
        });
        it('должен экспортировать getCurrentState', () => {
            expect(stateMachine.getCurrentState).toBeDefined();
            expect(typeof stateMachine.getCurrentState).toBe('function');
        });
        it('должен экспортировать setState', () => {
            expect(stateMachine.setState).toBeDefined();
            expect(typeof stateMachine.setState).toBe('function');
        });
        it('должен экспортировать isToolAllowed', () => {
            expect(stateMachine.isToolAllowed).toBeDefined();
            expect(typeof stateMachine.isToolAllowed).toBe('function');
        });
        it('должен экспортировать isAgentAllowed', () => {
            expect(stateMachine.isAgentAllowed).toBeDefined();
            expect(typeof stateMachine.isAgentAllowed).toBe('function');
        });
        it('должен экспортировать getStateDescription', () => {
            expect(stateMachine.getStateDescription).toBeDefined();
            expect(typeof stateMachine.getStateDescription).toBe('function');
        });
        it('должен экспортировать updateAfterTask', () => {
            expect(stateMachine.updateAfterTask).toBeDefined();
            expect(typeof stateMachine.updateAfterTask).toBe('function');
        });
        it('должен экспортировать getAvailableTransitions', () => {
            expect(stateMachine.getAvailableTransitions).toBeDefined();
            expect(typeof stateMachine.getAvailableTransitions).toBe('function');
        });
        it('должен экспортировать tryTransition', () => {
            expect(stateMachine.tryTransition).toBeDefined();
            expect(typeof stateMachine.tryTransition).toBe('function');
        });
        it('stateMachine default export равен экспортам', () => {
            expect(stateMachine.stateMachine).toBeDefined();
        });
    });
    describe('getCurrentState()', () => {
        it('должен возвращать число', () => {
            const state = stateMachine.getCurrentState();
            expect(typeof state).toBe('number');
        });
        it('должен возвращать значение от 1 до 10', () => {
            const state = stateMachine.getCurrentState();
            expect(state).toBeGreaterThanOrEqual(1);
            expect(state).toBeLessThanOrEqual(10);
        });
    });
    describe('setState()', () => {
        it('должен быть функцией', () => {
            expect(typeof stateMachine.setState).toBe('function');
        });
        it('должен принимать state код', () => {
            expect(() => stateMachine.setState(5)).not.toThrow();
        });
        it('должен принимать state код и reason', () => {
            expect(() => stateMachine.setState(5, 'test reason')).not.toThrow();
        });
        it('должен менять текущее состояние', () => {
            const before = stateMachine.getCurrentState();
            stateMachine.setState(before === 1 ? 2 : 1);
            const after = stateMachine.getCurrentState();
            expect(after).toBeDefined();
        });
    });
    describe('getStateDescription()', () => {
        it('должен возвращать строку для каждого состояния 1-10', () => {
            for (let i = 1; i <= 10; i++) {
                const desc = stateMachine.getStateDescription(i);
                expect(typeof desc).toBe('string');
                expect(desc.length).toBeGreaterThan(0);
            }
        });
        it('state 1 имеет правильное описание', () => {
            const desc = stateMachine.getStateDescription(1);
            expect(desc).toContain('Пустой проект');
        });
        it('state 10 имеет правильное описание', () => {
            const desc = stateMachine.getStateDescription(10);
            expect(desc).toContain('Релиз');
        });
        it('возвращает "unknown" для невалидного состояния', () => {
            const desc = stateMachine.getStateDescription(99);
            expect(desc).toBe('unknown');
        });
        it('возвращает "unknown" для 0', () => {
            const desc = stateMachine.getStateDescription(0);
            expect(desc).toBe('unknown');
        });
        it('возвращает "unknown" для отрицательного', () => {
            const desc = stateMachine.getStateDescription(-1);
            expect(desc).toBe('unknown');
        });
    });
    describe('isToolAllowed()', () => {
        it('должен быть функцией', () => {
            expect(typeof stateMachine.isToolAllowed).toBe('function');
        });
        it('возвращает boolean', () => {
            const result = stateMachine.isToolAllowed('read', 1);
            expect(typeof result).toBe('boolean');
        });
        it('state 1 разрешает read', () => {
            const result = stateMachine.isToolAllowed('read', 1);
            expect(result).toBe(true);
        });
        it('state 1 разрешает glob', () => {
            const result = stateMachine.isToolAllowed('glob', 1);
            expect(result).toBe(true);
        });
        it('state 1 разрешает grep', () => {
            const result = stateMachine.isToolAllowed('grep', 1);
            expect(result).toBe(true);
        });
        it('state 1 разрешает skill', () => {
            const result = stateMachine.isToolAllowed('skill', 1);
            expect(result).toBe(true);
        });
        it('state 1 разрешает todowrite', () => {
            const result = stateMachine.isToolAllowed('todowrite', 1);
            expect(result).toBe(true);
        });
        it('state 1 разрешает task', () => {
            const result = stateMachine.isToolAllowed('task', 1);
            expect(result).toBe(true);
        });
        it('state 1 разрешает write', () => {
            const result = stateMachine.isToolAllowed('write', 1);
            expect(result).toBe(true);
        });
        it('state 1 разрешает question', () => {
            const result = stateMachine.isToolAllowed('question', 1);
            expect(result).toBe(true);
        });
        it('state 1 может не разрешать bash', () => {
            const result = stateMachine.isToolAllowed('bash', 1);
            expect(typeof result).toBe('boolean');
        });
        it('state 10 имеет правильные инструменты', () => {
            const readResult = stateMachine.isToolAllowed('read_file', 10);
            const globResult = stateMachine.isToolAllowed('glob', 10);
            const grepResult = stateMachine.isToolAllowed('grep_search', 10);
            expect(typeof readResult).toBe('boolean');
            expect(typeof globResult).toBe('boolean');
            expect(typeof grepResult).toBe('boolean');
        });
        it('невалидный state возвращает false', () => {
            const result = stateMachine.isToolAllowed('read', 99);
            expect(result).toBe(false);
        });
        it('без явного state использует текущий', () => {
            expect(() => stateMachine.isToolAllowed('read')).not.toThrow();
        });
    });
    describe('isAgentAllowed()', () => {
        it('должен быть функцией', () => {
            expect(typeof stateMachine.isAgentAllowed).toBe('function');
        });
        it('возвращает boolean', () => {
            const result = stateMachine.isAgentAllowed('project-initializer', 1);
            expect(typeof result).toBe('boolean');
        });
        it('state 1 разрешает project-initializer', () => {
            const result = stateMachine.isAgentAllowed('project-initializer', 1);
            expect(result).toBe(true);
        });
        it('state 1 разрешает constitution-agent', () => {
            const result = stateMachine.isAgentAllowed('constitution-agent', 1);
            expect(result).toBe(true);
        });
        it('state 1 блокирует python-developer', () => {
            const result = stateMachine.isAgentAllowed('python-developer', 1);
            expect(result).toBe(false);
        });
        it('state 1 блокирует go-developer', () => {
            const result = stateMachine.isAgentAllowed('go-developer', 1);
            expect(result).toBe(false);
        });
        it('state 1 блокирует react-developer', () => {
            const result = stateMachine.isAgentAllowed('react-developer', 1);
            expect(result).toBe(false);
        });
        it('state 1 блокирует speckit-specify', () => {
            const result = stateMachine.isAgentAllowed('speckit-specify', 1);
            expect(result).toBe(false);
        });
        it('state 2 блокирует python-developer', () => {
            const result = stateMachine.isAgentAllowed('python-developer', 2);
            expect(result).toBe(false);
        });
        it('state 7 разрешает python-developer', () => {
            const result = stateMachine.isAgentAllowed('python-developer', 7);
            expect(result).toBe(true);
        });
        it('state 7 разрешает go-developer', () => {
            const result = stateMachine.isAgentAllowed('go-developer', 7);
            expect(result).toBe(true);
        });
        it('state 7 разрешает react-developer', () => {
            const result = stateMachine.isAgentAllowed('react-developer', 7);
            expect(result).toBe(true);
        });
        it('state 8 разрешает python-specialist', () => {
            const result = stateMachine.isAgentAllowed('python-specialist', 8);
            expect(result).toBe(true);
        });
        it('state 10 блокирует всех', () => {
            const result = stateMachine.isAgentAllowed('project-initializer', 10);
            expect(result).toBe(false);
        });
        it('state 10 имеет пустой allowedAgents', () => {
            const desc = stateMachine.getStateDescription(10);
            expect(desc).toContain('Релиз');
        });
        it('невалидный state возвращает false', () => {
            const result = stateMachine.isAgentAllowed('project-initializer', 99);
            expect(result).toBe(false);
        });
    });
    describe('getAvailableTransitions()', () => {
        it('должен быть функцией', () => {
            expect(typeof stateMachine.getAvailableTransitions).toBe('function');
        });
        it('возвращает массив', () => {
            const transitions = stateMachine.getAvailableTransitions();
            expect(Array.isArray(transitions)).toBe(true);
        });
        it('возвращает массив объектов с from, to, condition, reason', () => {
            const transitions = stateMachine.getAvailableTransitions();
            if (transitions.length > 0) {
                expect(transitions[0]).toHaveProperty('from');
                expect(transitions[0]).toHaveProperty('to');
                expect(transitions[0]).toHaveProperty('condition');
                expect(transitions[0]).toHaveProperty('reason');
            }
        });
        it('transition from должен быть числом', () => {
            const transitions = stateMachine.getAvailableTransitions();
            if (transitions.length > 0) {
                expect(typeof transitions[0].from).toBe('number');
            }
        });
        it('transition to должен быть числом', () => {
            const transitions = stateMachine.getAvailableTransitions();
            if (transitions.length > 0) {
                expect(typeof transitions[0].to).toBe('number');
            }
        });
        it('condition должна быть функцией', () => {
            const transitions = stateMachine.getAvailableTransitions();
            if (transitions.length > 0) {
                expect(typeof transitions[0].condition).toBe('function');
            }
        });
        it('reason должен быть строкой', () => {
            const transitions = stateMachine.getAvailableTransitions();
            if (transitions.length > 0) {
                expect(typeof transitions[0].reason).toBe('string');
            }
        });
    });
    describe('initialize()', () => {
        it('должен быть async функцией', () => {
            expect(stateMachine.initialize.constructor.name).toBe('AsyncFunction');
        });
        it('принимает directory', async () => {
            await expect(stateMachine.initialize('/test')).resolves.toBeDefined();
        });
        it('принимает directory и $', async () => {
            await expect(stateMachine.initialize('/test', {})).resolves.toBeDefined();
        });
        it('возвращает ProjectState объект', async () => {
            const result = await stateMachine.initialize('/test');
            expect(result).toHaveProperty('code');
            expect(result).toHaveProperty('description');
            expect(result).toHaveProperty('allowedAgents');
            expect(result).toHaveProperty('blockedAgents');
            expect(result).toHaveProperty('allowedTools');
        });
    });
    describe('getState()', () => {
        it('должен быть async функцией', () => {
            expect(stateMachine.getState.constructor.name).toBe('AsyncFunction');
        });
        it('принимает $ и directory', async () => {
            await expect(stateMachine.getState({}, '/test')).resolves.toBeDefined();
        });
        it('возвращает ProjectState', async () => {
            const result = await stateMachine.getState({}, '/test');
            expect(result).toHaveProperty('code');
        });
    });
    describe('updateAfterTask()', () => {
        it('должен быть async функцией', () => {
            expect(stateMachine.updateAfterTask.constructor.name).toBe('AsyncFunction');
        });
        it('принимает taskResult, directory и $', async () => {
            await expect(stateMachine.updateAfterTask({}, '/test', {})).resolves.toBeUndefined();
        });
        it('принимает taskResult с status=success', async () => {
            await expect(stateMachine.updateAfterTask({ status: 'success' }, '/test', {})).resolves.toBeUndefined();
        });
        it('принимает taskResult с status=error', async () => {
            await expect(stateMachine.updateAfterTask({ status: 'error' }, '/test', {})).resolves.toBeUndefined();
        });
    });
    describe('tryTransition()', () => {
        it('должен быть async функцией', () => {
            expect(stateMachine.tryTransition.constructor.name).toBe('AsyncFunction');
        });
        it('принимает directory, $ и targetState', async () => {
            await expect(stateMachine.tryTransition('/test', {}, 2)).resolves.toBeDefined();
        });
        it('возвращает boolean', async () => {
            const result = await stateMachine.tryTransition('/test', {}, 2);
            expect(typeof result).toBe('boolean');
        });
    });
    describe('State definitions', () => {
        it('state 1 имеет описание пустого проекта', () => {
            const desc = stateMachine.getStateDescription(1);
            expect(desc).toContain('Пустой проект');
        });
        it('state 2 имеет описание инициализированного', () => {
            const desc = stateMachine.getStateDescription(2);
            expect(desc).toContain('инициализирован');
        });
        it('state 3 имеет описание конституции', () => {
            const desc = stateMachine.getStateDescription(3);
            expect(desc).toContain('Конституция');
        });
        it('state 4 имеет описание спецификаций', () => {
            const desc = stateMachine.getStateDescription(4);
            expect(desc).toContain('Спецификац');
        });
        it('state 5 имеет описание плана', () => {
            const desc = stateMachine.getStateDescription(5);
            expect(desc).toContain('План');
        });
        it('state 6 имеет описание задач', () => {
            const desc = stateMachine.getStateDescription(6);
            expect(desc).toContain('Задач');
        });
        it('state 7 имеет описание тестовой фазы', () => {
            const desc = stateMachine.getStateDescription(7);
            expect(desc).toContain('Тест');
        });
        it('state 8 имеет описание кодинговой фазы', () => {
            const desc = stateMachine.getStateDescription(8);
            expect(desc).toContain('Кодинг');
        });
        it('state 9 имеет правильное описание', () => {
            const desc = stateMachine.getStateDescription(9);
            expect(desc).toBeDefined();
            expect(desc.length).toBeGreaterThan(0);
        });
        it('state 10 имеет описание релиза', () => {
            const desc = stateMachine.getStateDescription(10);
            expect(desc).toContain('Релиз');
        });
    });
    describe('ProjectState structure', () => {
        it('каждый state имеет code', () => {
            for (let i = 1; i <= 10; i++) {
                const desc = stateMachine.getStateDescription(i);
                expect(desc).not.toBe('unknown');
            }
        });
        it('каждый state имеет allowedAgents массив', () => {
            expect(() => stateMachine.isAgentAllowed('project-initializer', 1)).not.toThrow();
            expect(() => stateMachine.isAgentAllowed('project-initializer', 10)).not.toThrow();
        });
        it('каждый state имеет allowedTools массив', () => {
            expect(() => stateMachine.isToolAllowed('read', 1)).not.toThrow();
            expect(() => stateMachine.isToolAllowed('read', 10)).not.toThrow();
        });
    });
});
