// MCP Registry — Полноценный реестр MCP серверов для OpenCode
// Источник: modelcontextprotocol/servers, awesome-mcp-servers, OpenCode Docs

export interface MCPServerDefinition {
  id: string;
  name: string;
  description: string;
  category: MCPCategory;
  type: "local" | "remote";
  installCommand?: string;
  url?: string;
  auth?: "none" | "oauth" | "api-key" | "env";
  tags: string[];
  language?: string;
}

export type MCPCategory = 
  | "language-server"
  | "database"
  | "search"
  | "filesystem"
  | "git"
  | "browser"
  | "devops"
  | "memory"
  | "communication"
  | "project-management"
  | "code-intelligence"
  | "utility";

export const MCP_REGISTRY: MCPServerDefinition[] = [
  // === Официальные серверы modelcontextprotocol/servers ===
  {
    id: "filesystem",
    name: "Filesystem",
    description: "Безопасные файловые операции с настраиваемым контролем доступа",
    category: "filesystem",
    type: "local",
    installCommand: "npx -y @modelcontextprotocol/server-filesystem {path}",
    tags: ["файлы", "директории"],
    language: "typescript"
  },
  {
    id: "git",
    name: "Git",
    description: "Инструменты для чтения, поиска и манипуляции Git репозиториями",
    category: "git",
    type: "local",
    installCommand: "npx -y @modelcontextprotocol/server-git",
    tags: ["vcs", "версионирование"],
    language: "typescript"
  },
  {
    id: "memory",
    name: "Memory",
    description: "Система постоянной памяти на основе графа знаний",
    category: "memory",
    type: "local",
    installCommand: "npx -y @modelcontextprotocol/server-memory",
    tags: ["память", "контекст"],
    language: "typescript"
  },
  {
    id: "fetch",
    name: "Fetch",
    description: "Получение и преобразование веб-контента для эффективного использования LLM",
    category: "search",
    type: "local",
    installCommand: "npx -y @modelcontextprotocol/server-fetch",
    tags: ["веб", "http"],
    language: "typescript"
  },
  // === Базы данных ===
  {
    id: "postgres",
    name: "PostgreSQL",
    description: "Доступ к базе данных PostgreSQL (только чтение) с инспекцией схемы",
    category: "database",
    type: "local",
    installCommand: "npx -y @modelcontextprotocol/server-postgres",
    tags: ["sql", "база данных"],
    language: "typescript"
  },
  {
    id: "sqlite",
    name: "SQLite",
    description: "Доступ к базе данных SQLite с полной поддержкой чтения-записи",
    category: "database",
    type: "local",
    installCommand: "npx -y @modelcontextprotocol/server-sqlite",
    tags: ["sql", "база данных"],
    language: "typescript"
  },
  // === Поиск ===
  {
    id: "searxng",
    name: "SearXNG",
    description: "Приватный веб-поиск через SearXNG (метапоисковая система)",
    category: "search",
    type: "local",
    installCommand: "npx -y mcp-searxng",
    auth: "env",
    tags: ["поиск", "веб", "приватность"],
    language: "typescript"
  },
  // === Браузерная автоматизация ===
  {
    id: "playwright",
    name: "Playwright",
    description: "Автоматизация браузера и тестирования",
    category: "browser",
    type: "local",
    installCommand: "npx -y @anthropic/mcp-server-playwright",
    tags: ["браузер", "автоматизация", "тестирование"],
    language: "typescript"
  },
  // === DevOps ===
  {
    id: "aws",
    name: "AWS",
    description: "Инструменты для работы с сервисами AWS",
    category: "devops",
    type: "local",
    installCommand: "npx -y aws-mcp-server",
    auth: "env",
    tags: ["aws", "облако"],
    language: "python"
  },
  {
    id: "kubernetes",
    name: "Kubernetes",
    description: "Управление кластерами Kubernetes",
    category: "devops",
    type: "local",
    installCommand: "npx -y @modelcontextprotocol/server-aws-kb-retrieval",
    auth: "env",
    tags: ["k8s", "оркестрация"],
    language: "typescript"
  },
  // === Коммуникация ===
  {
    id: "slack",
    name: "Slack",
    description: "Интеграция с Slack для отправки сообщений и управления каналами",
    category: "communication",
    type: "local",
    installCommand: "npx -y @modelcontextprotocol/server-slack",
    auth: "oauth",
    tags: ["чат", "команда"],
    language: "typescript"
  },
  {
    id: "sentry",
    name: "Sentry",
    description: "Взаимодействие с проектами Sentry и ошибками",
    category: "devops",
    type: "remote",
    url: "https://mcp.sentry.dev/mcp",
    auth: "oauth",
    tags: ["мониторинг", "ошибки"],
    language: "typescript"
  },
  // === Управление проектами ===
  {
    id: "github",
    name: "GitHub",
    description: "Полная интеграция с GitHub API для управления репозиториями",
    category: "git",
    type: "local",
    installCommand: "npx -y @modelcontextprotocol/server-github",
    auth: "env",
    tags: ["github", "vcs"],
    language: "typescript"
  },
  {
    id: "jira",
    name: "Jira",
    description: "Интеграция с Atlassian Jira для управления проектами",
    category: "project-management",
    type: "remote",
    url: "https://jira.example.com/mcp",
    auth: "oauth",
    tags: ["agile", "tasks"],
    language: "typescript"
  },
  // === Поиск документации ===
  {
    id: "context7",
    name: "Context7",
    description: "Поиск по документации через Context7",
    category: "search",
    type: "remote",
    url: "https://mcp.context7.com/mcp",
    auth: "api-key",
    tags: ["документация", "поиск"],
    language: "typescript"
  },
  // === Code Intelligence ===
  {
    id: "in-memoria",
    name: "In Memoria",
    description: "Сервис анализа AST кода — изучает ваш кодстайл",
    category: "code-intelligence",
    type: "local",
    installCommand: "opencode mcp install in-memoria",
    tags: ["ast", "анализ"],
    language: "rust"
  },
  // === Память (OpenCode Ecosystem) ===
  {
    id: "kratos",
    name: "Kratos",
    description: "Постоянная память для OpenCode — сохраняет контекст между сессиями",
    category: "memory",
    type: "local",
    installCommand: "opencode mcp install kratos",
    tags: ["память", "векторная база данных"],
    language: "typescript"
  },
  {
    id: "archon",
    name: "Archon",
    description: "RAG возможности — можно подать PDF документы и API документацию",
    category: "search",
    type: "local",
    installCommand: "opencode mcp install archon",
    tags: ["rag", "документы"],
    language: "typescript"
  },
  // === Supabase ===
  {
    id: "supabase",
    name: "Supabase",
    description: "Полная интеграция с платформой Supabase",
    category: "database",
    type: "local",
    installCommand: "npx -y supabase-mcp-server",
    tags: ["supabase", "postgres"],
    language: "typescript"
  },
  // === Neo4j ===
  {
    id: "neo4j",
    name: "Neo4j",
    description: "База данных графов Neo4j",
    category: "database",
    type: "local",
    installCommand: "npx -y @neo4j/mcp-neo4j",
    tags: ["graph", "база данных"],
    language: "typescript"
  }
];

