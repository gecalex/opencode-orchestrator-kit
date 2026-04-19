// Система хуков для событий сессий
// Обрабатывает события session.created, session.idle, session.compacted, session.error

import * as fs from "fs";
import * as path from "path";
import { stateMachine } from "./state-machine";
import { preFlight } from "./pre-flight";

const LOGS_DIR = ".opencode/logs";
const ERROR_LOG_FILE = `${LOGS_DIR}/errors.json`;
const LOG_FILE = `${LOGS_DIR}/plugin.log`;
const LOG_ENABLED = true; // Включить/выключить логирование
const DEBUG_LOG_FILE = `${LOGS_DIR}/debug.json`;

interface SessionContext {
  state: number;
  lastTaskId?: string;
  lastAgent?: string;
  savedAt: string;
  history: Array<{ tool: string; args: any; timestamp: string }>;
}

interface SessionError {
  error: string;
  stack?: string;
  timestamp: string;
  context?: any;
}

// Логирование в файл (тихое)
export function logToFile(message: string, type: "info" | "debug" | "error" = "info"): void {
  if (!LOG_ENABLED && type === "info") return;
  try {
    const logsDir = path.join(process.cwd(), LOGS_DIR);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    const logFilePath = path.join(process.cwd(), type === "debug" ? DEBUG_LOG_FILE : LOG_FILE);
    const entry = `[${new Date().toISOString()}] [${type.toUpperCase()}] ${message}\n`;
    if (type === "debug") {
      fs.appendFileSync(logFilePath, JSON.stringify({ ts: new Date().toISOString(), msg: message }) + "\n");
    } else {
      fs.appendFileSync(logFilePath, entry);
    }
  } catch {
    // Silent fail
  }
}

// Сохранение контекста сессии
export async function saveContext(directory: string, context: Partial<SessionContext>): Promise<void> {
  try {
    const opencodeDir = path.join(directory, ".opencode");
    if (!fs.existsSync(opencodeDir)) {
      fs.mkdirSync(opencodeDir, { recursive: true });
    }
    
    const filePath = path.join(opencodeDir, "session-context.json");
    const existing = loadContext(directory);
    const merged: SessionContext = {
      state: stateMachine.getCurrentState(),
      savedAt: new Date().toISOString(),
      history: [],
      ...existing,
      ...context
    };
    
    fs.writeFileSync(filePath, JSON.stringify(merged, null, 2));
    logToFile(`Context saved to ${filePath}`);
  } catch (e) {
    logToFile(`Failed to save context: ${e}`, "error");
  }
}

// Загрузка контекста сессии
export function loadContext(directory: string): SessionContext | null {
  try {
    const filePath = path.join(directory, ".opencode", "session-context.json");
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
  } catch {
    // Silent fail
  }
  return null;
}

// Логирование ошибки сессии
export function logError(directory: string, error: Error, context?: any): void {
  try {
    const logsDir = path.join(directory, LOGS_DIR);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    const errorFilePath = path.join(directory, ERROR_LOG_FILE);
    let errors: SessionError[] = [];
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
  } catch {
    // Silent fail
  }
}

// Обработчик session.created
export async function onSessionCreated($: any, directory: string, client: any): Promise<{ success: boolean; errors: string[] }> {
  logToFile("=== onSessionCreated START ===", "debug");

  const errors: string[] = [];

  // Проверка и инициализация git ДО Pre-Flight
  const hasGit = await $.command`test -d ${directory}/.git && echo "yes"`.text();
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
  const preFlightResult = await preFlight.run($, directory);
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
  const projectState = await stateMachine.getState($, directory);
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

// Автоматический вызов агента по state
async function autoDelegateAgent($: any, client: any, state: number, directory: string): Promise<void> {
  logToFile(`=== autoDelegateAgent START: State=${state} ===`, "debug");

  const agentsByState: Record<number, { type: string; prompt: string }> = {
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
      await ($.task as any)({
        subagent_type: agentConfig.type,
        prompt: agentConfig.prompt
      });
      logToFile(`$.task завершен для ${agentConfig.type}`, "debug");
    } catch (e: any) {
      logToFile(`Ошибка $.task: ${e.message}`, "error");
    }
  } else {
    logToFile(`Нет agentConfig для state ${state}, пропускаем`, "debug");
  }
}

// Обработчик session.idle
export async function onSessionIdle(directory: string, client: any): Promise<void> {
  // Сохраняем текущее состояние
  const currentState = stateMachine.getCurrentState();
  await saveContext(directory, {
    state: currentState
  });
  
  await client.session.prompt({
    body: `💾 Контекст сессии сохранён.\n\nТекущее состояние: ${currentState}`
  });
}

// Обработчик session.compacted
export async function onSessionCompacted(directory: string, client: any): Promise<void> {
  // Восстанавливаем контекст
  const context = loadContext(directory);
  
  if (context) {
    stateMachine.setState(context.state as any);
    
    await client.session.prompt({
      body: `♻️ Контекст восстановлен.\n\nСостояние: ${context.state}\nПоследняя задача: ${context.lastTaskId || "нет"}\nПоследний агент: ${context.lastAgent || "нет"}`
    });
  } else {
    await client.session.prompt({
      body: `⚠️ Контекст не найден. Начинаю с чистого состояния.`
    });
  }
}

// Обработчик session.error
export async function onSessionError(directory: string, error: Error, context?: any): Promise<void> {
  logError(directory, error, context);
}

export const sessionHooks = {
  saveContext,
  loadContext,
  logError,
  onSessionCreated,
  onSessionIdle,
  onSessionCompacted,
  onSessionError
};

export default sessionHooks;