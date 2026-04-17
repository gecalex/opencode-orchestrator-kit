"use strict";
// Машина состояний проекта
// Управляет переходами между состояниями и разрешениями агентов/инструментов
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
// Определение состояний
const STATES = {
    10: {
        code: 10,
        description: "empty",
        allowedAgents: ["project-initializer"],
        blockedAgents: ["speckit-specify", "speckit-plan", "speckit-tasks", "work_*"],
        allowedTools: ["run_shell_command", "read_file", "write_file", "glob", "grep_search", "edit", "skill", "todowrite"]
    },
    20: {
        code: 20,
        description: "existing_code_no_specs",
        allowedAgents: ["constitution-agent", "specify-agent"],
        blockedAgents: ["plan-agent", "tasks-agent"],
        allowedTools: ["run_shell_command", "read_file", "write_file", "glob", "grep_search"]
    },
    30: {
        code: 30,
        description: "partial_specification",
        allowedAgents: ["specify-agent", "specification-analyst"],
        blockedAgents: ["plan-agent", "tasks-agent"],
        allowedTools: ["run_shell_command", "read_file", "write_file", "glob", "grep_search"]
    },
    40: {
        code: 40,
        description: "full_specification",
        allowedAgents: ["plan-agent", "tasks-agent", "planning-task-analyzer"],
        blockedAgents: ["constitution-agent", "specify-agent"],
        allowedTools: ["run_shell_command", "read_file", "write_file", "edit", "glob", "grep_search", "task"]
    }
};
// Текущее состояние (хранится в памяти)
let currentState = 10;
// Инициализация state machine
async function initialize(directory) {
    currentState = 10;
    return STATES[10];
}
// Получение состояния проекта на основе файловой системы
async function getState($, directory) {
    try {
        // Проверка наличия кода
        const hasCodeResult = await $.command `find ${directory} -type f \\( -name "*.py" -o -name "*.ts" -o -name "*.js" -o -name "*.go" -o -name "*.java" \\) 2>/dev/null | head -1`.text();
        const hasCode = hasCodeResult.trim().length > 0;
        // Проверка наличия спецификаций
        const hasSpecsResult = await $.command `find ${directory}/.opencode -type f -name "spec.md" 2>/dev/null | head -1`.text();
        const hasSpecs = hasSpecsResult.trim().length > 0;
        // Проверка наличия конституции
        const hasConstitutionResult = await $.command `test -f ${directory}/.opencode/specify/memory/constitution.md && echo "yes"`.text();
        const hasConstitution = hasConstitutionResult.trim() === "yes";
        if (!hasCode && !hasSpecs) {
            currentState = 10;
        }
        else if (hasCode && !hasSpecs) {
            currentState = 20;
        }
        else if (hasSpecs && !hasConstitution) {
            currentState = 30;
        }
        else if (hasConstitution) {
            currentState = 40;
        }
        return STATES[currentState];
    }
    catch {
        currentState = 10;
        return STATES[10];
    }
}
// Получение текущего состояния
function getCurrentState() {
    return currentState;
}
// Установка состояния
function setState(state) {
    currentState = state;
}
// Проверка разрешённых инструментов в текущем состоянии
function isToolAllowed(tool, stateCode) {
    const state = stateCode ?? currentState;
    return STATES[state].allowedTools.includes(tool);
}
// Проверка разрешённых агентов с учётом паттернов
function isAgentAllowed(agent, stateCode) {
    const state = stateCode ?? currentState;
    const blocked = STATES[state].blockedAgents;
    const allowed = STATES[state].allowedAgents;
    // Проверка запрещённых паттернов
    for (const pattern of blocked) {
        if (pattern.includes("*")) {
            const regex = new RegExp("^" + pattern.replace("*", ".*") + "$");
            if (regex.test(agent)) {
                return false;
            }
        }
        else if (pattern === agent) {
            return false;
        }
    }
    // Проверка разрешённых паттернов
    for (const pattern of allowed) {
        if (pattern.includes("*")) {
            const regex = new RegExp("^" + pattern.replace("*", ".*") + "$");
            if (regex.test(agent)) {
                return true;
            }
        }
        else if (pattern === agent) {
            return true;
        }
    }
    return false;
}
// Получение описания состояния по коду
function getStateDescription(stateCode) {
    return STATES[stateCode].description;
}
// Обновление состояния после выполнения задачи
async function updateAfterTask(taskResult, directory, $) {
    // После успешной задачи обновляем состояние
    if (taskResult?.status === "success") {
        await getState($, directory);
    }
}
exports.stateMachine = {
    initialize,
    getState,
    getCurrentState,
    setState,
    isToolAllowed,
    isAgentAllowed,
    getStateDescription,
    updateAfterTask
};
exports.default = exports.stateMachine;