// === Категории для группировки ===
export const MCP_CATEGORIES: Record<MCPCategory, string> = {
  "language-server": "Языковые серверы",
  "database": "Базы данных",
  "search": "Поиск",
  "filesystem": "Файловая система",
  "git": "Системы контроля версий",
  "browser": "Браузерная автоматизация",
  "devops": "DevOps",
  "memory": "Память",
  "communication": "Коммуникация",
  "project-management": "Управление проектами",
  "code-intelligence": "Анализ кода",
  "utility": "Утилиты"
};

// === Поиск MCP по технологии ===
export function findMCPServersByTechnology(tech: string): MCPServerDefinition[] {
  const techMap: Record<string, MCPCategory[]> = {
    python: ["database", "language-server"],
   typescript: ["language-server", "code-intelligence"],
    javascript: ["language-server", "code-intelligence"],
    go: ["language-server"],
    rust: ["language-server"],
    java: ["language-server"],
    database: ["database"],
    postgres: ["database"],
    mysql: ["database"],
    mongodb: ["database"],
    git: ["git", "filesystem"],
    filesystem: ["filesystem"],
    docker: ["devops"],
    kubernetes: ["devops"],
    aws: ["devops"],
    browser: ["browser"],
    testing: ["browser"],
    documentation: ["search"],
    search: ["search"],
    slack: ["communication"],
    jira: ["project-management"],
    github: ["git"],
    memory: ["memory"],
    ai: ["code-intelligence"]
  };
  
  const categories = techMap[tech.toLowerCase()] || [];
  if (categories.length === 0) return [];
  
  return MCP_REGISTRY.filter(s => categories.includes(s.category));
}

// === Поиск MCP по кате��ор��и ===
export function findMCPServersByCategory(category: MCPCategory): MCPServerDefinition[] {
  return MCP_REGISTRY.filter(s => s.category === category);
}

// === Поиск по тегу ===
export function findMCPServersByTag(tag: string): MCPServerDefinition[] {
  return MCP_REGISTRY.filter(s => 
    s.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
  );
}

// === Получить MCP по ID ===
export function getMCPServer(id: string): MCPServerDefinition | undefined {
  return MCP_REGISTRY.find(s => s.id === id);
}

// === Получить все MCP серверы ===
export function getAllMCPServers(): MCPServerDefinition[] {
  return [...MCP_REGISTRY];
}

// === Получить MCP по категориям ===
export function getMCPServersGroupedByCategory(): Record<MCPCategory, MCPServerDefinition[]> {
  const grouped: Record<MCPCategory, MCPServerDefinition[]> = {} as any;
  
  for (const category of Object.keys(MCP_CATEGORIES)) {
    grouped[category as MCPCategory] = MCP_REGISTRY.filter(s => s.category === category);
  }
  
  return grouped;
}

export const mcpRegistry = {
  getAll: getAllMCPServers,
  getById: getMCPServer,
  getByCategory: findMCPServersByCategory,
  getByTag: findMCPServersByTag,
  getByTech: findMCPServersByTechnology,
  getGroupedByCategory: getMCPServersGroupedByCategory,
  categories: MCP_CATEGORIES
};

export default mcpRegistry;