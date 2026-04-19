"use strict";
// Система хуков для событий сессий
// Обрабатывает события session.created, session.idle, session.compacted, session.error
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
exports.sessionHooks = void 0;
exports.logToFile = logToFile;
exports.saveContext = saveContext;
exports.loadContext = loadContext;
exports.logError = logError;
exports.onSessionCreated = onSessionCreated;
exports.onSessionIdle = onSessionIdle;
exports.onSessionCompacted = onSessionCompacted;
exports.onSessionError = onSessionError;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const state_machine_1 = require("./state-machine");
const pre_flight_1 = require("./pre-flight");
const LOGS_DIR = ".opencode/logs";
const ERROR_LOG_FILE = `${LOGS_DIR}/errors.json`;
const LOG_FILE = `${LOGS_DIR}/plugin.log`;
const LOG_ENABLED = true; // Включить/выключить логирование
const DEBUG_LOG_FILE = `${LOGS_DIR}/debug.json`;
// Логирование в файл (тихое)
function logToFile(message, type = "info") {
    if (!LOG_ENABLED && type === "info")
        return;
    try {
        const logsDir = path.join(process.cwd(), LOGS_DIR);
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }
        const logFilePath = path.join(process.cwd(), type === "debug" ? DEBUG_LOG_FILE : LOG_FILE);
        const entry = `[${new Date().toISOString()}] [${type.toUpperCase()}] ${message}\n`;
        if (type === "debug") {
            fs.appendFileSync(logFilePath, JSON.stringify({ ts: new Date().toISOString(), msg: message }) + "\n");
        }
        else {
            fs.appendFileSync(logFilePath, entry);
        }
    }
    catch {
        // Silent fail
    }
}
// Сохранение контекста сессии
async function saveContext(directory, context) {
    try {
        const opencodeDir = path.join(directory, ".opencode");
        if (!fs.existsSync(opencodeDir)) {
            fs.mkdirSync(opencodeDir, { recursive: true });
        }
        const filePath = path.join(opencodeDir, "session-context.json");
        const existing = loadContext(directory);
        const merged = {
            state: state_machine_1.stateMachine.getCurrentState(),
            savedAt: new Date().toISOString(),
            history: [],
            ...existing,
            ...context
        };
        fs.writeFileSync(filePath, JSON.stringify(merged, null, 2));
        logToFile(`Context saved to ${filePath}`);
    }
    catch (e) {
        logToFile(`Failed to save context: ${e}`, "error");
    }
}
// Загрузка контекста сессии
function loadContext(directory) {
    try {
        const filePath = path.join(directory, ".opencode", "session-context.json");
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, "utf-8"));
        }
    }
    catch {
        // Silent fail
    }
    return null;
}
// Логирование ошибки сессии
function logError(directory, error, context) {
    try {
        const logsDir = path.join(directory, LOGS_DIR);
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }
        const errorFilePath = path.join(directory, ERROR_LOG_FILE);
        let errors = [];
        if (fs.existsSync(errorFilePath)) {
            errors = JSON.parse(fs.readFileSync(errorFilePath, "utf-8"));
        }
        errors.push({
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            context
        });
        // Храним только последние 50 ошибок
        if (errors.length > 50) {
            errors = errors.slice(-50);
        }
        fs.writeFileSync(errorFilePath, JSON.stringify(errors, null, 2));
        logToFile(`Error logged: ${error.message}`, "error");
    }
    catch {
        // Silent fail
    }
}
// Обработчик session.created
async function onSessionCreated($, directory, client) {
    try {
        logToFile("=== onSessionCreated START ===", "debug");
        // Проверка git ДО ВСЕГО
        logToFile("Проверка наличия .git...", "debug");
        const hasGit = await $.command `test -d ${directory}/.git && echo "yes"`.text();
        logToFile(`hasGit = "${hasGit.trim()}"`, "debug");
        const errors = [];
        // Проверка и инициализация git ДО Pre-Flight
        if (hasGit.trim() !== "yes") {
            await client.session.prompt({
                body: `🔧 Git репозиторий не найден. Запускаю инициализацию проекта...`
            });
            await $.task({
                subagent_type: "project-initializer",
                prompt: `Инициализируй проект в директории ${directory}. Создай .gitignore, README.`
            });
        }
        // Pre-Flight проверки ПОСЛЕ инициализации
        logToFile("Запуск Pre-Flight...", "debug");
        const preFlightResult = await pre_flight_1.preFlight.run($, directory);
        logToFile(`Pre-Flight result: success=${preFlightResult.success}, passed=${preFlightResult.passed}`, "debug");
        if (!preFlightResult.success) {
            errors.push(...preFlightResult.errors);
            await client.session.prompt({
                body: `❌ Pre-Flight проверки не пройдены:\n${preFlightResult.errors.join("\n")}\n\nПроверьте готовность проекта перед началом работы.`
            });
            return { success: false, errors };
        }
        // Определение состояния проекта
        logToFile("Определение состояния проекта...", "debug");
        const projectState = await state_machine_1.stateMachine.getState($, directory);
        logToFile(`State определен: ${projectState.code}`, "debug");
        await client.session.prompt({
            body: `✅ Pre-Flight проверки пройдены (${preFlightResult.passed}/${preFlightResult.passed + preFlightResult.failed})

Состояние проекта: ${projectState.code} (${projectState.description})

Разрешённые агенты: ${projectState.allowedAgents.join(", ")}`
        });
        // Инициализация контекста
        await saveContext(directory, {
            state: projectState.code
        });
        // Автоматический вызов агента на основе state
        logToFile(`Вызов autoDelegateAgent для state=${projectState.code}`, "debug");
        await autoDelegateAgent($, client, projectState.code, directory);
        logToFile("=== onSessionCreated END ===", "debug");
        return { success: true, errors: [] };
    }
    catch (e) {
        logToFile(`ОШИБКА в onSessionCreated: ${e.message}`, "error");
        return { success: false, errors: [e.message] };
    }
}
// Автоматический вызов агента по state
async function autoDelegateAgent($, client, state, directory) {
    logToFile(`=== autoDelegateAgent START: State=${state} ===`, "debug");
    const agentsByState = {
        0: {
            type: "constitution-agent",
            prompt: `Создай конституцию проекта на основе TZ.md в директории ${directory}. Используй шаблон конституции.`
        },
        10: {
            type: "specify-agent",
            prompt: `Создай спецификации модулей на основе CONSTITUTION.md в директории ${directory}.`
        },
        20: {
            type: "plan-agent",
            prompt: `Создай план реализации на основе specs/ в директории ${directory}.`
        },
        30: {
            type: "tasks-agent",
            prompt: `Создай список задач на основе PLAN.md в директории ${directory}.`
        }
    };
    const agentConfig = agentsByState[state];
    logToFile(`agentConfig для state ${state}: ${JSON.stringify(agentConfig)}`, "debug");
    if (agentConfig) {
        await client.session.prompt({
            body: `🚀 Автоматический переход: state ${state} → вызываю ${agentConfig.type}...`
        });
        logToFile(`Вызов $.task с ${agentConfig.type}`, "debug");
        try {
            await $.task({
                subagent_type: agentConfig.type,
                prompt: agentConfig.prompt
            });
            logToFile(`$.task завершен для ${agentConfig.type}`, "debug");
        }
        catch (e) {
            logToFile(`Ошибка $.task: ${e.message}`, "error");
        }
    }
    else {
        logToFile(`Нет agentConfig для state ${state}, пропускаем`, "debug");
    }
}
// Обработчик session.idle
async function onSessionIdle(directory, client) {
    // Сохраняем текущее состояние
    const currentState = state_machine_1.stateMachine.getCurrentState();
    await saveContext(directory, {
        state: currentState
    });
    await client.session.prompt({
        body: `💾 Контекст сессии сохранён.\n\nТекущее состояние: ${currentState}`
    });
}
// Обработчик session.compacted
async function onSessionCompacted(directory, client) {
    // Восстанавливаем контекст
    const context = loadContext(directory);
    if (context) {
        state_machine_1.stateMachine.setState(context.state);
        await client.session.prompt({
            body: `♻️ Контекст восстановлен.\n\nСостояние: ${context.state}\nПоследняя задача: ${context.lastTaskId || "нет"}\nПоследний агент: ${context.lastAgent || "нет"}`
        });
    }
    else {
        await client.session.prompt({
            body: `⚠️ Контекст не найден. Начинаю с чистого состояния.`
        });
    }
}
// Обработчик session.error
async function onSessionError(directory, error, context) {
    logError(directory, error, context);
}
exports.sessionHooks = {
    saveContext,
    loadContext,
    logError,
    onSessionCreated,
    onSessionIdle,
    onSessionCompacted,
    onSessionError
};
exports.default = exports.sessionHooks;
