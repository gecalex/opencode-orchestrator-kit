// Метапрограммирование агентов
// Динамическое создание агентов на основе шаблонов и futures-агентов

interface AgentTemplate {
  name: string;
  description: string;
  tools: string[];
  promptTemplate: string;
}

interface DynamicAgent {
  name: string;
  description: string;
  createdAt: string;
  template?: string;
}

interface FuturesAgent {
  capability: string;
  status: "needed" | "creating" | "ready";
  createdAgent?: string;
}

// Шаблоны агентов
const AGENT_TEMPLATES: Record<string, AgentTemplate> = {
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
const futuresAgents: Map<string, FuturesAgent> = new Map();

// Реестр динамических агентов
const dynamicAgents: Map<string, DynamicAgent> = new Map();

// Создание агента из шаблона
export function createAgentFromTemplate(templateName: string, customName?: string): DynamicAgent | null {
  const template = AGENT_TEMPLATES[templateName];
  if (!template) {
    console.log(`[MetaAgent] Template ${templateName} not found`);
    return null;
  }

  const agent: DynamicAgent = {
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
export function registerFuturesAgent(capability: string): void {
  if (!futuresAgents.has(capability)) {
    futuresAgents.set(capability, {
      capability,
      status: "needed"
    });
    console.log(`[MetaAgent] Registered futures: ${capability}`);
  }
}

// Создание futures агента
export function createFuturesAgent(capability: string, templateName: string): DynamicAgent | null {
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
export function validateAgentStructure(agent: DynamicAgent): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!agent.name) errors.push("name is required");
  if (!agent.description) errors.push("description is required");
  if (!agent.createdAt) errors.push("createdAt is required");

  return {
    valid: errors.length === 0,
    errors
  };
}

// Получить все шаблоны
export function getTemplates(): string[] {
  return Object.keys(AGENT_TEMPLATES);
}

// Получить динамических агентов
export function getDynamicAgents(): DynamicAgent[] {
  return Array.from(dynamicAgents.values());
}

// Получить futures агенты
export function getFuturesAgents(): FuturesAgent[] {
  return Array.from(futuresAgents.values());
}

// Перезагрузка агента
export function reloadAgent(agentName: string): boolean {
  if (dynamicAgents.has(agentName)) {
    const agent = dynamicAgents.get(agentName)!;
    agent.createdAt = new Date().toISOString();
    dynamicAgents.set(agentName, agent);
    console.log(`[MetaAgent] Reloaded ${agentName}`);
    return true;
  }
  return false;
}

export const metaAgents = {
  createAgentFromTemplate,
  registerFuturesAgent,
  createFuturesAgent,
  validateAgentStructure,
  getTemplates,
  getDynamicAgents,
  getFuturesAgents,
  reloadAgent
};

export default metaAgents;