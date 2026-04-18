"use strict";
// Блокирующие правила с автоматическими пре-проверками
// Аварийный тормоз, пре-условия, журналирование нарушений
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
exports.blockingRules = void 0;
exports.checkAllRules = checkAllRules;
exports.checkRule = checkRule;
exports.getViolationLog = getViolationLog;
exports.autoFix = autoFix;
exports.registerRule = registerRule;
exports.getRules = getRules;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Журнал нарушений
const violationLog = [];
const VIOLATION_LOG_FILE = ".opencode/rule-violations.json";
// Правило 1: Аварийный тормоз - проверка состояния workflow
async function checkStateValid() {
    const { stateMachine } = await Promise.resolve().then(() => __importStar(require("./state-machine")));
    const state = stateMachine.getCurrentState();
    return [0, 10, 20, 30, 40, 50, 60, 70, 80, 90].includes(state);
}
// Правило 2: Пре-условия для аналитиков
async function checkAnalystPreconditions() {
    // Аналитики должны иметь доступ к спецификациям
    return fs.existsSync(path.join(process.cwd(), "SPEC"));
}
// Правило 3: Пре-условия для кодеров (TDD)
async function checkCoderPreconditions() {
    // Кодеры должны иметь пройденные тесты
    const { tddWorkflow } = await Promise.resolve().then(() => __importStar(require("./tdd-workflow")));
    const pending = tddWorkflow.getPendingTasks();
    return pending.length === 0;
}
// Правило 4: Пре-условия для рецензентов
async function checkReviewerPreconditions() {
    return fs.existsSync(path.join(process.cwd(), "REPORTS"));
}
// Регистр правил
const RULES = new Map([
    ["state-valid", { id: "state-valid", name: "State Valid", description: "Состояние должно быть валидным", severity: "error", check: checkStateValid }],
    ["analyst-preconditions", { id: "analyst-preconditions", name: "Analyst Preconditions", description: "Доступны спецификации", severity: "error", check: checkAnalystPreconditions }],
    ["coder-tdd", { id: "coder-tdd", name: "Coder TDD", description: "Тесты пройдены перед кодом", severity: "error", check: checkCoderPreconditions }],
    ["reviewer-enabled", { id: "reviewer-enabled", name: "Reviewer Enabled", description: "Директория REPORTS существует", severity: "warning", check: checkReviewerPreconditions }]
]);
// Проверка всех правил
async function checkAllRules() {
    const violations = [];
    for (const [_, rule] of RULES) {
        try {
            const result = await rule.check();
            if (!result) {
                violations.push(`${rule.severity === "error" ? "❌" : "⚠️"} ${rule.name}: ${rule.description}`);
                // Логируем нарушение
                logViolation(rule.id, rule.description);
            }
        }
        catch (e) {
            violations.push(`❌ ${rule.name}: ${e}`);
        }
    }
    return {
        passed: violations.filter(v => v.startsWith("❌")).length === 0,
        violations
    };
}
// Проверка конкретного правила
async function checkRule(ruleId) {
    const rule = RULES.get(ruleId);
    if (!rule)
        return false;
    try {
        return await rule.check();
    }
    catch {
        return false;
    }
}
// Логирование нарушения
function logViolation(ruleId, details) {
    const violation = {
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
        fs.writeFileSync(path.join(process.cwd(), VIOLATION_LOG_FILE), JSON.stringify(violationLog, null, 2));
    }
    catch (e) {
        console.error("[BlockingRules] Failed to save log:", e);
    }
}
// Получить журнал нарушений
function getViolationLog() {
    return [...violationLog];
}
// Самоисправление (для определённых типов нарушений)
async function autoFix(ruleId) {
    // Простейшие автоисправляемые проблемы
    switch (ruleId) {
        case "reviewer-enabled":
            try {
                const dir = path.join(process.cwd(), "REPORTS");
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                return true;
            }
            catch {
                return false;
            }
        default:
            return false;
    }
}
// Регистрация нового правила
function registerRule(rule) {
    RULES.set(rule.id, rule);
}
// Получить все правила
function getRules() {
    return Array.from(RULES.values());
}
exports.blockingRules = {
    checkAllRules,
    checkRule,
    getViolationLog,
    autoFix,
    registerRule,
    getRules
};
exports.default = exports.blockingRules;
