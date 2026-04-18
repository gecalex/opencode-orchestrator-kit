// Блокирующие правила с автоматическими пре-проверками
// Аварийный тормоз, пре-условия, журналирование нарушений

import * as fs from "fs";
import * as path from "path";

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

const VIOLATION_LOG_FILE = ".opencode/rule-violations.json";

// Правило 1: Аварийный тормоз - проверка состояния workflow
async function checkStateValid(): Promise<boolean> {
  const { stateMachine } = await import("./state-machine");
  const state = stateMachine.getCurrentState();
  return [0, 10, 20, 30, 40, 50, 60, 70, 80, 90].includes(state);
}

// Правило 2: Пре-условия для аналитиков
async function checkAnalystPreconditions(): Promise<boolean> {
  // Аналитики должны иметь доступ к спецификациям
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
  ["reviewer-enabled", { id: "reviewer-enabled", name: "Reviewer Enabled", description: "Директория REPORTS существует", severity: "warning", check: checkReviewerPreconditions }]
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
  
  console.log(`[BlockingRules] Violation: ${ruleId} - ${details}`);
  
  // Сохраняем в файл
  try {
    fs.writeFileSync(
      path.join(process.cwd(), VIOLATION_LOG_FILE),
      JSON.stringify(violationLog, null, 2)
    );
  } catch (e) {
    console.error("[BlockingRules] Failed to save log:", e);
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