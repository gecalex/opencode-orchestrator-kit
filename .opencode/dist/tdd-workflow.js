"use strict";
// TDD Workflow - координация TEST/CODE задач
// Обязательное разделение тестовых и кодовых задач
Object.defineProperty(exports, "__esModule", { value: true });
exports.tddWorkflow = void 0;
exports.registerTestTask = registerTestTask;
exports.updateTestStatus = updateTestStatus;
exports.canStartCode = canStartCode;
exports.tryStartCodeTask = tryStartCodeTask;
exports.getTestTaskId = getTestTaskId;
exports.getPendingTasks = getPendingTasks;
// Реестр зависимостей TEST → CODE
const taskDependencies = new Map();
// Регистрация TEST задачи
function registerTestTask(testTaskId, codeTaskId) {
    taskDependencies.set(codeTaskId, {
        taskId: codeTaskId,
        testTaskId,
        codeTaskId,
        testStatus: "pending",
        codeStatus: "waiting"
    });
}
// Обновление статуса TEST задачи
function updateTestStatus(codeTaskId, passed) {
    const dep = taskDependencies.get(codeTaskId);
    if (dep) {
        dep.testStatus = passed ? "passed" : "failed";
        if (!passed) {
            dep.codeStatus = "waiting"; // Блокируем код пока тесты не пройдут
        }
    }
}
// Проверка готовности к кодингу
function canStartCode(codeTaskId) {
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
function tryStartCodeTask(codeTaskId) {
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
function getTestTaskId(codeTaskId) {
    return taskDependencies.get(codeTaskId)?.testTaskId ?? null;
}
// Список ожидающих задач
function getPendingTasks() {
    return Array.from(taskDependencies.values()).filter(d => d.codeStatus === "waiting");
}
exports.tddWorkflow = {
    registerTestTask,
    updateTestStatus,
    canStartCode,
    tryStartCodeTask,
    getTestTaskId,
    getPendingTasks
};
exports.default = exports.tddWorkflow;
