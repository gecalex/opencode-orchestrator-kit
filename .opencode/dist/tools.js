"use strict";
// Кастомные инструменты для Speckit операций
// Реализует инструменты: speckit-analyze-state, speckit-pre-flight-check, speckit-quality-gate-run, speckit-task-delegator
Object.defineProperty(exports, "__esModule", { value: true });
exports.toolsRegistry = void 0;
exports.analyzeState = analyzeState;
exports.preFlightCheck = preFlightCheck;
exports.qualityGateRun = qualityGateRun;
exports.taskDelegator = taskDelegator;
const state_machine_1 = require("./state-machine");
const pre_flight_1 = require("./pre-flight");
const quality_gates_1 = require("./quality-gates");
// Инструмент: analyze-state — определение состояния проекта
async function analyzeState($, directory) {
    try {
        const state = await state_machine_1.stateMachine.getState($, directory);
        return {
            success: true,
            result: {
                code: state.code,
                description: state.description,
                allowedAgents: state.allowedAgents,
                blockedAgents: state.blockedAgents,
                allowedTools: state.allowedTools
            },
            message: `Состояние: ${state.code} (${state.description})`
        };
    }
    catch (e) {
        return {
            success: false,
            error: String(e),
            message: `Ошибка определения состояния: ${e}`
        };
    }
}
// Инструмент: pre-flight-check — запуск предварительных проверок
async function preFlightCheck($, directory) {
    try {
        const result = await pre_flight_1.preFlight.run($, directory);
        return {
            success: result.success,
            result: {
                passed: result.passed,
                failed: result.failed,
                errors: result.errors
            },
            message: result.success
                ? `✅ Pre-Flight пройден (${result.passed}/${result.passed + result.failed})`
                : `❌ Pre-Flight не пройден: ${result.errors.join(", ")}`
        };
    }
    catch (e) {
        return {
            success: false,
            error: String(e),
            message: `Ошибка: ${e}`
        };
    }
}
// Инструмент: quality-gate-run — выполнение контрольных точек
async function qualityGateRun($, directory, gateType, args) {
    try {
        let result;
        switch (gateType) {
            case "preExecution":
                result = await quality_gates_1.qualityGates.preExecution(args);
                break;
            case "postExecution":
                result = await quality_gates_1.qualityGates.postExecution(args);
                break;
            case "preCommit":
                result = await quality_gates_1.qualityGates.preCommit($, directory);
                break;
            case "preMerge":
                result = await quality_gates_1.qualityGates.preMerge($);
                break;
            case "preImplementation":
                result = await quality_gates_1.qualityGates.preImplementation(args?.specFile || "");
                break;
            default:
                return {
                    success: false,
                    error: `Unknown gate type: ${gateType}`,
                    message: `Неизвестный тип gate: ${gateType}`
                };
        }
        return {
            success: result.passed,
            result: {
                passed: result.passed,
                checks: result.checks
            },
            message: result.passed
                ? `✅ Gate ${gateType} пройден`
                : `❌ Gate ${gateType} не пройден: ${result.checks.filter((c) => !c.passed).map((c) => c.message).join(", ")}`
        };
    }
    catch (e) {
        return {
            success: false,
            error: String(e),
            message: `Ошибка: ${e}`
        };
    }
}
// И��струмент: task-delegator — делегирование задач агентам
async function taskDelegator(taskInput) {
    // Валидация входных данных
    if (!taskInput?.prompt) {
        return {
            success: false,
            error: "Prompt задачи пуст",
            message: "❌ Промпт задачи обязателен"
        };
    }
    if (!taskInput?.subagent_type) {
        return {
            success: false,
            error: "Agent type not specified",
            message: "❌ Тип агента обязателен"
        };
    }
    // Проверка допустимости агента в текущем состоянии
    if (!state_machine_1.stateMachine.isAgentAllowed(taskInput.subagent_type)) {
        return {
            success: false,
            error: `Agent ${taskInput.subagent_type} not allowed`,
            message: `❌ Агент ${taskInput.subagent_type} запрещён в текущем состоянии`
        };
    }
    return {
        success: true,
        result: {
            prompt: taskInput.prompt,
            subagent_type: taskInput.subagent_type,
            description: taskInput.description
        },
        message: `✅ Задача подготовлена для ${taskInput.subagent_type}`
    };
}
// Registry инструментов
exports.toolsRegistry = {
    "speckit-analyze-state": analyzeState,
    "speckit-pre-flight-check": preFlightCheck,
    "speckit-quality-gate-run": qualityGateRun,
    "speckit-task-delegator": taskDelegator
};
exports.default = exports.toolsRegistry;
