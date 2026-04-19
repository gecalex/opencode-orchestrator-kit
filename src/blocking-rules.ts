// Блокирующие правила с автоматическими пре-проверками
// Аварийный тормоз, пре-условия, журналирование нарушений

import * as fs from "fs";
import * as path from "path";

const LOGS_DIR = ".opencode/logs";
const VIOLATION_LOG_FILE = ".opencode/logs/rule-violations.json";
const LOG_FILE = ".opencode/logs/plugin.log";
const LOG_ENABLED = false; // Только для отладки

function logToFile(message: string): void {
  if (!LOG_ENABLED) return;
  try {
    const logsDir = path.join(process.cwd(), LOGS_DIR);
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
    const entry = `[${new Date().toISOString()}] ${message}\n`;
    fs.appendFileSync(path.join(process.cwd(), LOG_FILE), entry);
  } catch { /* silent */ }
}

interface BlockingRule {
  id: string;
  name: string;
  description: string;
  severity: "error" | "warning";
  check: () => Promise<boolean>;
}

interface RuleViolation {
  ruleId: string;
  timestamp: string;
  details: string;
}

// Журнал нарушений
const violationLog: RuleViolation[] = [];

// Правило 1: Аварийный тормоз - проверка состояния workflow
async function checkStateValid(): Promise<boolean> {
  const { stateMachine } = await import("./state-machine");
  const state = stateMachine.getCurrentState();
  return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(state);
}

// Правило 5: Git workflow - проверка что мы в feature/bugfix/hotfix ветке (кроме состояния инициализации)
const checkGitWorkflow = async (): Promise<boolean> => {
  // Исключаем начальное состояние (1) и состояние создания конституции (3) из проверки ветки
  const { stateMachine } = await import("./state-machine");
  const state = stateMachine.getCurrentState();

  // Для состояний 1 (пустой) и 3 (конституция) проверка ветки не требуется
  if (state === 1 || state === 3) {
    return true;
  }
  
  try {
    // Мы не можем напрямую вызвать git workflow здесь без контекста $ и directory
    // Вместо этого делаем прямую проверку git
    const { exec } = await import("child_process");
    const branchResult = await new Promise<string>((resolve, reject) => {
      exec("git branch --show-current", (error, stdout) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout.trim());
        }
      });
    });
    
    const branch = branchResult;
    // Проверяем, что мы в feature/, bugfix/ или hotfix/ ветке
    return branch.startsWith("feature/") || branch.startsWith("bugfix/") || branch.startsWith("hotfix/");
  } catch (e) {
    // Если не можем определить ветку (например, не git репозиторий), считаем что проверка не пройдена
    return false;
  }
};

// Правило 2: Пре-условия для аналитиков
async function checkAnalystPreconditions(): Promise<boolean> {
  // Аналитики должны иметь доступ к спецификациям
  // Но для состояний 1 (пустой) и 3 (конституция) - это нормально
  const { stateMachine } = await import("./state-machine");
  const state = stateMachine.getCurrentState();

  // Для состояний 1 и 3 проверка спецификаций не требуется
  // Оркестратор может анализировать проект и создавать конституцию/спецификации
  if (state === 1 || state === 3) {
    return true;
  }
  
  // Для остальных состояний требуются спецификации
  return fs.existsSync(path.join(process.cwd(), "SPEC"));
}

// Правило 3: Пре-условия для кодеров (TDD)
async function checkCoderPreconditions(): Promise<boolean> {
  // Кодеры должны иметь пройденные тесты
  const { tddWorkflow } = await import("./tdd-workflow");
  const pending = tddWorkflow.getPendingTasks();
  return pending.length === 0;
}

// Правило 4: Пре-условия для рецензентов
async function checkReviewerPreconditions(): Promise<boolean> {
  return fs.existsSync(path.join(process.cwd(), "REPORTS"));
}

// Регистр правил
const RULES: Map<string, BlockingRule> = new Map([
  ["state-valid", { id: "state-valid", name: "State Valid", description: "Состояние должно быть валидным", severity: "error", check: checkStateValid }],
  ["analyst-preconditions", { id: "analyst-preconditions", name: "Analyst Preconditions", description: "Доступны спецификации", severity: "error", check: checkAnalystPreconditions }],
  ["coder-tdd", { id: "coder-tdd", name: "Coder TDD", description: "Тесты пройдены перед кодом", severity: "error", check: checkCoderPreconditions }],
  ["reviewer-enabled", { id: "reviewer-enabled", name: "Reviewer Enabled", description: "Директория REPORTS существует", severity: "warning", check: checkReviewerPreconditions }],
  ["git-workflow", { id: "git-workflow", name: "Git Workflow", description: "Работа должна происходить в feature/bugfix/hotfix ветке", severity: "error", check: checkGitWorkflow }]
]);

// Проверка всех правил
export async function checkAllRules(): Promise<{ passed: boolean; violations: string[] }> {
  const violations: string[] = [];

  for (const [_, rule] of RULES) {
    try {
      const result = await rule.check();
      if (!result) {
        violations.push(`${rule.severity === "error" ? "❌" : "⚠️"} ${rule.name}: ${rule.description}`);
        
        // Логируем нарушение
        logViolation(rule.id, rule.description);
      }
    } catch (e) {
      violations.push(`❌ ${rule.name}: ${e}`);
    }
  }

  return {
    passed: violations.filter(v => v.startsWith("❌")).length === 0,
    violations
  };
}

// Проверка конкретного правила
export async function checkRule(ruleId: string): Promise<boolean> {
  const rule = RULES.get(ruleId);
  if (!rule) return false;
  
  try {
    return await rule.check();
  } catch {
    return false;
  }
}

// Логирование нарушения
function logViolation(ruleId: string, details: string): void {
  const violation: RuleViolation = {
    ruleId,
    timestamp: new Date().toISOString(),
    details
  };
  
  violationLog.push(violation);
  
  // Ограничиваем журнал 100 записями
  if (violationLog.length > 100) {
    violationLog.shift();
  }
  
  logToFile(`Violation: ${ruleId} - ${details}`);
  
  // Сохраняем в файл
  try {
    const logsDir = path.join(process.cwd(), LOGS_DIR);
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
    fs.writeFileSync(
      path.join(process.cwd(), VIOLATION_LOG_FILE),
      JSON.stringify(violationLog, null, 2)
    );
  } catch (e) {
    logToFile(`Failed to save log: ${e}`);
  }
}

// Получить журнал нарушений
export function getViolationLog(): RuleViolation[] {
  return [...violationLog];
}

// Самоисправление (для определённых типов нарушений)
export async function autoFix(ruleId: string): Promise<boolean> {
  // Простейшие автоисправляемые проблемы
  switch (ruleId) {
    case "reviewer-enabled":
      try {
        const dir = path.join(process.cwd(), "REPORTS");
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        return true;
      } catch {
        return false;
      }
    
    default:
      return false;
  }
}

// Регистрация нового правила
export function registerRule(rule: BlockingRule): void {
  RULES.set(rule.id, rule);
}

// Получить все правила
export function getRules(): BlockingRule[] {
  return Array.from(RULES.values());
}

export const blockingRules = {
  checkAllRules,
  checkRule,
  getViolationLog,
  autoFix,
  registerRule,
  getRules
};

export default blockingRules;