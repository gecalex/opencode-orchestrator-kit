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
const CONTEXT_FILE = ".opencode/session-context.json";
const ERROR_LOG_FILE = ".opencode/error-log.json";
// Сохранение контекста сессии
async function saveContext(directory, context) {
    try {
        const filePath = path.join(directory, CONTEXT_FILE);
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const existing = loadContext(directory);
        const merged = {
            state: state_machine_1.stateMachine.getCurrentState(),
            savedAt: new Date().toISOString(),
            history: [],
            ...existing,
            ...context
        };
        fs.writeFileSync(filePath, JSON.stringify(merged, null, 2));
        console.log(`[SessionHooks] Context saved to ${filePath}`);
    }
    catch (e) {
        console.error("[SessionHooks] Failed to save context:", e);
    }
}
// Загрузка контекста сессии
function loadContext(directory) {
    try {
        const filePath = path.join(directory, CONTEXT_FILE);
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, "utf-8"));
        }
    }
    catch (e) {
        console.error("[SessionHooks] Failed to load context:", e);
    }
    return null;
}
// Логирование ошибки сессии
function logError(directory, error, context) {
    try {
        const filePath = path.join(directory, ERROR_LOG_FILE);
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        let errors = [];
        if (fs.existsSync(filePath)) {
            errors = JSON.parse(fs.readFileSync(filePath, "utf-8"));
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
        fs.writeFileSync(filePath, JSON.stringify(errors, null, 2));
        console.log(`[SessionHooks] Error logged: ${error.message}`);
    }
    catch (e) {
        console.error("[SessionHooks] Failed to log error:", e);
    }
}
// Обработчик session.created
async function onSessionCreated($, directory, client) {
    const errors = [];
    // Pre-Flight проверки
    const preFlightResult = await pre_flight_1.preFlight.run($, directory);
    if (!preFlightResult.success) {
        errors.push(...preFlightResult.errors);
        await client.session.prompt({
            body: `❌ Pre-Flight проверки не пройдены:\n${preFlightResult.errors.join("\n")}\n\nПроверьте готовность проекта перед началом работы.`
        });
        return { success: false, errors };
    }
    // Определение состояния проекта
    const projectState = await state_machine_1.stateMachine.getState($, directory);
    await client.session.prompt({
        body: `✅ Pre-Flight проверки пройдены (${preFlightResult.passed}/${preFlightResult.passed + preFlightResult.failed})\n\nСостояние проекта: ${projectState.code} (${projectState.description})\n\nРазрешённые агенты: ${projectState.allowedAgents.join(", ")}`
    });
    // Инициализация контекста
    await saveContext(directory, {
        state: projectState.code
    });
    return { success: true, errors: [] };
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
