// Изолированные сессии рецензирования
// Создание отдельных сессий для проверки артефактов без доступа к коду

interface ReviewSession {
  id: string;
  artifact: string;
  type: "code" | "spec" | "task" | "docs";
  criteria: AcceptanceCriteria[];
  result?: ReviewResult;
  createdAt: string;
}

interface AcceptanceCriteria {
  name: string;
  description: string;
  required: boolean;
}

interface ReviewResult {
  approved: boolean;
  feedback: string;
  issues: string[];
  reviewedAt: string;
}

// Критерии приёмки по типу артефакта
const CRITERIA_BY_TYPE: Record<string, AcceptanceCriteria[]> = {
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
export function createReviewSession(
  artifact: string,
  type: "code" | "spec" | "task" | "docs"
): ReviewSession {
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
export function evaluateCriteria(
  session: ReviewSession,
  results: Record<string, boolean>
): ReviewResult {
  const issues: string[] = [];
  
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
export function getCriteriaForType(type: string): AcceptanceCriteria[] {
  return CRITERIA_BY_TYPE[type] || [];
}

export const reviewSessions = {
  createReviewSession,
  evaluateCriteria,
  getCriteriaForType
};

export default reviewSessions;