// Машина состояний проекта с табличным FSM
// Управляет переходами между состояниями и разрешениями агентов/инструментов

import * as fs from "fs";
import * as path from "path";
import type { ProjectStateCode, ProjectState } from "./types";

const STATE_FILE = ".opencode/state.json";
const LOG_FILE = ".opencode/state-log.json";

// Определение состояний (12 фаз workflow)
const STATES: Record<ProjectStateCode, ProjectState> = {
  0: {
    code: 0,
    description: "Инициализация (создан репозиторий, но нет конституции)",
    allowedAgents: ["project-initializer", "constitution-agent"],
    blockedAgents: ["speckit-specify", "speckit-plan", "speckit-tasks", "plan-agent", "tasks-agent", "planning-task-analyzer", "specification-analyst", "work_*", "python-developer", "go-developer", "react-developer", "python-specialist", "go-specialist", "ts-specialist", "devops", "security"],
    allowedTools: ["read", "glob", "grep", "skill", "todowrite", "task", "write", "question"]
  },
  10: {
    code: 10,
    description: "Конституция создана (основные требования и ограничения)",
    allowedAgents: ["project-initializer", "constitution-agent"],
    blockedAgents: ["speckit-specify", "speckit-plan", "speckit-tasks", "plan-agent", "tasks-agent", "planning-task-analyzer", "specification-analyst", "work_*", "python-developer", "go-developer", "react-developer", "python-specialist", "go-specialist", "ts-specialist", "devops", "security"],
    allowedTools: ["read", "glob", "grep", "skill", "todowrite", "task"]
  },
  20: {
    code: 20,
    description: "Спецификации модулей созданы (детальное описание компонентов)",
    allowedAgents: ["project-initializer", "constitution-agent", "specify-agent", "specification-analyst"],
    blockedAgents: ["plan-agent", "tasks-agent", "planning-task-analyzer", "work_*", "python-developer", "go-developer", "react-developer", "python-specialist", "go-specialist", "ts-specialist", "devops", "security"],
    allowedTools: ["read", "glob", "grep", "skill", "todowrite", "task"]
  },
  30: {
    code: 30,
    description: "План реализации готов (оценка усилий, зависимости, риски)",
    allowedAgents: ["project-initializer", "constitution-agent", "specify-agent", "specification-analyst", "plan-agent", "planning-task-analyzer"],
    blockedAgents: ["tasks-agent", "work_*", "python-developer", "go-developer", "react-developer", "python-specialist", "go-specialist", "ts-specialist", "devops", "security"],
    allowedTools: ["run_shell_command", "read_file", "write_file", "glob", "grep_search", "edit", "skill", "todowrite", "task"]
  },
  40: {
    code: 40,
    description: "Задачи разбиты и агенты назначены (готов к выполнению)",
    allowedAgents: ["project-initializer", "constitution-agent", "specify-agent", "specification-analyst", "plan-agent", "tasks-agent", "planning-task-analyzer", "tdd-coordinator"],
    blockedAgents: ["work_*", "python-developer", "go-developer", "react-developer", "python-specialist", "go-specialist", "ts-specialist", "devops", "security"],
    allowedTools: ["run_shell_command", "read_file", "write_file", "glob", "grep_search", "edit", "skill", "todowrite", "task"]
  },
  50: {
    code: 50,
    description: "Тестовая фаза (написание и выполнение тестов)",
    allowedAgents: ["project-initializer", "constitution-agent", "specify-agent", "specification-analyst", "plan-agent", "tasks-agent", "planning-task-analyzer", "tdd-coordinator", "python-specialist", "go-specialist", "ts-specialist"],
    blockedAgents: ["work_*", "python-developer", "go-developer", "react-developer", "devops", "security"],
    allowedTools: ["run_shell_command", "read_file", "write_file", "glob", "grep_search", "edit", "skill", "todowrite", "task"]
  },
  60: {
    code: 60,
    description: "Кодинговая фаза (написание кода под тесты)",
    allowedAgents: ["project-initializer", "constitution-agent", "specify-agent", "specification-analyst", "plan-agent", "tasks-agent", "planning-task-analyzer", "tdd-coordinator", "python-developer", "go-developer", "react-developer"],
    blockedAgents: ["work_*", "devops", "security"],
    allowedTools: ["run_shell_command", "read_file", "write_file", "glob", "grep_search", "edit", "skill", "todowrite", "task"]
  },
  70: {
    code: 70,
    description: "Фаза интеграции (объединение компонентов и системное тестирование)",
    allowedAgents: ["project-initializer", "constitution-agent", "specify-agent", "specification-analyst", "plan-agent", "tasks-agent", "planning-task-analyzer", "tdd-coordinator", "python-developer", "go-developer", "react-developer", "python-specialist", "go-specialist", "ts-specialist", "devops"],
    blockedAgents: ["work_*", "security"],
    allowedTools: ["run_shell_command", "read_file", "write_file", "glob", "grep_search", "edit", "skill", "todowrite", "task"]
  },
  80: {
    code: 80,
    description: "Релиз-готов (все качественные gate пройдены, готово к релизу)",
    allowedAgents: ["project-initializer", "constitution-agent", "specify-agent", "specification-analyst", "plan-agent", "tasks-agent", "planning-task-analyzer", "tdd-coordinator", "python-developer", "go-developer", "react-developer", "python-specialist", "go-specialist", "ts-specialist", "devops", "security"],
    blockedAgents: ["work_*"],
    allowedTools: ["run_shell_command", "read_file", "write_file", "glob", "grep_search", "edit", "skill", "todowrite", "task"]
  },
  90: {
    code: 90,
    description: "Релиз выполнен (версия опубликована в main)",
    allowedAgents: [],
    blockedAgents: ["work_*", "python-developer", "go-developer", "react-developer", "python-specialist", "go-specialist", "ts-specialist", "devops", "security", "constitution-agent", "specify-agent", "specification-analyst", "plan-agent", "tasks-agent", "planning-task-analyzer", "tdd-coordinator"],
    allowedTools: ["read_file", "glob", "grep_search"]
  }
};

