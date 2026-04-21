// Tests for user-approval.ts
import {
  ApprovalRequest,
  formatApprovalRequest,
  suggestNextStep,
  requestAgentConfirmation,
  formatSelectionPrompt,
  parseYesNoResponse,
  parseSelection,
  userApproval
} from '../user-approval';

describe('User Approval Module', () => {
  describe('formatApprovalRequest()', () => {
    it('должен форматировать базовый запрос', () => {
      const request: ApprovalRequest = {
        title: 'Test Title',
        message: 'Test message',
        actions: ['Action 1', 'Action 2']
      };
      
      const output = formatApprovalRequest(request);
      
      expect(output).toContain('Test Title');
      expect(output).toContain('Test message');
      expect(output).toContain('1. Action 1');
      expect(output).toContain('2. Action 2');
    });

    it('должен включать действие по умолчанию', () => {
      const request: ApprovalRequest = {
        title: 'Title',
        message: 'Message',
        actions: ['Yes', 'No'],
        defaultAction: 'Yes'
      };
      
      const output = formatApprovalRequest(request);
      
      expect(output).toContain('По умолчанию: Yes');
    });

    it('должен не включать defaultAction когда не передан', () => {
      const request: ApprovalRequest = {
        title: 'Title',
        message: 'Message',
        actions: ['Yes', 'No']
      };
      
      const output = formatApprovalRequest(request);
      
      expect(output).not.toContain('По умолчанию');
    });

    it('должен указывать формат ответа', () => {
      const request: ApprovalRequest = {
        title: 'Title',
        message: 'Message',
        actions: ['Action']
      };
      
      const output = formatApprovalRequest(request);
      
      expect(output).toContain('Ответьте номером');
    });
  });

  describe('suggestNextStep()', () => {
    it('должен формировать следующий шаг', () => {
      const output = suggestNextStep('phase1', 'python-developer', 'test task');
      
      expect(output).toContain('phase1');
      expect(output).toContain('python-developer');
      expect(output).toContain('test task');
    });

    it('должен содержать инструкцию task', () => {
      const output = suggestNextStep('init', 'ts-specialist', 'write tests');
      
      expect(output).toContain('subagent_type');
      expect(output).toContain('ts-specialist');
    });

    it('должен запрашивать подтверждение', () => {
      const output = suggestNextStep('test', 'agent', 'task');
      
      expect(output).toContain('Продолжить?');
    });

    it('должен содержать эмодзиcheckmark', () => {
      const output = suggestNextStep('phase', 'agent', 'task');
      
      expect(output).toContain('✅');
    });
  });

  describe('requestAgentConfirmation()', () => {
    it('должен запрашивать подтверждение агента', () => {
      const output = requestAgentConfirmation('python-developer', 'write tests');
      
      expect(output).toContain('python-developer');
      expect(output).toContain('write tests');
    });

    it('должен содержать вопрос да/нет', () => {
      const output = requestAgentConfirmation('agent', 'task');
      
      expect(output).toContain('да/нет');
    });
  });

  describe('formatSelectionPrompt()', () => {
    it('должен форматировать выбор из списка', () => {
      const output = formatSelectionPrompt('Choose option', ['A', 'B', 'C']);
      
      expect(output).toContain('Choose option');
      expect(output).toContain('1. A');
      expect(output).toContain('2. B');
      expect(output).toContain('3. C');
    });

    it('должен запрашивать ввод номера', () => {
      const output = formatSelectionPrompt('Title', ['Option']);
      
      expect(output).toContain('введите номер');
    });
  });

  describe('parseYesNoResponse()', () => {
    it('должен парсить "да"', () => {
      expect(parseYesNoResponse('да')).toBe(true);
      expect(parseYesNoResponse('Да')).toBe(true);
      expect(parseYesNoResponse('ДА')).toBe(true);
    });

    it('должен парсить "yes"', () => {
      expect(parseYesNoResponse('yes')).toBe(true);
      expect(parseYesNoResponse('Yes')).toBe(true);
      expect(parseYesNoResponse('YES')).toBe(true);
    });

    it('должен парсить "y"', () => {
      expect(parseYesNoResponse('y')).toBe(true);
      expect(parseYesNoResponse('Y')).toBe(true);
    });

    it('должен парсить "1"', () => {
      expect(parseYesNoResponse('1')).toBe(true);
    });

    it('должен парсить "true"', () => {
      expect(parseYesNoResponse('true')).toBe(true);
      expect(parseYesNoResponse('True')).toBe(true);
    });

    it('должен парсить "нет"', () => {
      expect(parseYesNoResponse('нет')).toBe(false);
      expect(parseYesNoResponse('Нет')).toBe(false);
    });

    it('должен парсить "no"', () => {
      expect(parseYesNoResponse('no')).toBe(false);
    });

    it('должен парсить "n"', () => {
      expect(parseYesNoResponse('n')).toBe(false);
    });

    it('должен парсить "0"', () => {
      expect(parseYesNoResponse('0')).toBe(false);
    });

    it('должен парсить "false"', () => {
      expect(parseYesNoResponse('false')).toBe(false);
    });

    it('должен возвращать null для неверного ответа', () => {
      expect(parseYesNoResponse('maybe')).toBe(null);
      expect(parseYesNoResponse('abc')).toBe(null);
      expect(parseYesNoResponse('')).toBe(null);
    });

    it('должен триммить пробелы', () => {
      expect(parseYesNoResponse('  да  ')).toBe(true);
      expect(parseYesNoResponse('  нет  ')).toBe(false);
    });
  });

  describe('parseSelection()', () => {
    it('должен парсить валидный выбор', () => {
      expect(parseSelection('1', 3)).toBe(0);
      expect(parseSelection('2', 3)).toBe(1);
      expect(parseSelection('3', 3)).toBe(2);
    });

    it('должен возвращать null для чисел вне диапазона', () => {
      expect(parseSelection('0', 3)).toBe(null);
      expect(parseSelection('4', 3)).toBe(null);
    });

    it('должен возвращать null для нечислового ввода', () => {
      expect(parseSelection('abc', 3)).toBe(null);
      expect(parseSelection('', 3)).toBe(null);
    });

    it('должен триммить пробелы', () => {
      expect(parseSelection('  1  ', 3)).toBe(0);
    });

    it('должен конвертировать в 0-based индекс', () => {
      expect(parseSelection('1', 5)).toBe(0);
      expect(parseSelection('5', 5)).toBe(4);
    });
  });

  describe('userApproval default export', () => {
    it('должен экспортировать все функции', () => {
      expect(userApproval.formatApprovalRequest).toBeDefined();
      expect(userApproval.suggestNextStep).toBeDefined();
      expect(userApproval.requestAgentConfirmation).toBeDefined();
      expect(userApproval.formatSelectionPrompt).toBeDefined();
      expect(userApproval.parseYesNoResponse).toBeDefined();
      expect(userApproval.parseSelection).toBeDefined();
    });

    it('должен использовать правильные функции', () => {
      expect(userApproval.parseYesNoResponse('да')).toBe(true);
      expect(userApproval.parseSelection('1', 3)).toBe(0);
    });
  });

  describe('ApprovalRequest interface', () => {
    it('должен иметь правильную структуру', () => {
      const request: ApprovalRequest = {
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