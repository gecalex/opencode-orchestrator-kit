"use strict";
// Комплексная система отчётности
// Генерация отчётов после каждой операции агента, дашборд прогресса
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
exports.reporting = void 0;
exports.generateReport = generateReport;
exports.saveReport = saveReport;
exports.getProgressDashboard = getProgressDashboard;
exports.updateProgress = updateProgress;
exports.notifyPhaseComplete = notifyPhaseComplete;
exports.getReports = getReports;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Шаблон отчёта
const REPORT_TEMPLATE = `## 📋 Summary
- Краткое описание выполненной работы
- Выполнено ли задание полностью/частично
- Следующие необходимые шаги

## 🔧 Changes Made
- Список изменённых файлов с кратким описанием
- Тип изменений (добавление, модификация, удаление)
- Ссылки на связанные задачи и спецификации

## ✅ Results
- Результаты выполнения (прошёл/не прошёл тест, создан/обновлён документ)
- Количественные метрики (если применимо)
- Сравнение с ожидаемым результатом

## ⚠️ Issues & Risks
- Выявленные проблемы или риски
- Предложенные решения или пути обхода
- Требуется ли вмешательство пользователя

## 📎 Attachments
- Ссылки на созданные артефакты (логи, отчёты тестов, конфиги)
- Данные для воспроизведения (если применимо)
`;
const REPORTS_DIR = "REPORTS";
const PROGRESS_FILE = ".opencode/progress.json";
// Генерация отчёта
function generateReport(taskId, agentType, summary, changes, results, issues = [], attachments = []) {
    return {
        taskId,
        agentType,
        summary,
        changes,
        results,
        issues,
        attachments,
        timestamp: new Date().toISOString()
    };
}
// Сохранение отчёта в Markdown
function saveReport(directory, report, format = "markdown") {
    const dir = path.join(directory, REPORTS_DIR);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    const filename = `${report.timestamp.split("T")[0]}-${report.taskId}.${format === "markdown" ? "md" : "json"}`;
    const filepath = path.join(dir, filename);
    if (format === "markdown") {
        const content = `# Отчёт: ${report.taskId}

**Агент:** ${report.agentType}  
**Время:** ${report.timestamp}

---

## 📋 Summary
${report.summary}

## 🔧 Changes Made
${report.changes.map(c => `- ${c}`).join("\n")}

## ✅ Results
${report.results.success ? "✅" : "❌"} ${report.results.details}

${report.issues.length > 0 ? `\n## ⚠️ Issues & Risks\n${report.issues.map(i => `- ${i}`).join("\n")}` : ""}

${report.attachments.length > 0 ? `\n## 📎 Attachments\n${report.attachments.map(a => `- ${a}`).join("\n")}` : ""}
`;
        fs.writeFileSync(filepath, content);
    }
    else {
        fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    }
    console.log(`[Reporting] Saved report: ${filename}`);
    return filename;
}
// Дашборд прогресса
function getProgressDashboard(directory) {
    try {
        const progressPath = path.join(directory, PROGRESS_FILE);
        if (fs.existsSync(progressPath)) {
            return JSON.parse(fs.readFileSync(progressPath, "utf-8"));
        }
    }
    catch (e) {
        console.error("[Reporting] Failed to load progress:", e);
    }
    return null;
}
// Обновление прогресса
function updateProgress(directory, phase, completed, pending) {
    const progress = {
        currentPhase: phase,
        completedTasks: completed,
        pendingTasks: pending,
        lastUpdate: new Date().toISOString()
    };
    try {
        const progressPath = path.join(directory, PROGRESS_FILE);
        const dir = path.dirname(progressPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));
        console.log("[Reporting] Progress updated");
    }
    catch (e) {
        console.error("[Reporting] Failed to save progress:", e);
    }
}
// Уведомление о завершении фазы
function notifyPhaseComplete(phase, nextAction) {
    return `🎉 Фаза ${phase} завершена!

Следующее действие: ${nextAction}

Продолжить? (да/нет)`;
}
// Получить все отчёты
function getReports(directory) {
    const dir = path.join(directory, REPORTS_DIR);
    if (!fs.existsSync(dir)) {
        return [];
    }
    return fs.readdirSync(dir).filter(f => f.endsWith(".md"));
}
exports.reporting = {
    generateReport,
    saveReport,
    getProgressDashboard,
    updateProgress,
    notifyPhaseComplete,
    getReports
};
exports.default = exports.reporting;
