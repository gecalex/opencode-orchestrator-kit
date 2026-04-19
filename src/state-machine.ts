// Машина состояний проекта с табличным FSM
// Управляет переходами между состояниями и разрешениями агентов/инструментов

import * as fs from "fs";
import * as path from "path";
import type { ProjectStateCode, ProjectState } from "./types";

const STATE_FILE = ".opencode/state.json";
const LOG_FILE = ".opencode/state-log.json";

// Определение состояний (12 фаз workflow)
const STATES: Record<ProjectStateCode, ProjectState> = {
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
let currentState: ProjectStateCode = 1;

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
    // 10: Есть всё - интеграция завершена
    if (hasImpl && hasTasks && hasSpecs && hasConstitution) return 10;
    // 9: Есть код и задачи
    if (hasImpl && hasTasks && hasSpecs) return 9;
    // 8: Есть спецификации + план
    if (hasSpecs && hasPlan) return 8;
    // 7: Есть конституция
    if (hasConstitution) return 7;
    // 3: Есть git (инициализирован)
    return 3;
  } catch {
    return 1;
  }
}

// Инициализация
export async function initialize(directory: string): Promise<ProjectState> {
  const saved = loadState(directory);
  // Для нового проекта (нет state.json) — состояние 1 (пустой проект)
  currentState = saved !== null ? saved : 1;
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