// Таблица переходов FSM: from -> to с условием
interface Transition {
  from: ProjectStateCode;
  to: ProjectStateCode;
  condition: (directory: string, $: any) => Promise<boolean>;
  reason: string;
}

// Определение переходов
const TRANSITIONS: Transition[] = [
  {
    from: 0,
    to: 10,
    condition: async () => true, // Всегда при инициализации
    reason: "Создание конституции"
  },
  {
    from: 10,
    to: 20,
    condition: async (_, __) => true, // После создания спецификаций
    reason: "Спецификации созданы"
  },
  {
    from: 20,
    to: 30,
    condition: async (_, __) => true, // После плана
    reason: "План реализации готов"
  },
  {
    from: 30,
    to: 40,
    condition: async (_, __) => true, // После разбивки на задачи
    reason: "Задачи назначены"
  },
  {
    from: 40,
    to: 50,
    condition: async (_, __) => true, // Переход к тестам
    reason: "Переход к тестовой фазе"
  },
  {
    from: 50,
    to: 60,
    condition: async (_, __) => true, // Тесты готовы
    reason: "Тесты пройдены, переход к кодингу"
  },
  {
    from: 60,
    to: 70,
    condition: async (_, __) => true, // Код готов
    reason: "Код реализован"
  },
  {
    from: 70,
    to: 80,
    condition: async (_, __) => true, // Интеграция завершена
    reason: "Интеграция завершена"
  },
  {
    from: 80,
    to: 90,
    condition: async (_, __) => true, // Релиз
    reason: "Релиз выполнен"
  }
];

// Текущее состояние
let currentState: ProjectStateCode = 10;

// История переходов
const stateLog: Array<{from: ProjectStateCode; to: ProjectStateCode; timestamp: string; reason?: string}> = [];

// Логирование перехода
function logTransition(from: ProjectStateCode, to: ProjectStateCode, reason?: string): void {
  const entry = { from, to, timestamp: new Date().toISOString(), reason };
  stateLog.push(entry);
  console.log(`[StateMachine] ${from} -> ${to} ${reason ? `(${reason})` : ""}`);
  
  try {
    fs.writeFileSync(path.join(process.cwd(), LOG_FILE), JSON.stringify(stateLog, null, 2));
  } catch (e) {
    console.error("[StateMachine] Failed to write state log:", e);
  }
}

