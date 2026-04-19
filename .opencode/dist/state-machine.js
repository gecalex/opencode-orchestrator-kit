"use strict";
// Машина состояний проекта с табличным FSM
// Управляет переходами между состояниями и разрешениями агентов/инструментов
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
exports.stateMachine = void 0;
exports.initialize = initialize;
exports.getState = getState;
exports.getCurrentState = getCurrentState;
exports.setState = setState;
exports.isToolAllowed = isToolAllowed;
exports.isAgentAllowed = isAgentAllowed;
exports.getStateDescription = getStateDescription;
exports.updateAfterTask = updateAfterTask;
exports.getAvailableTransitions = getAvailableTransitions;
exports.tryTransition = tryTransition;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const STATE_FILE = ".opencode/state.json";
const LOG_FILE = ".opencode/state-log.json";
// Определение состояний (12 фаз workflow)
const STATES = {
    1: {
        code: 1,
        description: "Пустой проект (директория создана, нет ничего)",
        allowedAgents: ["project-initializer", "constitution-agent"],
        blockedAgents: ["speckit-specify", "speckit-plan", "speckit-tasks", "plan-agent", "tasks-agent", "planning-task-analyzer", "specification-analyst", "work_*", "python-developer", "go-developer", "react-developer", "python-specialist", "go-specialist", "ts-specialist", "devops", "security"],
        allowedTools: ["read", "glob", "grep", "skill", "todowrite", "task", "write", "question", "bash"]
    },
    2: {
        code: 2,
        description: "Проект инициализирован (есть git, но нет конституции)",
        allowedAgents: ["project-initializer", "constitution-agent"],
        blockedAgents: ["speckit-specify", "speckit-plan", "speckit-tasks", "plan-agent", "tasks-agent", "planning-task-analyzer", "specification-analyst", "work_*", "python-developer", "go-developer", "react-developer", "python-specialist", "go-specialist", "ts-specialist", "devops", "security"],
        allowedTools: ["read", "glob", "grep", "skill", "todowrite", "task"]
    },
    3: {
        code: 3,
        description: "Конституция создана (основные требования и ограничения)",
        allowedAgents: ["project-initializer", "constitution-agent", "specify-agent", "specification-analyst"],
        blockedAgents: ["plan-agent", "tasks-agent", "planning-task-analyzer", "work_*", "python-developer", "go-developer", "react-developer", "python-specialist", "go-specialist", "ts-specialist", "devops", "security"],
        allowedTools: ["read", "glob", "grep", "skill", "todowrite", "task"]
    },
    4: {
        code: 4,
        description: "Спецификации модулей созданы (детальное описание компонентов)",
        allowedAgents: ["project-initializer", "constitution-agent", "specify-agent", "specification-analyst", "plan-agent", "planning-task-analyzer"],
        blockedAgents: ["tasks-agent", "work_*", "python-developer", "go-developer", "react-developer", "python-specialist", "go-specialist", "ts-specialist", "devops", "security"],
        allowedTools: ["run_shell_command", "read_file", "write_file", "glob", "grep_search", "edit", "skill", "todowrite", "task"]
    },
    5: {
        code: 5,
        description: "План реализации готов (оценка усилий, зависимости, риски)",
        allowedAgents: ["project-initializer", "constitution-agent", "specify-agent", "specification-analyst", "plan-agent", "tasks-agent", "planning-task-analyzer", "tdd-coordinator"],
        blockedAgents: ["work_*", "python-developer", "go-developer", "react-developer", "python-specialist", "go-specialist", "ts-specialist", "devops", "security"],
        allowedTools: ["run_shell_command", "read_file", "write_file", "glob", "grep_search", "edit", "skill", "todowrite", "task"]
    },
    6: {
        code: 6,
        description: "Задачи разбиты и агенты назначены (готов к выполнению)",
        allowedAgents: ["project-initializer", "constitution-agent", "specify-agent", "specification-analyst", "plan-agent", "tasks-agent", "planning-task-analyzer", "tdd-coordinator", "python-specialist", "go-specialist", "ts-specialist"],
        blockedAgents: ["work_*", "python-developer", "go-developer", "react-developer", "devops", "security"],
        allowedTools: ["run_shell_command", "read_file", "write_file", "glob", "grep_search", "edit", "skill", "todowrite", "task"]
    },
    7: {
        code: 7,
        description: "Тестовая фаза (написание и выполнение тестов)",
        allowedAgents: ["project-initializer", "constitution-agent", "specify-agent", "specification-analyst", "plan-agent", "tasks-agent", "planning-task-analyzer", "tdd-coordinator", "python-developer", "go-developer", "react-developer"],
        blockedAgents: ["work_*", "devops", "security"],
        allowedTools: ["run_shell_command", "read_file", "write_file", "glob", "grep_search", "edit", "skill", "todowrite", "task"]
    },
    8: {
        code: 8,
        description: "Кодинговая фаза (написание кода под тесты)",
        allowedAgents: ["project-initializer", "constitution-agent", "specify-agent", "specification-analyst", "plan-agent", "tasks-agent", "planning-task-analyzer", "tdd-coordinator", "python-developer", "go-developer", "react-developer", "python-specialist", "go-specialist", "ts-specialist", "devops"],
        blockedAgents: ["work_*", "security"],
        allowedTools: ["run_shell_command", "read_file", "write_file", "glob", "grep_search", "edit", "skill", "todowrite", "task"]
    },
    9: {
        code: 9,
        description: "Фаза интеграции (объединение компонентов и системное тестирование)",
        allowedAgents: ["project-initializer", "constitution-agent", "specify-agent", "specification-analyst", "plan-agent", "tasks-agent", "planning-task-analyzer", "tdd-coordinator", "python-developer", "go-developer", "react-developer", "python-specialist", "go-specialist", "ts-specialist", "devops", "security"],
        blockedAgents: ["work_*"],
        allowedTools: ["run_shell_command", "read_file", "write_file", "glob", "grep_search", "edit", "skill", "todowrite", "task"]
    },
    10: {
        code: 10,
        description: "Релиз-готов (все качественные gate пройдены, готово к релизу)",
        allowedAgents: [],
        blockedAgents: ["work_*", "python-developer", "go-developer", "react-developer", "python-specialist", "go-specialist", "ts-specialist", "devops", "security", "constitution-agent", "specify-agent", "specification-analyst", "plan-agent", "tasks-agent", "planning-task-analyzer", "tdd-coordinator"],
        allowedTools: ["read_file", "glob", "grep_search"]
    }
};
// Определение переходов
const TRANSITIONS = [
    {
        from: 1,
        to: 2,
        condition: async () => true, // После инициализации
        reason: "Проект инициализирован"
    },
    {
        from: 2,
        to: 3,
        condition: async (_, __) => true, // После создания конституции
        reason: "Создание конституции"
    },
    {
        from: 3,
        to: 4,
        condition: async (_, __) => true, // После создания спецификаций
        reason: "Спецификации созданы"
    },
    {
        from: 4,
        to: 5,
        condition: async (_, __) => true, // После плана
        reason: "План реализации готов"
    },
    {
        from: 5,
        to: 6,
        condition: async (_, __) => true, // После разбивки на задачи
        reason: "Задачи назначены"
    },
    {
        from: 6,
        to: 7,
        condition: async (_, __) => true, // Переход к тестам
        reason: "Переход к тестовой фазе"
    },
    {
        from: 7,
        to: 8,
        condition: async (_, __) => true, // Тесты готовы
        reason: "Тесты пройдены, переход к кодингу"
    },
    {
        from: 8,
        to: 9,
        condition: async (_, __) => true, // Код готов
        reason: "Код реализован"
    },
    {
        from: 9,
        to: 10,
        condition: async (_, __) => true, // Интеграция завершена
        reason: "Интеграция завершена"
    }
];
// Текущее состояние по умолчанию
let currentState = 1;
// История переходов
const stateLog = [];
// Логирование перехода
function logTransition(from, to, reason) {
    const entry = { from, to, timestamp: new Date().toISOString(), reason };
    stateLog.push(entry);
    console.log(`[StateMachine] ${from} -> ${to} ${reason ? `(${reason})` : ""}`);
    try {
        fs.writeFileSync(path.join(process.cwd(), LOG_FILE), JSON.stringify(stateLog, null, 2));
    }
    catch (e) {
        console.error("[StateMachine] Failed to write state log:", e);
    }
}
// Сохранение состояния
function saveState(state, directory) {
    try {
        const statePath = path.join(directory, STATE_FILE);
        const dir = path.dirname(statePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(statePath, JSON.stringify({ state, updatedAt: new Date().toISOString() }, null, 2));
    }
    catch (e) {
        console.error("[StateMachine] Failed to save state:", e);
    }
}
// Загрузка состояния
function loadState(directory) {
    try {
        const statePath = path.join(directory, STATE_FILE);
        if (fs.existsSync(statePath)) {
            const data = JSON.parse(fs.readFileSync(statePath, "utf-8"));
            return data.state;
        }
    }
    catch (e) {
        console.error("[StateMachine] Failed to load state:", e);
    }
    return null;
}
// Определение состояния по ФС
async function detectStateFromFS($, directory) {
    try {
        // Проверка git инициализации
        const hasGitResult = await $.command `test -d ${directory}/.git && echo "yes"`.text();
        const hasGit = hasGitResult.trim() === "yes";
        // Проверка CONSTITUTION.md (основная конституция)
        const hasConstitutionResult = await $.command `test -f ${directory}/CONSTITUTION.md && echo "yes"`.text();
        const hasConstitution = hasConstitutionResult.trim() === "yes";
        // Проверка specs/ директории (спецификации модулей)
        const hasSpecsResult = await $.command `find ${directory}/specs -type f -name "*.md" 2>/dev/null | head -1`.text();
        const hasSpecs = hasSpecsResult.trim().length > 0;
        // Проверка PLAN.md (план проекта)
        const hasPlanResult = await $.command `test -f ${directory}/PLAN.md && echo "yes"`.text();
        const hasPlan = hasPlanResult.trim() === "yes";
        // Проверка docs/task.md (задачи)
        const hasTasksResult = await $.command `test -f ${directory}/docs/task.md && echo "yes"`.text();
        const hasTasks = hasTasksResult.trim() === "yes";
        // Проверка src/ директории (есть код)
        const hasImplResult = await $.command `find ${directory}/src -type f 2>/dev/null | head -1`.text();
        const hasImpl = hasImplResult.trim().length > 0;
        // Логика определения состояния
        // 10: Есть всё - интеграция завершена
        if (hasImpl && hasTasks && hasSpecs && hasConstitution)
            return 10;
        // 9: Есть код и задачи
        if (hasImpl && hasTasks && hasSpecs)
            return 9;
        // 8: Есть спецификации + план
        if (hasSpecs && hasPlan)
            return 8;
        // 7: Есть конституция
        if (hasConstitution)
            return 7;
        // 3: Есть git (инициализирован)
        return 3;
    }
    catch {
        return 1;
    }
}
// Инициализация
async function initialize(directory) {
    const saved = loadState(directory);
    // Для нового проекта (нет state.json) — состояние 1 (пустой проект)
    currentState = saved !== null ? saved : 1;
    saveState(currentState, directory);
    return STATES[currentState];
}
// Получение состояния
async function getState($, directory) {
    const saved = loadState(directory);
    if (saved !== null) {
        currentState = saved;
        return STATES[currentState];
    }
    // Пытаемся определить состояние по файловой системе
    const detected = await detectStateFromFS($, directory);
    currentState = detected;
    saveState(currentState, directory);
    return STATES[currentState];
}
// Получить текущее состояние
function getCurrentState() {
    return currentState;
}
// Установить состояние с логированием
function setState(state, reason) {
    const from = currentState;
    currentState = state;
    if (from !== state) {
        logTransition(from, state, reason);
    }
}
// Проверить разрешение инструмента
function isToolAllowed(tool, stateCode) {
    const state = stateCode ?? currentState;
    return STATES[state]?.allowedTools.includes(tool) ?? false;
}
// Проверить разрешение агента
function isAgentAllowed(agent, stateCode) {
    const state = stateCode ?? currentState;
    const blocked = STATES[state]?.blockedAgents ?? [];
    const allowed = STATES[state]?.allowedAgents ?? [];
    for (const pattern of blocked) {
        if (pattern.includes("*")) {
            const regex = new RegExp("^" + pattern.replace("*", ".*") + "$");
            if (regex.test(agent))
                return false;
        }
        else if (pattern === agent) {
            return false;
        }
    }
    for (const pattern of allowed) {
        if (pattern.includes("*")) {
            const regex = new RegExp("^" + pattern.replace("*", ".*") + "$");
            if (regex.test(agent))
                return true;
        }
        else if (pattern === agent) {
            return true;
        }
    }
    return false;
}
// Получить описание состояния
function getStateDescription(stateCode) {
    return STATES[stateCode]?.description ?? "unknown";
}
// Обновить состояние после задачи
async function updateAfterTask(taskResult, directory, $) {
    if (taskResult?.status === "success") {
        await getState($, directory);
    }
}
// Получить доступные переходы
function getAvailableTransitions() {
    return TRANSITIONS.filter(t => t.from === currentState);
}
// Попытка перехода
async function tryTransition(directory, $, targetState) {
    const transition = TRANSITIONS.find(t => t.from === currentState && t.to === targetState);
    if (!transition) {
        console.log(`[StateMachine] No transition ${currentState} -> ${targetState}`);
        return false;
    }
    const conditionMet = await transition.condition(directory, $);
    if (conditionMet) {
        setState(targetState, transition.reason);
        saveState(targetState, directory);
        return true;
    }
    return false;
}
exports.stateMachine = {
    initialize,
    getState,
    getCurrentState,
    setState,
    isToolAllowed,
    isAgentAllowed,
    getStateDescription,
    updateAfterTask,
    getAvailableTransitions,
    tryTransition
};
exports.default = exports.stateMachine;
