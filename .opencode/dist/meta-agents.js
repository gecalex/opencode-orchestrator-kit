"use strict";
// Метапрограммирование агентов
// Динамическое создание агентов на основе шаблонов и futures-агентов
Object.defineProperty(exports, "__esModule", { value: true });
exports.metaAgents = void 0;
exports.createAgentFromTemplate = createAgentFromTemplate;
exports.registerFuturesAgent = registerFuturesAgent;
exports.createFuturesAgent = createFuturesAgent;
exports.validateAgentStructure = validateAgentStructure;
exports.getTemplates = getTemplates;
exports.getDynamicAgents = getDynamicAgents;
exports.getFuturesAgents = getFuturesAgents;
exports.reloadAgent = reloadAgent;
// Шаблоны агентов
const AGENT_TEMPLATES = {
    "python-tdd": {
        name: "python-tdd",
        description: "Python TDD разработка",
        tools: ["write", "edit", "bash", "read", "glob", "grep", "skill", "todowrite", "task"],
        promptTemplate: "Ты Python разработчик. Пишешь тесты → код → рефакторинг. Используй pytest."
    },
    "code-reviewer": {
        name: "code-reviewer",
        description: "Рецензирование кода",
        tools: ["read", "glob", "grep", "bash"],
        promptTemplate: "Ты reviewer. Проверяешь качество, безопасность, тесты."
    },
    "docs-writer": {
        name: "docs-writer",
        description: "Написание документации",
        tools: ["write", "read", "glob"],
        promptTemplate: "Ты technical writer. Пишешь документацию в Markdown."
    }
};
// Futures агенты (отслеживание недостающих возможностей)
const futuresAgents = new Map();
// Реестр динамических агентов
const dynamicAgents = new Map();
// Создание агента из шаблона
function createAgentFromTemplate(templateName, customName) {
    const template = AGENT_TEMPLATES[templateName];
    if (!template) {
        console.log(`[MetaAgent] Template ${templateName} not found`);
        return null;
    }
    const agent = {
        name: customName || template.name,
        description: template.description,
        createdAt: new Date().toISOString(),
        template: templateName
    };
    dynamicAgents.set(agent.name, agent);
    console.log(`[MetaAgent] Created ${agent.name} from ${templateName}`);
    return agent;
}
// Регистрация futures агента
function registerFuturesAgent(capability) {
    if (!futuresAgents.has(capability)) {
        futuresAgents.set(capability, {
            capability,
            status: "needed"
        });
        console.log(`[MetaAgent] Registered futures: ${capability}`);
    }
}
// Создание futures агента
function createFuturesAgent(capability, templateName) {
    const futures = futuresAgents.get(capability);
    if (!futures) {
        return null;
    }
    const agent = createAgentFromTemplate(templateName, `${capability}-agent`);
    if (agent) {
        futures.status = "ready";
        futures.createdAgent = agent.name;
        futuresAgents.set(capability, futures);
    }
    return agent;
}
// Проверка структуры агента
function validateAgentStructure(agent) {
    const errors = [];
    if (!agent.name)
        errors.push("name is required");
    if (!agent.description)
        errors.push("description is required");
    if (!agent.createdAt)
        errors.push("createdAt is required");
    return {
        valid: errors.length === 0,
        errors
    };
}
// Получить все шаблоны
function getTemplates() {
    return Object.keys(AGENT_TEMPLATES);
}
// Получить динамических агентов
function getDynamicAgents() {
    return Array.from(dynamicAgents.values());
}
// Получить futures агенты
function getFuturesAgents() {
    return Array.from(futuresAgents.values());
}
// Перезагрузка агента
function reloadAgent(agentName) {
    if (dynamicAgents.has(agentName)) {
        const agent = dynamicAgents.get(agentName);
        agent.createdAt = new Date().toISOString();
        dynamicAgents.set(agentName, agent);
        console.log(`[MetaAgent] Reloaded ${agentName}`);
        return true;
    }
    return false;
}
exports.metaAgents = {
    createAgentFromTemplate,
    registerFuturesAgent,
    createFuturesAgent,
    validateAgentStructure,
    getTemplates,
    getDynamicAgents,
    getFuturesAgents,
    reloadAgent
};
exports.default = exports.metaAgents;
