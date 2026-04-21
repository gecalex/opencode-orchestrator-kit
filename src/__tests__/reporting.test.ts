// Tests for reporting.ts
import {
  generateReport,
  saveReport,
  getProgressDashboard,
  updateProgress,
  notifyPhaseComplete,
  getReports,
  reporting
} from '../reporting';

describe('Reporting Module', () => {
  describe('generateReport()', () => {
    it('должен генерировать отчёт', () => {
      const report = generateReport(
        'T-001',
        'python-developer',
        'Test summary',
        ['file1.ts', 'file2.ts'],
        { success: true, details: 'All tests passed' },
        ['Issue 1'],
        ['attachment1.log']
      );

      expect(report.taskId).toBe('T-001');
      expect(report.agentType).toBe('python-developer');
      expect(report.summary).toBe('Test summary');
      expect(report.changes).toHaveLength(2);
      expect(report.results.success).toBe(true);
      expect(report.issues).toHaveLength(1);
      expect(report.attachments).toHaveLength(1);
      expect(report.timestamp).toBeDefined();
    });

    it('должен использовать пустые массивы по умолчанию', () => {
      const report = generateReport(
        'T-002',
        'ts-specialist',
        'Summary',
        [],
        { success: false, details: 'Failed' }
      );

      expect(report.issues).toHaveLength(0);
      expect(report.attachments).toHaveLength(0);
    });

    it('должен генерировать timestamp', () => {
      const before = new Date().toISOString();
      const report = generateReport('T-003', 'agent', 'summary', [], { success: true, details: 'OK' });
      const after = new Date().toISOString();

      expect(report.timestamp).toBeDefined();
      expect(report.timestamp >= before).toBe(true);
      expect(report.timestamp <= after).toBe(true);
    });
  });

  describe('notifyPhaseComplete()', () => {
    it('должен уведомлять о завершении фазы', () => {
      const message = notifyPhaseComplete(5, 'Create feature branch');

      expect(message).toContain('Фаза 5 завершена');
      expect(message).toContain('Create feature branch');
    });

    it('должен запрашивать подтверждение', () => {
      const message = notifyPhaseComplete(1, 'Next step');

      expect(message).toContain('Продолжить?');
    });

    it('должен содержать эмодзи', () => {
      const message = notifyPhaseComplete(3, 'test');

      expect(message).toContain('🎉');
    });
  });

  describe('generateReport returns proper structure', () => {
    it('должен иметь правильную структуру', () => {
      const report = generateReport('T-001', 'python-developer', 'Summary', ['file.ts'], { success: true, details: 'OK' }, [], []);

      expect(report.taskId).toBe('T-001');
      expect(report.agentType).toBe('python-developer');
      expect(report.summary).toBe('Summary');
      expect(report.changes).toBeDefined();
      expect(report.results).toBeDefined();
      expect(report.issues).toBeDefined();
      expect(report.attachments).toBeDefined();
      expect(report.timestamp).toBeDefined();
    });
  });

  describe('reporting default export', () => {
    it('должен экспортировать generateReport', () => {
      expect(reporting.generateReport).toBeDefined();
    });

    it('должен экспортировать saveReport', () => {
      expect(reporting.saveReport).toBeDefined();
    });

    it('должен экспортировать getProgressDashboard', () => {
      expect(reporting.getProgressDashboard).toBeDefined();
    });

    it('должен экспортировать updateProgress', () => {
      expect(reporting.updateProgress).toBeDefined();
    });

    it('должен экспортировать notifyPhaseComplete', () => {
      expect(reporting.notifyPhaseComplete).toBeDefined();
    });

    it('должен экспортировать getReports', () => {
      expect(reporting.getReports).toBeDefined();
    });

    it('должен использовать правильные функции', () => {
      const report = reporting.generateReport('T-001', 'agent', 'sum', [], { success: true, details: 'ok' });
      expect(report.taskId).toBe('T-001');
    });
  });

  describe('saveReport function', () => {
    it('должен быть функцией', () => {
      expect(saveReport).toBeDefined();
      expect(typeof saveReport).toBe('function');
    });
  });

  describe('getProgressDashboard function', () => {
    it('должен быть функцией', () => {
      expect(getProgressDashboard).toBeDefined();
      expect(typeof getProgressDashboard).toBe('function');
    });
  });

  describe('updateProgress function', () => {
    it('должен быть функцией', () => {
      expect(updateProgress).toBeDefined();
      expect(typeof updateProgress).toBe('function');
    });
  });

  describe('getReports function', () => {
    it('должен быть функцией', () => {
      expect(getReports).toBeDefined();
      expect(typeof getReports).toBe('function');
    });
  });
});