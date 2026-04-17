// Модуль утверждения пользователя
// Запрос подтверждения у пользователя перед выполнением действий

export interface ApprovalRequest {
  title: string;
  message: string;
  actions: string[];
  defaultAction?: string;
}

// Формирование запроса на утверждение
export function formatApprovalRequest(request: ApprovalRequest): string {
  let output = `**${request.title}**\n\n${request.message}\n\n`;
  
  output += "Доступные действия:\n";
  request.actions.forEach((action, i) => {
    output += `${i + 1}. ${action}\n`;
  });
  
  if (request.defaultAction) {
    output += `\nПо умолчанию: ${request.defaultAction}`;
  }
  
  output += "\n\nОтветьте номером или названием действия.";
  
  return output;
}

// Предложение следующего шага
export function suggestNextStep(
  currentPhase: string,
  nextAgent: string,
  task: string
): string {
  return `✅ Фаза "${currentPhase}" завершена!

Следующий шаг: ${nextAgent}

Выполню:
\`\`\`
task '{
  "subagent_type": "${nextAgent}",
  "prompt": "${task}"
}'
\`\`\`

Продолжить? (да/нет)`;
}

// Запрос подтверждения выполнения агента
export function requestAgentConfirmation(agentName: string, taskDescription: string): string {
  return `Запустить агента **${agentName}**?

Задача: ${taskDescription}

Подтвердите (да/нет)`;
}

// Предложение выбора из списка
export function formatSelectionPrompt(
  title: string,
  options: string[]
): string {
  let output = `**${title}**\n\n`;
  
  options.forEach((option, i) => {
    output += `${i + 1}. ${option}\n`;
  });
  
  output += "\nВыберите вариант (введите номер):";
  
  return output;
}

// Обработка ответа "да/нет"
export function parseYesNoResponse(response: string): boolean | null {
  const normalized = response.toLowerCase().trim();
  
  if (['да', 'yes', 'y', '1', 'true'].includes(normalized)) {
    return true;
  }
  
  if (['нет', 'no', 'n', '0', 'false'].includes(normalized)) {
    return false;
  }
  
  return null;
}

// Обработка числового выбора
export function parseSelection(response: string, maxIndex: number): number | null {
  const num = parseInt(response.trim(), 10);
  
  if (isNaN(num) || num < 1 || num > maxIndex) {
    return null;
  }
  
  return num - 1; // Конвертируем в 0-based индекс
}

export const userApproval = {
  formatApprovalRequest,
  suggestNextStep,
  requestAgentConfirmation,
  formatSelectionPrompt,
  parseYesNoResponse,
  parseSelection
};

export default userApproval;