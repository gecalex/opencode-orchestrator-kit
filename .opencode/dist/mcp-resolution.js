"use strict";
// MCP Dynamic Resolution System
// Автоматический поиск, установка и настройка MCP серверов по технологиям проекта
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.mcpResolution = void 0;
exports.loadCache = loadCache;
exports.saveCache = saveCache;
exports.detectTechnologies = detectTechnologies;
exports.searchMCPServers = searchMCPServers;
exports.installMCPServer = installMCPServer;
exports.configureMcpServer = configureMcpServer;
exports.getMCPStatus = getMCPStatus;
exports.getInstalledMCPs = getInstalledMCPs;
exports.validateMCP = validateMCP;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Карта технологий к MCP серверам
const TECH_MAPPING = {
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
const mcpCache = new Map();
const CACHE_FILE = ".opencode/mcp-cache.json";
// Загрузка кеша
function loadCache(directory) {
    try {
        const cachePath = path.join(directory, CACHE_FILE);
        if (fs.existsSync(cachePath)) {
            const data = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
            Object.entries(data).forEach(([key, value]) => {
                mcpCache.set(key, value);
            });
        }
    }
    catch (e) {
        console.error("[MCP] Failed to load cache:", e);
    }
}
// Сохранение кеша
function saveCache(directory) {
    try {
        const cachePath = path.join(directory, CACHE_FILE);
        const dir = path.dirname(cachePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const data = Object.fromEntries(mcpCache);
        fs.writeFileSync(cachePath, JSON.stringify(data, null, 2));
    }
    catch (e) {
        console.error("[MCP] Failed to save cache:", e);
    }
}
// Определение технологий проекта
function detectTechnologies($, directory) {
    const techs = [];
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
// Поиск MCP серверов для технологии
function searchMCPServers(technology) {
    return TECH_MAPPING[technology] || [];
}
// Установка MCP сервера
async function installMCPServer($, serverName, installCommand) {
    console.log(`[MCP] Installing ${serverName}...`);
    try {
        const result = await $.command `${installCommand} 2>&1`.exitCode();
        if (result === 0) {
            mcpCache.set(serverName, {
                name: serverName,
                type: "installed",
                installed: true,
                configured: false
            });
            console.log(`[MCP] ✓ ${serverName} installed`);
            return { success: true };
        }
        else {
            return { success: false, error: `Exit code: ${result}` };
        }
    }
    catch (e) {
        return { success: false, error: String(e) };
    }
}
// Настройка MCP сервера
function configureMcpServer(serverName, config) {
    const existing = mcpCache.get(serverName);
    if (existing) {
        existing.configured = true;
        mcpCache.set(serverName, existing);
    }
}
// Получить статус MCP
function getMCPStatus(serverName) {
    return mcpCache.get(serverName);
}
// Список установленных MCP
function getInstalledMCPs() {
    return Array.from(mcpCache.values()).filter(m => m.installed);
}
// Валидация работоспособности
async function validateMCP($, serverName) {
    try {
        const result = await $.command `${serverName} --version 2>&1`.exitCode();
        return result === 0;
    }
    catch {
        return false;
    }
}
exports.mcpResolution = {
    loadCache,
    saveCache,
    detectTechnologies,
    searchMCPServers,
    installMCPServer,
    configureMcpServer,
    getMCPStatus,
    getInstalledMCPs,
    validateMCP
};
exports.default = exports.mcpResolution;