// Сохранение состояния
function saveState(state: ProjectStateCode, directory: string): void {
  try {
    const statePath = path.join(directory, STATE_FILE);
    const dir = path.dirname(statePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(statePath, JSON.stringify({ state, updatedAt: new Date().toISOString() }, null, 2));
  } catch (e) {
    console.error("[StateMachine] Failed to save state:", e);
  }
}

// Загрузка состояния
function loadState(directory: string): ProjectStateCode | null {
  try {
    const statePath = path.join(directory, STATE_FILE);
    if (fs.existsSync(statePath)) {
      const data = JSON.parse(fs.readFileSync(statePath, "utf-8"));
      return data.state as ProjectStateCode;
    }
  } catch (e) {
    console.error("[StateMachine] Failed to load state:", e);
  }
  return null;
}

// Определение состояния по ФС
async function detectStateFromFS($: any, directory: string): Promise<ProjectStateCode> {
  try {
    // Проверка git инициализации
    const hasGitResult = await $.command`test -d ${directory}/.git && echo "yes"`.text();
    const hasGit = hasGitResult.trim() === "yes";

    // Проверка CONSTITUTION.md (основная конституция)
    const hasConstitutionResult = await $.command`test -f ${directory}/CONSTITUTION.md && echo "yes"`.text();
    const hasConstitution = hasConstitutionResult.trim() === "yes";

    // Проверка specs/ директории (спецификации модулей)
    const hasSpecsResult = await $.command`find ${directory}/specs -type f -name "*.md" 2>/dev/null | head -1`.text();
    const hasSpecs = hasSpecsResult.trim().length > 0;

    // Проверка PLAN.md (план проекта)
    const hasPlanResult = await $.command`test -f ${directory}/PLAN.md && echo "yes"`.text();
    const hasPlan = hasPlanResult.trim() === "yes";

    // Проверка docs/task.md (задачи)
    const hasTasksResult = await $.command`test -f ${directory}/docs/task.md && echo "yes"`.text();
    const hasTasks = hasTasksResult.trim() === "yes";

    // Проверка src/ директории (есть код)
    const hasImplResult = await $.command`find ${directory}/src -type f 2>/dev/null | head -1`.text();
    const hasImpl = hasImplResult.trim().length > 0;

    // Логика определения состояния
    // 40: Есть всё - задачи назначены
    if (hasImpl && hasTasks && hasSpecs && hasConstitution) return 40;
    // 30: Есть план (задачи)
    if (hasImpl && hasTasks && hasSpecs) return 30;
    // 20: Есть спецификации + план
    if (hasSpecs && hasPlan) return 20;
    // 10: Есть конституция
    if (hasConstitution) return 10;
    // 0: Ничего нет или только git
    return 0;
  } catch {
    return 0;
  }
}

// Инициализация
export async function initialize(directory: string): Promise<ProjectState> {
  const saved = loadState(directory);
  // Для нового проекта (нет state.json) — состояние 0
  // Это позволяет использовать все инструменты для анализа и создания конституции
  currentState = saved !== null ? saved : 0;
  saveState(currentState, directory);
  return STATES[currentState];
}

// Получение состояния
export async function getState($: any, directory: string): Promise<ProjectState> {
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
export function getCurrentState(): ProjectStateCode {
  return currentState;
}

// Установить состояние с логированием
export function setState(state: ProjectStateCode, reason?: string): void {
  const from = currentState;
  currentState = state;
  if (from !== state) {
    logTransition(from, state, reason);
  }
}

// Проверить разрешение инструмента
export function isToolAllowed(tool: string, stateCode?: ProjectStateCode): boolean {
  const state = stateCode ?? currentState;
  return STATES[state]?.allowedTools.includes(tool) ?? false;
}

// Проверить разрешение агента
export function isAgentAllowed(agent: string, stateCode?: ProjectStateCode): boolean {
  const state = stateCode ?? currentState;
  const blocked = STATES[state]?.blockedAgents ?? [];
  const allowed = STATES[state]?.allowedAgents ?? [];

  for (const pattern of blocked) {
    if (pattern.includes("*")) {
      const regex = new RegExp("^" + pattern.replace("*", ".*") + "$");
      if (regex.test(agent)) return false;
    } else if (pattern === agent) {
      return false;
    }
  }

  for (const pattern of allowed) {
    if (pattern.includes("*")) {
      const regex = new RegExp("^" + pattern.replace("*", ".*") + "$");
      if (regex.test(agent)) return true;
    } else if (pattern === agent) {
      return true;
    }
  }

  return false;
}

// Получить описание состояния
export function getStateDescription(stateCode: ProjectStateCode): string {
  return STATES[stateCode]?.description ?? "unknown";
}

// Обновить состояние после задачи
export async function updateAfterTask(taskResult: any, directory: string, $: any): Promise<void> {
  if (taskResult?.status === "success") {
    await getState($, directory);
  }
}

// Получить доступные переходы
export function getAvailableTransitions(): Transition[] {
  return TRANSITIONS.filter(t => t.from === currentState);
}

// Попытка перехода
export async function tryTransition(directory: string, $: any, targetState: ProjectStateCode): Promise<boolean> {
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

export const stateMachine = {
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

export default stateMachine;