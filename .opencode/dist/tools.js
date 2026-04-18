"use strict";
// Кастомные инструменты для Speckit операций
// Реализует инструменты: speckit-analyze-state, speckit-pre-flight-check, speckit-quality-gate-run, speckit-task-delegator
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
exports.toolsRegistry = void 0;
exports.analyzeState = analyzeState;
exports.preFlightCheck = preFlightCheck;
exports.qualityGateRun = qualityGateRun;
exports.taskDelegator = taskDelegator;
exports.mcpSearch = mcpSearch;
exports.mcpList = mcpList;
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
                result = await quality_gates_1.qualityGates.preMerge($, directory);
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
// Инструмент: task-delegator — делегирование задач агентам с автоматическим созданием feature-ветки
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
// Инструмент: mcp-search — поиск MCP серверов в реестре
async function mcpSearch(args) {
    try {
        const { mcpRegistry } = await Promise.resolve().then(() => __importStar(require("./mcp-registry")));
        let results = [];
        if (args.technology) {
            results = mcpRegistry.getByTech(args.technology);
        }
        else if (args.category) {
            results = mcpRegistry.getByCategory(args.category);
        }
        else if (args.tag) {
            results = mcpRegistry.getByTag(args.tag);
        }
        else {
            results = mcpRegistry.getAll();
        }
        return {
            success: true,
            result: {
                count: results.length,
                servers: results.map(s => ({
                    id: s.id,
                    name: s.name,
                    description: s.description,
                    category: s.category,
                    type: s.type
                }))
            },
            message: `Найдено ${results.length} MCP серверов`
        };
    }
    catch (e) {
        return {
            success: false,
            error: String(e),
            message: `Ошибка поиска MCP: ${e}`
        };
    }
}
// Инструмент: mcp-list — список всех доступных MCP серверов
async function mcpList() {
    try {
        const { mcpRegistry } = await Promise.resolve().then(() => __importStar(require("./mcp-registry")));
        const all = mcpRegistry.getAll();
        const grouped = mcpRegistry.getGroupedByCategory();
        return {
            success: true,
            result: {
                total: all.length,
                byCategory: Object.entries(grouped).map(([cat, servers]) => ({
                    category: cat,
                    count: servers.length,
                    servers: servers.map(s => s.name)
                }))
            },
            message: `Всего ${all.length} MCP серверов в ${Object.keys(grouped).length} категориях`
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
// Registry инструментов
exports.toolsRegistry = {
    "speckit-analyze-state": analyzeState,
    "speckit-pre-flight-check": preFlightCheck,
    "speckit-quality-gate-run": qualityGateRun,
    "speckit-task-delegator": taskDelegator,
    "speckit-mcp-search": mcpSearch,
    "speckit-mcp-list": mcpList
};
exports.default = exports.toolsRegistry;
