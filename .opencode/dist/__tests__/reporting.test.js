"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Tests for reporting.ts
const reporting_1 = require("../reporting");
describe('Reporting Module', () => {
    describe('Module exports', () => {
        it('должен экспортировать generateReport', () => {
            expect(reporting_1.generateReport).toBeDefined();
            expect(typeof reporting_1.generateReport).toBe('function');
        });
        it('должен экспортировать saveReport', () => {
            expect(reporting_1.saveReport).toBeDefined();
            expect(typeof reporting_1.saveReport).toBe('function');
        });
        it('должен экспортировать getProgressDashboard', () => {
            expect(reporting_1.getProgressDashboard).toBeDefined();
            expect(typeof reporting_1.getProgressDashboard).toBe('function');
        });
        it('должен экспортировать updateProgress', () => {
            expect(reporting_1.updateProgress).toBeDefined();
            expect(typeof reporting_1.updateProgress).toBe('function');
        });
        it('должен экспортировать notifyPhaseComplete', () => {
            expect(reporting_1.notifyPhaseComplete).toBeDefined();
            expect(typeof reporting_1.notifyPhaseComplete).toBe('function');
        });
        it('должен экспортировать getReports', () => {
            expect(reporting_1.getReports).toBeDefined();
            expect(typeof reporting_1.getReports).toBe('function');
        });
        it('должен экспортировать reporting объект', () => {
            expect(reporting_1.reporting).toBeDefined();
            expect(typeof reporting_1.reporting).toBe('object');
        });
    });
    describe('generateReport()', () => {
        it('генерирует отчёт с полными данными', () => {
            const report = (0, reporting_1.generateReport)('T-001', 'python-developer', 'Test summary', ['file1.ts', 'file2.ts'], { success: true, details: 'All tests passed' }, ['Issue 1'], ['attachment1.log']);
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
            const report = (0, reporting_1.generateReport)('T-002', 'ts-specialist', 'Summary', [], { success: false, details: 'Failed' });
            expect(report.issues).toHaveLength(0);
            expect(report.attachments).toHaveLength(0);
        });
        it('генерирует timestamp', () => {
            const before = new Date().toISOString();
            const report = (0, reporting_1.generateReport)('T-003', 'agent', 'summary', [], { success: true, details: 'OK' });
            const after = new Date().toISOString();
            expect(report.timestamp).toBeDefined();
            expect(report.timestamp >= before).toBe(true);
            expect(report.timestamp <= after).toBe(true);
        });
        it('принимает все параметры', () => {
            const report = (0, reporting_1.generateReport)('T-004', 'go-developer', 'Complete report', ['file1.go', 'file2.go'], { success: true, details: 'OK' }, ['Minor issue'], ['log.txt']);
            expect(report.taskId).toBe('T-004');
            expect(report.agentType).toBe('go-developer');
            expect(report.summary).toBe('Complete report');
        });
        it('возвращает правильную структуру', () => {
            const report = (0, reporting_1.generateReport)('T-001', 'agent', 'sum', [], { success: true, details: 'ok' });
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
            const report = (0, reporting_1.generateReport)('T-001', 'agent', 'sum', [], { success: true, details: 'ok' }, []);
            expect(report.issues).toHaveLength(0);
        });
        it('принимает пустой attachments массив', () => {
            const report = (0, reporting_1.generateReport)('T-001', 'agent', 'sum', [], { success: true, details: 'ok' }, [], []);
            expect(report.attachments).toHaveLength(0);
        });
    });
    describe('saveReport()', () => {
        it('должен быть функцией', () => {
            expect(typeof reporting_1.saveReport).toBe('function');
        });
        it('функция существует и имеет правильную сигнатуру', () => {
            expect(reporting_1.saveReport.length).toBeGreaterThanOrEqual(2);
        });
    });
    describe('getProgressDashboard()', () => {
        it('должен быть функцией', () => {
            expect(typeof reporting_1.getProgressDashboard).toBe('function');
        });
        it('принимает directory', () => {
            expect(() => (0, reporting_1.getProgressDashboard)('/nonexistent/path')).not.toThrow();
        });
        it('возвращает null для несуществующего пути', () => {
            const result = (0, reporting_1.getProgressDashboard)('/nonexistent/path/xyz123');
            expect(result).toBeNull();
        });
        it('принимает существующий путь', () => {
            const result = (0, reporting_1.getProgressDashboard)('/tmp');
            expect(result === null || typeof result === 'object').toBe(true);
        });
    });
    describe('updateProgress()', () => {
        it('должен быть функцией', () => {
            expect(typeof reporting_1.updateProgress).toBe('function');
        });
        it('принимает параметры', () => {
            expect(() => (0, reporting_1.updateProgress)('/test', 5, ['T-001'], ['T-002'])).not.toThrow();
        });
        it('принимает пустой completedTasks', () => {
            expect(() => (0, reporting_1.updateProgress)('/test', 5, [], ['T-002'])).not.toThrow();
        });
        it('принимает пустой pendingTasks', () => {
            expect(() => (0, reporting_1.updateProgress)('/test', 5, ['T-001'], [])).not.toThrow();
        });
        it('принимает phase 0', () => {
            expect(() => (0, reporting_1.updateProgress)('/test', 0, [], [])).not.toThrow();
        });
        it('принимает phase 10', () => {
            expect(() => (0, reporting_1.updateProgress)('/test', 10, [], [])).not.toThrow();
        });
    });
    describe('getReports()', () => {
        it('должен быть функцией', () => {
            expect(typeof reporting_1.getReports).toBe('function');
        });
        it('принимает directory', () => {
            expect(() => (0, reporting_1.getReports)('/nonexistent')).not.toThrow();
        });
        it('возвращает массив', () => {
            const result = (0, reporting_1.getReports)('/nonexistent');
            expect(Array.isArray(result)).toBe(true);
        });
        it('принимает существующий путь', () => {
            const result = (0, reporting_1.getReports)('/tmp');
            expect(Array.isArray(result)).toBe(true);
        });
    });
    describe('notifyPhaseComplete()', () => {
        it('уведомляет о завершении фазы', () => {
            const message = (0, reporting_1.notifyPhaseComplete)(5, 'Create feature branch');
            expect(message).toContain('Фаза 5 завершена');
            expect(message).toContain('Create feature branch');
        });
        it('запрашивает подтверждение', () => {
            const message = (0, reporting_1.notifyPhaseComplete)(1, 'Next step');
            expect(message).toContain('Продолжить?');
        });
        it('содержит эмодзи', () => {
            const message = (0, reporting_1.notifyPhaseComplete)(3, 'test');
            expect(message).toContain('🎉');
        });
        it('содержит следующее действие', () => {
            const message = (0, reporting_1.notifyPhaseComplete)(7, 'Run tests');
            expect(message).toContain('Run tests');
        });
        it('работает для фазы 1', () => {
            const message = (0, reporting_1.notifyPhaseComplete)(1, 'test');
            expect(message).toContain('Фаза 1');
        });
        it('работает для фазы 10', () => {
            const message = (0, reporting_1.notifyPhaseComplete)(10, 'test');
            expect(message).toContain('Фаза 10');
        });
        it('содержит слово Следующее действие', () => {
            const message = (0, reporting_1.notifyPhaseComplete)(5, 'next');
            expect(message).toContain('Следующее действие');
        });
    });
    describe('reporting default export', () => {
        it('экспортирует все функции', () => {
            expect(reporting_1.reporting.generateReport).toBeDefined();
            expect(reporting_1.reporting.saveReport).toBeDefined();
            expect(reporting_1.reporting.getProgressDashboard).toBeDefined();
            expect(reporting_1.reporting.updateProgress).toBeDefined();
            expect(reporting_1.reporting.notifyPhaseComplete).toBeDefined();
            expect(reporting_1.reporting.getReports).toBeDefined();
        });
        it('использует правильные функции', () => {
            const report = reporting_1.reporting.generateReport('T-001', 'agent', 'sum', [], { success: true, details: 'ok' });
            expect(report.taskId).toBe('T-001');
        });
    });
    describe('AgentReport structure', () => {
        it('имеет taskId', () => {
            const report = (0, reporting_1.generateReport)('T-001', 'agent', 'sum', [], { success: true, details: 'ok' });
            expect(report.taskId).toBe('T-001');
        });
        it('имеет agentType', () => {
            const report = (0, reporting_1.generateReport)('T-001', 'python-developer', 'sum', [], { success: true, details: 'ok' });
            expect(report.agentType).toBe('python-developer');
        });
        it('имеет summary', () => {
            const report = (0, reporting_1.generateReport)('T-001', 'agent', 'test summary', [], { success: true, details: 'ok' });
            expect(report.summary).toBe('test summary');
        });
        it('имеет changes массив', () => {
            const report = (0, reporting_1.generateReport)('T-001', 'agent', 'sum', ['file1.ts'], { success: true, details: 'ok' });
            expect(report.changes).toHaveLength(1);
        });
        it('имеет results объект', () => {
            const report = (0, reporting_1.generateReport)('T-001', 'agent', 'sum', [], { success: true, details: 'ok' });
            expect(report.results).toHaveProperty('success');
            expect(report.results).toHaveProperty('details');
        });
        it('issues является массивом', () => {
            const report = (0, reporting_1.generateReport)('T-001', 'agent', 'sum', [], { success: true, details: 'ok' }, ['issue1']);
            expect(report.issues).toHaveLength(1);
        });
        it('attachments является массивом', () => {
            const report = (0, reporting_1.generateReport)('T-001', 'agent', 'sum', [], { success: true, details: 'ok' }, [], ['file.txt']);
            expect(report.attachments).toHaveLength(1);
        });
        it('имеет timestamp', () => {
            const report = (0, reporting_1.generateReport)('T-001', 'agent', 'sum', [], { success: true, details: 'ok' });
            expect(report.timestamp).toBeDefined();
        });
    });
    describe('Edge cases', () => {
        it('generateReport с очень длинным summary', () => {
            const longSummary = 'a'.repeat(1000);
            const report = (0, reporting_1.generateReport)('T-001', 'agent', longSummary, [], { success: true, details: 'ok' });
            expect(report.summary).toHaveLength(1000);
        });
        it('generateReport с кириллицей', () => {
            const report = (0, reporting_1.generateReport)('T-001', 'agent', 'тестовое резюме', [], { success: true, details: 'ок' });
            expect(report.summary).toContain('тестовое');
        });
        it('getProgressDashboard с корневым путём', () => {
            expect(() => (0, reporting_1.getProgressDashboard)('/')).not.toThrow();
        });
        it('updateProgress с /tmp', () => {
            expect(() => (0, reporting_1.updateProgress)('/tmp', 5, [], [])).not.toThrow();
        });
    });
});
