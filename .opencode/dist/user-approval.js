"use strict";
// Модуль утверждения пользователя
// Запрос подтверждения у пользователя перед выполнением действий
Object.defineProperty(exports, "__esModule", { value: true });
exports.userApproval = void 0;
exports.formatApprovalRequest = formatApprovalRequest;
exports.suggestNextStep = suggestNextStep;
exports.requestAgentConfirmation = requestAgentConfirmation;
exports.formatSelectionPrompt = formatSelectionPrompt;
exports.parseYesNoResponse = parseYesNoResponse;
exports.parseSelection = parseSelection;
// Формирование запроса на утверждение
function formatApprovalRequest(request) {
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
function suggestNextStep(currentPhase, nextAgent, task) {
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
function requestAgentConfirmation(agentName, taskDescription) {
    return `Запустить агента **${agentName}**?

Задача: ${taskDescription}

Подтвердите (да/нет)`;
}
// Предложение выбора из списка
function formatSelectionPrompt(title, options) {
    let output = `**${title}**\n\n`;
    options.forEach((option, i) => {
        output += `${i + 1}. ${option}\n`;
    });
    output += "\nВыберите вариант (введите номер):";
    return output;
}
// Обработка ответа "да/нет"
function parseYesNoResponse(response) {
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
function parseSelection(response, maxIndex) {
    const num = parseInt(response.trim(), 10);
    if (isNaN(num) || num < 1 || num > maxIndex) {
        return null;
    }
    return num - 1; // Конвертируем в 0-based индекс
}
exports.userApproval = {
    formatApprovalRequest,
    suggestNextStep,
    requestAgentConfirmation,
    formatSelectionPrompt,
    parseYesNoResponse,
    parseSelection
};
exports.default = exports.userApproval;
