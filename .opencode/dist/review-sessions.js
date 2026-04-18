"use strict";
// Изолированные сессии рецензирования
// Создание отдельных сессий для проверки артефактов без доступа к коду
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewSessions = void 0;
exports.createReviewSession = createReviewSession;
exports.evaluateCriteria = evaluateCriteria;
exports.getCriteriaForType = getCriteriaForType;
// Критерии приёмки по типу артефакта
const CRITERIA_BY_TYPE = {
    code: [
        { name: "syntax", description: "Код компилируется без ошибок", required: true },
        { name: "tests", description: "Есть тесты для новой функциональности", required: true },
        { name: "coverage", description: "Покрытие тестами ≥ 80%", required: false },
        { name: "docs", description: "Есть документация к API", required: false },
        { name: "security", description: "Нет hardcoded secrets", required: true }
    ],
    spec: [
        { name: "completeness", description: "Все требования покрыты", required: true },
        { name: "consistency", description: "Нет противоречий между модулями", required: true },
        { name: "feasibility", description: "Реализуемо в рамках стека", required: true }
    ],
    task: [
        { name: "description", description: "Чёткое описание задачи", required: true },
        { name: "acceptance", description: "Критерии приёмки определены", required: true },
        { name: "estimatable", description: "Задача оцениваема (≤ 8ч)", required: true }
    ],
    docs: [
        { name: "clarity", description: "Изложение понятно", required: true },
        { name: "accuracy", description: "Информация корректна", required: true },
        { name: "completeness", description: "Все разделы заполнены", required: false }
    ]
};
// Создание сессии рецензирования
function createReviewSession(artifact, type) {
    const id = `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return {
        id,
        artifact,
        type,
        criteria: CRITERIA_BY_TYPE[type] || [],
        createdAt: new Date().toISOString()
    };
}
// Проверка критериев
function evaluateCriteria(session, results) {
    const issues = [];
    for (const criterion of session.criteria) {
        if (criterion.required && !results[criterion.name]) {
            issues.push(`❌ ${criterion.name}: ${criterion.description}`);
        }
    }
    const approved = session.criteria
        .filter(c => c.required)
        .every(c => results[c.name] === true);
    return {
        approved,
        feedback: approved
            ? "✅ Артефакт одобрен"
            : "❌ Артефакт требует доработки",
        issues,
        reviewedAt: new Date().toISOString()
    };
}
// Получить критерии для типа
function getCriteriaForType(type) {
    return CRITERIA_BY_TYPE[type] || [];
}
exports.reviewSessions = {
    createReviewSession,
    evaluateCriteria,
    getCriteriaForType
};
exports.default = exports.reviewSessions;
