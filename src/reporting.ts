// Комплексная система отчётности
// Генерация отчётов после каждой операции агента, дашборд прогресса

import * as fs from "fs";
import * as path from "path";

interface AgentReport {
  taskId: string;
  agentType: string;
  summary: string;
  changes: string[];
  results: {
    success: boolean;
    details: string;
  };
  issues: string[];
  attachments: string[];
  timestamp: string;
}

interface ProjectProgress {
  currentPhase: number;
  completedTasks: string[];
  pendingTasks: string[];
  lastUpdate: string;
}

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
export function generateReport(
  taskId: string,
  agentType: string,
  summary: string,
  changes: string[],
  results: { success: boolean; details: string },
  issues: string[] = [],
  attachments: string[] = []
): AgentReport {
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
export function saveReport(
  directory: string,
  report: AgentReport,
  format: "markdown" | "json" = "markdown"
): string {
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
  } else {
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
  }

  console.log(`[Reporting] Saved report: ${filename}`);
  return filename;
}

// Дашборд прогресса
export function getProgressDashboard(directory: string): ProjectProgress | null {
  try {
    const progressPath = path.join(directory, PROGRESS_FILE);
    if (fs.existsSync(progressPath)) {
      return JSON.parse(fs.readFileSync(progressPath, "utf-8"));
    }
  } catch (e) {
    console.error("[Reporting] Failed to load progress:", e);
  }
  return null;
}

// Обновление прогресса
export function updateProgress(
  directory: string,
  phase: number,
  completed: string[],
  pending: string[]
): void {
  const progress: ProjectProgress = {
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
  } catch (e) {
    console.error("[Reporting] Failed to save progress:", e);
  }
}

// Уведомление о завершении фазы
export function notifyPhaseComplete(phase: number, nextAction: string): string {
  return `🎉 Фаза ${phase} завершена!

Следующее действие: ${nextAction}

Продолжить? (да/нет)`;
}

// Получить все отчёты
export function getReports(directory: string): string[] {
  const dir = path.join(directory, REPORTS_DIR);
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs.readdirSync(dir).filter(f => f.endsWith(".md"));
}

export const reporting = {
  generateReport,
  saveReport,
  getProgressDashboard,
  updateProgress,
  notifyPhaseComplete,
  getReports
};

export default reporting;