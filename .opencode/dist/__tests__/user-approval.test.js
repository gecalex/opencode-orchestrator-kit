"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Tests for user-approval.ts
const user_approval_1 = require("../user-approval");
describe('User Approval Module', () => {
    describe('formatApprovalRequest()', () => {
        it('должен форматировать базовый запрос', () => {
            const request = {
                title: 'Test Title',
                message: 'Test message',
                actions: ['Action 1', 'Action 2']
            };
            const output = (0, user_approval_1.formatApprovalRequest)(request);
            expect(output).toContain('Test Title');
            expect(output).toContain('Test message');
            expect(output).toContain('1. Action 1');
            expect(output).toContain('2. Action 2');
        });
        it('должен включать действие по умолчанию', () => {
            const request = {
                title: 'Title',
                message: 'Message',
                actions: ['Yes', 'No'],
                defaultAction: 'Yes'
            };
            const output = (0, user_approval_1.formatApprovalRequest)(request);
            expect(output).toContain('По умолчанию: Yes');
        });
        it('должен не включать defaultAction когда не передан', () => {
            const request = {
                title: 'Title',
                message: 'Message',
                actions: ['Yes', 'No']
            };
            const output = (0, user_approval_1.formatApprovalRequest)(request);
            expect(output).not.toContain('По умолчанию');
        });
        it('должен указывать формат ответа', () => {
            const request = {
                title: 'Title',
                message: 'Message',
                actions: ['Action']
            };
            const output = (0, user_approval_1.formatApprovalRequest)(request);
            expect(output).toContain('Ответьте номером');
        });
    });
    describe('suggestNextStep()', () => {
        it('должен формировать следующий шаг', () => {
            const output = (0, user_approval_1.suggestNextStep)('phase1', 'python-developer', 'test task');
            expect(output).toContain('phase1');
            expect(output).toContain('python-developer');
            expect(output).toContain('test task');
        });
        it('должен содержать инструкцию task', () => {
            const output = (0, user_approval_1.suggestNextStep)('init', 'ts-specialist', 'write tests');
            expect(output).toContain('subagent_type');
            expect(output).toContain('ts-specialist');
        });
        it('должен запрашивать подтверждение', () => {
            const output = (0, user_approval_1.suggestNextStep)('test', 'agent', 'task');
            expect(output).toContain('Продолжить?');
        });
        it('должен содержать эмодзиcheckmark', () => {
            const output = (0, user_approval_1.suggestNextStep)('phase', 'agent', 'task');
            expect(output).toContain('✅');
        });
    });
    describe('requestAgentConfirmation()', () => {
        it('должен запрашивать подтверждение агента', () => {
            const output = (0, user_approval_1.requestAgentConfirmation)('python-developer', 'write tests');
            expect(output).toContain('python-developer');
            expect(output).toContain('write tests');
        });
        it('должен содержать вопрос да/нет', () => {
            const output = (0, user_approval_1.requestAgentConfirmation)('agent', 'task');
            expect(output).toContain('да/нет');
        });
    });
    describe('formatSelectionPrompt()', () => {
        it('должен форматировать выбор из списка', () => {
            const output = (0, user_approval_1.formatSelectionPrompt)('Choose option', ['A', 'B', 'C']);
            expect(output).toContain('Choose option');
            expect(output).toContain('1. A');
            expect(output).toContain('2. B');
            expect(output).toContain('3. C');
        });
        it('должен запрашивать ввод номера', () => {
            const output = (0, user_approval_1.formatSelectionPrompt)('Title', ['Option']);
            expect(output).toContain('введите номер');
        });
    });
    describe('parseYesNoResponse()', () => {
        it('должен парсить "да"', () => {
            expect((0, user_approval_1.parseYesNoResponse)('да')).toBe(true);
            expect((0, user_approval_1.parseYesNoResponse)('Да')).toBe(true);
            expect((0, user_approval_1.parseYesNoResponse)('ДА')).toBe(true);
        });
        it('должен парсить "yes"', () => {
            expect((0, user_approval_1.parseYesNoResponse)('yes')).toBe(true);
            expect((0, user_approval_1.parseYesNoResponse)('Yes')).toBe(true);
            expect((0, user_approval_1.parseYesNoResponse)('YES')).toBe(true);
        });
        it('должен парсить "y"', () => {
            expect((0, user_approval_1.parseYesNoResponse)('y')).toBe(true);
            expect((0, user_approval_1.parseYesNoResponse)('Y')).toBe(true);
        });
        it('должен парсить "1"', () => {
            expect((0, user_approval_1.parseYesNoResponse)('1')).toBe(true);
        });
        it('должен парсить "true"', () => {
            expect((0, user_approval_1.parseYesNoResponse)('true')).toBe(true);
            expect((0, user_approval_1.parseYesNoResponse)('True')).toBe(true);
        });
        it('должен парсить "нет"', () => {
            expect((0, user_approval_1.parseYesNoResponse)('нет')).toBe(false);
            expect((0, user_approval_1.parseYesNoResponse)('Нет')).toBe(false);
        });
        it('должен парсить "no"', () => {
            expect((0, user_approval_1.parseYesNoResponse)('no')).toBe(false);
        });
        it('должен парсить "n"', () => {
            expect((0, user_approval_1.parseYesNoResponse)('n')).toBe(false);
        });
        it('должен парсить "0"', () => {
            expect((0, user_approval_1.parseYesNoResponse)('0')).toBe(false);
        });
        it('должен парсить "false"', () => {
            expect((0, user_approval_1.parseYesNoResponse)('false')).toBe(false);
        });
        it('должен возвращать null для неверного ответа', () => {
            expect((0, user_approval_1.parseYesNoResponse)('maybe')).toBe(null);
            expect((0, user_approval_1.parseYesNoResponse)('abc')).toBe(null);
            expect((0, user_approval_1.parseYesNoResponse)('')).toBe(null);
        });
        it('должен триммить пробелы', () => {
            expect((0, user_approval_1.parseYesNoResponse)('  да  ')).toBe(true);
            expect((0, user_approval_1.parseYesNoResponse)('  нет  ')).toBe(false);
        });
    });
    describe('parseSelection()', () => {
        it('должен парсить валидный выбор', () => {
            expect((0, user_approval_1.parseSelection)('1', 3)).toBe(0);
            expect((0, user_approval_1.parseSelection)('2', 3)).toBe(1);
            expect((0, user_approval_1.parseSelection)('3', 3)).toBe(2);
        });
        it('должен возвращать null для чисел вне диапазона', () => {
            expect((0, user_approval_1.parseSelection)('0', 3)).toBe(null);
            expect((0, user_approval_1.parseSelection)('4', 3)).toBe(null);
        });
        it('должен возвращать null для нечислового ввода', () => {
            expect((0, user_approval_1.parseSelection)('abc', 3)).toBe(null);
            expect((0, user_approval_1.parseSelection)('', 3)).toBe(null);
        });
        it('должен триммить пробелы', () => {
            expect((0, user_approval_1.parseSelection)('  1  ', 3)).toBe(0);
        });
        it('должен конвертировать в 0-based индекс', () => {
            expect((0, user_approval_1.parseSelection)('1', 5)).toBe(0);
            expect((0, user_approval_1.parseSelection)('5', 5)).toBe(4);
        });
    });
    describe('userApproval default export', () => {
        it('должен экспортировать все функции', () => {
            expect(user_approval_1.userApproval.formatApprovalRequest).toBeDefined();
            expect(user_approval_1.userApproval.suggestNextStep).toBeDefined();
            expect(user_approval_1.userApproval.requestAgentConfirmation).toBeDefined();
            expect(user_approval_1.userApproval.formatSelectionPrompt).toBeDefined();
            expect(user_approval_1.userApproval.parseYesNoResponse).toBeDefined();
            expect(user_approval_1.userApproval.parseSelection).toBeDefined();
        });
        it('должен использовать правильные функции', () => {
            expect(user_approval_1.userApproval.parseYesNoResponse('да')).toBe(true);
            expect(user_approval_1.userApproval.parseSelection('1', 3)).toBe(0);
        });
    });
    describe('ApprovalRequest interface', () => {
        it('должен иметь правильную структуру', () => {
            const request = {
                title: 'Title',
                message: 'Message',
                actions: ['A', 'B'],
                defaultAction: 'A'
            };
            expect(request.title).toBe('Title');
            expect(request.message).toBe('Message');
            expect(request.actions).toHaveLength(2);
            expect(request.defaultAction).toBe('A');
        });
    });
});
