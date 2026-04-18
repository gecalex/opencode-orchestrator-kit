// TDD Workflow - координация TEST/CODE задач
// Обязательное разделение тестовых и кодовых задач

interface TaskDependency {
  taskId: string;
  testTaskId: string;
  codeTaskId: string;
  testStatus: "pending" | "passed" | "failed";
  codeStatus: "pending" | "waiting" | "passed" | "failed";
}

interface TDDChecks {
  hasTestTask: boolean;
  testPassed: boolean;
  canStartCode: boolean;
}

// Реестр зависимостей TEST → CODE
const taskDependencies: Map<string, TaskDependency> = new Map();

// Регистрация TEST задачи
export function registerTestTask(testTaskId: string, codeTaskId: string): void {
  taskDependencies.set(codeTaskId, {
    taskId: codeTaskId,
    testTaskId,
    codeTaskId,
    testStatus: "pending",
    codeStatus: "waiting"
  });
}

// Обновление статуса TEST задачи
export function updateTestStatus(codeTaskId: string, passed: boolean): void {
  const dep = taskDependencies.get(codeTaskId);
  if (dep) {
    dep.testStatus = passed ? "passed" : "failed";
    if (!passed) {
      dep.codeStatus = "waiting"; // Блокируем код пока тесты не пройдут
    }
  }
}

// Проверка готовности к кодингу
export function canStartCode(codeTaskId: string): TDDChecks {
  const dep = taskDependencies.get(codeTaskId);
  
  if (!dep) {
    return {
      hasTestTask: false,
      testPassed: false,
      canStartCode: false
    };
  }
  
  return {
    hasTestTask: true,
    testPassed: dep.testStatus === "passed",
    canStartCode: dep.codeStatus === "waiting" && dep.testStatus === "passed"
  };
}

// Попытка начать кодовую задачу
export function tryStartCodeTask(codeTaskId: string): { allowed: boolean; reason: string } {
  const dep = taskDependencies.get(codeTaskId);
  
  if (!dep) {
    return { allowed: false, reason: "❌ TEST задача не найдена" };
  }
  
  if (dep.testStatus !== "passed") {
    return { allowed: false, reason: `❌ Сначала пройди TEST (статус: ${dep.testStatus})` };
  }
  
  dep.codeStatus = "pending";
  return { allowed: true, reason: "✅ Можно начинать кодинг" };
}

// Получить связанную TEST задачу
export function getTestTaskId(codeTaskId: string): string | null {
  return taskDependencies.get(codeTaskId)?.testTaskId ?? null;
}

// Список ожидающих задач
export function getPendingTasks(): TaskDependency[] {
  return Array.from(taskDependencies.values()).filter(
    d => d.codeStatus === "waiting"
  );
}

export const tddWorkflow = {
  registerTestTask,
  updateTestStatus,
  canStartCode,
  tryStartCodeTask,
  getTestTaskId,
  getPendingTasks
};

export default tddWorkflow;