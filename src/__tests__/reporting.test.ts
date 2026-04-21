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
  describe('Module exports', () => {
    it('должен экспортировать generateReport', () => {
      expect(generateReport).toBeDefined();
      expect(typeof generateReport).toBe('function');
    });

    it('должен экспортировать saveReport', () => {
      expect(saveReport).toBeDefined();
      expect(typeof saveReport).toBe('function');
    });

    it('должен экспортировать getProgressDashboard', () => {
      expect(getProgressDashboard).toBeDefined();
      expect(typeof getProgressDashboard).toBe('function');
    });

    it('должен экспортировать updateProgress', () => {
      expect(updateProgress).toBeDefined();
      expect(typeof updateProgress).toBe('function');
    });

    it('должен экспортировать notifyPhaseComplete', () => {
      expect(notifyPhaseComplete).toBeDefined();
      expect(typeof notifyPhaseComplete).toBe('function');
    });

    it('должен экспортировать getReports', () => {
      expect(getReports).toBeDefined();
      expect(typeof getReports).toBe('function');
    });

    it('должен экспортировать reporting объект', () => {
      expect(reporting).toBeDefined();
      expect(typeof reporting).toBe('object');
    });
  });

  describe('generateReport()', () => {
    it('генерирует отчёт с полными данными', () => {
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

    it('использует пустые массивы по умолчанию', () => {
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

    it('генерирует timestamp', () => {
      const before = new Date().toISOString();
      const report = generateReport('T-003', 'agent', 'summary', [], { success: true, details: 'OK' });
      const after = new Date().toISOString();

      expect(report.timestamp).toBeDefined();
      expect(report.timestamp >= before).toBe(true);
      expect(report.timestamp <= after).toBe(true);
    });

    it('принимает все параметры', () => {
      const report = generateReport(
        'T-004',
        'go-developer',
        'Complete report',
        ['file1.go', 'file2.go'],
        { success: true, details: 'OK' },
        ['Minor issue'],
        ['log.txt']
      );

      expect(report.taskId).toBe('T-004');
      expect(report.agentType).toBe('go-developer');
      expect(report.summary).toBe('Complete report');
    });

    it('возвращает правильную структуру', () => {
      const report = generateReport('T-001', 'agent', 'sum', [], { success: true, details: 'ok' });

      expect(report.taskId).toBeDefined();
      expect(report.agentType).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.changes).toBeDefined();
      expect(report.results).toBeDefined();
      expect(report.issues).toBeDefined();
      expect(report.attachments).toBeDefined();
      expect(report.timestamp).toBeDefined();
    });

    it('принимает пустой issues массив', () => {
      const report = generateReport('T-001', 'agent', 'sum', [], { success: true, details: 'ok' }, []);
      expect(report.issues).toHaveLength(0);
    });

    it('принимает пустой attachments массив', () => {
      const report = generateReport('T-001', 'agent', 'sum', [], { success: true, details: 'ok' }, [], []);
      expect(report.attachments).toHaveLength(0);
    });
  });

  describe('saveReport()', () => {
    it('должен быть функцией', () => {
      expect(typeof saveReport).toBe('function');
    });

    it('функция существует и имеет правильную сигнатуру', () => {
      expect(saveReport.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getProgressDashboard()', () => {
    it('должен быть функцией', () => {
      expect(typeof getProgressDashboard).toBe('function');
    });

    it('принимает directory', () => {
      expect(() => getProgressDashboard('/nonexistent/path')).not.toThrow();
    });

    it('возвращает null для несуществующего пути', () => {
      const result = getProgressDashboard('/nonexistent/path/xyz123');
      expect(result).toBeNull();
    });

    it('принимает существующий путь', () => {
      const result = getProgressDashboard('/tmp');
      expect(result === null || typeof result === 'object').toBe(true);
    });
  });

  describe('updateProgress()', () => {
    it('должен быть функцией', () => {
      expect(typeof updateProgress).toBe('function');
    });

    it('принимает параметры', () => {
      expect(() => updateProgress('/test', 5, ['T-001'], ['T-002'])).not.toThrow();
    });

    it('принимает пустой completedTasks', () => {
      expect(() => updateProgress('/test', 5, [], ['T-002'])).not.toThrow();
    });

    it('принимает пустой pendingTasks', () => {
      expect(() => updateProgress('/test', 5, ['T-001'], [])).not.toThrow();
    });

    it('принимает phase 0', () => {
      expect(() => updateProgress('/test', 0, [], [])).not.toThrow();
    });

    it('принимает phase 10', () => {
      expect(() => updateProgress('/test', 10, [], [])).not.toThrow();
    });
  });

  describe('getReports()', () => {
    it('должен быть функцией', () => {
      expect(typeof getReports).toBe('function');
    });

    it('принимает directory', () => {
      expect(() => getReports('/nonexistent')).not.toThrow();
    });

    it('возвращает массив', () => {
      const result = getReports('/nonexistent');
      expect(Array.isArray(result)).toBe(true);
    });

    it('принимает существующий путь', () => {
      const result = getReports('/tmp');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('notifyPhaseComplete()', () => {
    it('уведомляет о завершении фазы', () => {
      const message = notifyPhaseComplete(5, 'Create feature branch');

      expect(message).toContain('Фаза 5 завершена');
      expect(message).toContain('Create feature branch');
    });

    it('запрашивает подтверждение', () => {
      const message = notifyPhaseComplete(1, 'Next step');

      expect(message).toContain('Продолжить?');
    });

    it('содержит эмодзи', () => {
      const message = notifyPhaseComplete(3, 'test');

      expect(message).toContain('🎉');
    });

    it('содержит следующее действие', () => {
      const message = notifyPhaseComplete(7, 'Run tests');
      expect(message).toContain('Run tests');
    });

    it('работает для фазы 1', () => {
      const message = notifyPhaseComplete(1, 'test');
      expect(message).toContain('Фаза 1');
    });

    it('работает для фазы 10', () => {
      const message = notifyPhaseComplete(10, 'test');
      expect(message).toContain('Фаза 10');
    });

    it('содержит слово Следующее действие', () => {
      const message = notifyPhaseComplete(5, 'next');
      expect(message).toContain('Следующее действие');
    });
  });

  describe('reporting default export', () => {
    it('экспортирует все функции', () => {
      expect(reporting.generateReport).toBeDefined();
      expect(reporting.saveReport).toBeDefined();
      expect(reporting.getProgressDashboard).toBeDefined();
      expect(reporting.updateProgress).toBeDefined();
      expect(reporting.notifyPhaseComplete).toBeDefined();
      expect(reporting.getReports).toBeDefined();
    });

    it('использует правильные функции', () => {
      const report = reporting.generateReport('T-001', 'agent', 'sum', [], { success: true, details: 'ok' });
      expect(report.taskId).toBe('T-001');
    });
  });

  describe('AgentReport structure', () => {
    it('имеет taskId', () => {
      const report = generateReport('T-001', 'agent', 'sum', [], { success: true, details: 'ok' });
      expect(report.taskId).toBe('T-001');
    });

    it('имеет agentType', () => {
      const report = generateReport('T-001', 'python-developer', 'sum', [], { success: true, details: 'ok' });
      expect(report.agentType).toBe('python-developer');
    });

    it('имеет summary', () => {
      const report = generateReport('T-001', 'agent', 'test summary', [], { success: true, details: 'ok' });
      expect(report.summary).toBe('test summary');
    });

    it('имеет changes массив', () => {
      const report = generateReport('T-001', 'agent', 'sum', ['file1.ts'], { success: true, details: 'ok' });
      expect(report.changes).toHaveLength(1);
    });

    it('имеет results объект', () => {
      const report = generateReport('T-001', 'agent', 'sum', [], { success: true, details: 'ok' });
      expect(report.results).toHaveProperty('success');
      expect(report.results).toHaveProperty('details');
    });

    it('issues является массивом', () => {
      const report = generateReport('T-001', 'agent', 'sum', [], { success: true, details: 'ok' }, ['issue1']);
      expect(report.issues).toHaveLength(1);
    });

    it('attachments является массивом', () => {
      const report = generateReport('T-001', 'agent', 'sum', [], { success: true, details: 'ok' }, [], ['file.txt']);
      expect(report.attachments).toHaveLength(1);
    });

    it('имеет timestamp', () => {
      const report = generateReport('T-001', 'agent', 'sum', [], { success: true, details: 'ok' });
      expect(report.timestamp).toBeDefined();
    });
  });

  describe('Edge cases', () => {
    it('generateReport с очень длинным summary', () => {
      const longSummary = 'a'.repeat(1000);
      const report = generateReport('T-001', 'agent', longSummary, [], { success: true, details: 'ok' });
      expect(report.summary).toHaveLength(1000);
    });

    it('generateReport с кириллицей', () => {
      const report = generateReport('T-001', 'agent', 'тестовое резюме', [], { success: true, details: 'ок' });
      expect(report.summary).toContain('тестовое');
    });

    it('getProgressDashboard с корневым путём', () => {
      expect(() => getProgressDashboard('/')).not.toThrow();
    });

    it('updateProgress с /tmp', () => {
      expect(() => updateProgress('/tmp', 5, [], [])).not.toThrow();
    });
  });
});