// Система хуков для событий сессий
// Обрабатывает события session.created, session.idle, session.compacted, session.error

import * as fs from "fs";
import * as path from "path";
import { stateMachine } from "./state-machine";
import { preFlight } from "./pre-flight";

const CONTEXT_FILE = ".opencode/session-context.json";
const ERROR_LOG_FILE = ".opencode/error-log.json";

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

// Сохранение контекста сессии
export async function saveContext(directory: string, context: Partial<SessionContext>): Promise<void> {
  try {
    const filePath = path.join(directory, CONTEXT_FILE);
    const dir = path.dirname(filePath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const existing = loadContext(directory);
    const merged: SessionContext = {
      state: stateMachine.getCurrentState(),
      savedAt: new Date().toISOString(),
      history: [],
      ...existing,
      ...context
    };
    
    fs.writeFileSync(filePath, JSON.stringify(merged, null, 2));
    console.log(`[SessionHooks] Context saved to ${filePath}`);
  } catch (e) {
    console.error("[SessionHooks] Failed to save context:", e);
  }
}

// Загрузка контекста сессии
export function loadContext(directory: string): SessionContext | null {
  try {
    const filePath = path.join(directory, CONTEXT_FILE);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
  } catch (e) {
    console.error("[SessionHooks] Failed to load context:", e);
  }
  return null;
}

// Логирование ошибки сессии
export function logError(directory: string, error: Error, context?: any): void {
  try {
    const filePath = path.join(directory, ERROR_LOG_FILE);
    const dir = path.dirname(filePath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    let errors: SessionError[] = [];
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
  } catch (e) {
    console.error("[SessionHooks] Failed to log error:", e);
  }
}

// Обработчик session.created
export async function onSessionCreated($: any, directory: string, client: any): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = [];
  
  // Pre-Flight проверки
  const preFlightResult = await preFlight.run($, directory);
  
  if (!preFlightResult.success) {
    errors.push(...preFlightResult.errors);
    await client.session.prompt({
      body: `❌ Pre-Flight проверки не пройдены:\n${preFlightResult.errors.join("\n")}\n\nПроверьте готовность проекта перед началом работы.`
    });
    return { success: false, errors };
  }
  
  // Определение состояния проекта
  const projectState = await stateMachine.getState($, directory);
  
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