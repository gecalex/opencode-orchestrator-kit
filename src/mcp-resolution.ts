// MCP Dynamic Resolution System
// Автоматический поиск, установка и настройка MCP серверов по технологиям проекта

import * as fs from "fs";
import * as path from "path";
import { MCP_REGISTRY, mcpRegistry, type MCPServerDefinition } from "./mcp-registry";

interface MCPConfig {
  name: string;
  type: string;
  version?: string;
  installed: boolean;
  configured: boolean;
  lastUsed?: string;
}

interface MCPSearchResult {
  name: string;
  type: string;
  description: string;
  installCommand: string;
}

// Карта технологий к MCP серверам — использует реестр
const TECH_MAPPING: Record<string, MCPSearchResult[]> = {
  python: [
    { name: "python-langserver", type: "language-server", description: "Python LSP", installCommand: "pip install python-langserver" },
    { name: "pytest-server", type: "testing", description: "Pytest integration", installCommand: "pip install mcp-pytest" }
  ],
  typescript: [
    { name: "typescript-language-server", type: "language-server", description: "TS/JS LSP", installCommand: "npm install -g typescript-language-server" },
    { name: "prettier", type: "formatter", description: "Code formatter", installCommand: "npm install -g prettier" }
  ],
  go: [
    { name: "gopls", type: "language-server", description: "Go LSP", installCommand: "go install golang.org/x/tools/gopls@latest" }
  ],
  react: [
    { name: "react-devtools", type: "debugger", description: "React debugging", installCommand: "npm install -g react-devtools" }
  ],
  docker: [
    { name: "docker-langserver", type: "container", description: "Docker LSP", installCommand: "docker pull ruff/docker-langserver" }
  ],
  kubernetes: [
    { name: "kubernetes-langserver", type: "k8s", description: "K8s LSP", installCommand: "kubectl krew install langserver" }
  ]
};

// Кеш установленных MCP
const mcpCache: Map<string, MCPConfig> = new Map();
const CACHE_FILE = ".opencode/mcp-cache.json";

// Загрузка кеша
export function loadCache(directory: string): void {
  try {
    const cachePath = path.join(directory, CACHE_FILE);
    if (fs.existsSync(cachePath)) {
      const data = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
      Object.entries(data).forEach(([key, value]) => {
        mcpCache.set(key, value as MCPConfig);
      });
    }
  } catch (e) {
    console.error("[MCP] Failed to load cache:", e);
  }
}

// Сохранение кеша
export function saveCache(directory: string): void {
  try {
    const cachePath = path.join(directory, CACHE_FILE);
    const dir = path.dirname(cachePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const data = Object.fromEntries(mcpCache);
    fs.writeFileSync(cachePath, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("[MCP] Failed to save cache:", e);
  }
}

// Определение технологий проекта
export function detectTechnologies($: any, directory: string): string[] {
  const techs: string[] = [];

  // Python
  if (fs.existsSync(path.join(directory, "requirements.txt")) ||
      fs.existsSync(path.join(directory, "pyproject.toml"))) {
    techs.push("python");
  }

  // TypeScript/JavaScript
  if (fs.existsSync(path.join(directory, "package.json"))) {
    techs.push("typescript");
    techs.push("javascript");
  }

  // Go
  if (fs.existsSync(path.join(directory, "go.mod"))) {
    techs.push("go");
  }

  // Docker
  if (fs.existsSync(path.join(directory, "Dockerfile")) ||
      fs.existsSync(path.join(directory, "docker-compose.yml"))) {
    techs.push("docker");
  }

  // Kubernetes
  if (fs.existsSync(path.join(directory, "k8s")) ||
      fs.existsSync(path.join(directory, "kubernetes"))) {
    techs.push("kubernetes");
  }

  console.log("[MCP] Detected technologies:", techs.join(", "));
  return techs;
}

// Поиск MCP серверов для технологии — использует реестр
export function searchMCPServers(technology: string): MCPServerDefinition[] {
  return mcpRegistry.getByTech(technology);
}

// Установка MCP сервера
export async function installMCPServer($: any, serverName: string, installCommand: string): Promise<{ success: boolean; error?: string }> {
  console.log(`[MCP] Installing ${serverName}...`);

  try {
    const result = await $.command`${installCommand} 2>&1`.exitCode();

    if (result === 0) {
      mcpCache.set(serverName, {
        name: serverName,
        type: "installed",
        installed: true,
        configured: false
      });
      console.log(`[MCP] ✓ ${serverName} installed`);
      return { success: true };
    } else {
      return { success: false, error: `Exit code: ${result}` };
    }
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// Настройка MCP сервера
export function configureMcpServer(serverName: string, config: Record<string, any>): void {
  const existing = mcpCache.get(serverName);
  if (existing) {
    existing.configured = true;
    mcpCache.set(serverName, existing);
  }
}

// Получить статус MCP
export function getMCPStatus(serverName: string): MCPConfig | undefined {
  return mcpCache.get(serverName);
}

// Список установленных MCP
export function getInstalledMCPs(): MCPConfig[] {
  return Array.from(mcpCache.values()).filter(m => m.installed);
}

// Валидация работоспособности
export async function validateMCP($: any, serverName: string): Promise<boolean> {
  try {
    const result = await $.command`${serverName} --version 2>&1`.exitCode();
    return result === 0;
  } catch {
    return false;
  }
}

// Получить все MCP из реестра
export function getAllMCPRegistry(): MCPServerDefinition[] {
  return mcpRegistry.getAll();
}

// Поиск по категории
export function searchByCategory(category: string) {
  return mcpRegistry.getByCategory(category as any);
}

// Поиск по тегу
export function searchByTag(tag: string) {
  return mcpRegistry.getByTag(tag);
}

// Получить категории
export function getCategories() {
  return mcpRegistry.categories;
}

export const mcpResolution = {
  loadCache,
  saveCache,
  detectTechnologies,
  searchMCPServers,
  installMCPServer,
  configureMcpServer,
  getMCPStatus,
  getInstalledMCPs,
  validateMCP,
  getAllMCPRegistry,
  searchByCategory,
  searchByTag,
  getCategories
};

export default mcpResolution;