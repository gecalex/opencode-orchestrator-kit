"use strict";
// Quality Gates — контрольные точки качества
// 5 ворот: Pre-Execution, Post-Execution, Pre-Commit, Pre-Merge, Pre-Implementation
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
exports.qualityGates = void 0;
exports.preExecution = preExecution;
exports.postExecution = postExecution;
exports.preCommit = preCommit;
exports.preMerge = preMerge;
exports.preImplementation = preImplementation;
exports.mcpCheck = mcpCheck;
// Определение языков проекта
async function detectLanguages($, directory) {
    const languages = [];
    try {
        const hasPython = await $.command `ls ${directory}/*.py 2>/dev/null | head -1`.text();
        if (hasPython.trim())
            languages.push("python");
        const hasTs = await $.command `ls ${directory}/*.ts 2>/dev/null | head -1`.text();
        if (hasTs.trim())
            languages.push("typescript");
        const hasJs = await $.command `ls ${directory}/*.js 2>/dev/null | head -1`.text();
        if (hasJs.trim())
            languages.push("javascript");
        const hasGo = await $.command `ls ${directory}/go.mod 2>/dev/null | head -1`.text();
        if (hasGo.trim())
            languages.push("go");
    }
    catch {
        // Игнорируем ошибки
    }
    return languages;
}
// Gate 1: Pre-Execution — проверка корректности задачи
async function preExecution(taskInput) {
    const checks = [
        {
            name: "Задача определена",
            passed: !!taskInput?.prompt,
            message: taskInput?.prompt ? "OK" : "Промпт задачи пуст"
        },
        {
            name: "Агент указан",
            passed: !!taskInput?.subagent_type,
            message: taskInput?.subagent_type ? "OK" : "Агент не указан"
        }
    ];
    return {
        passed: checks.every(c => c.passed),
        gate: 1,
        checks
    };
}
// Gate 2: Post-Execution — верификация результата
async function postExecution(taskOutput) {
    const checks = [
        {
            name: "Задача выполнена",
            passed: taskOutput?.status === "success",
            message: taskOutput?.status === "success" ? "OK" : "Статус: " + taskOutput?.status
        },
        {
            name: "Есть результат",
            passed: !!taskOutput?.result,
            message: taskOutput?.result ? "OK" : "Результат пуст"
        }
    ];
    return {
        passed: checks.every(c => c.passed),
        gate: 2,
        checks
    };
}
// Gate 3: Pre-Commit — валидация перед коммитом
async function preCommit($, directory) {
    const languages = await detectLanguages($, directory);
    const checks = [];
    // Python проверка
    if (languages.includes("python")) {
        try {
            const result = await $.command `python -m py_compile ${directory}/*.py 2>&1`.exitCode();
            checks.push({
                name: "Python синтаксис",
                passed: result === 0,
                message: result === 0 ? "OK" : "Ошибка компиляции"
            });
        }
        catch {
            checks.push({ name: "Python синтаксис", passed: false, message: "Не удалось проверить" });
        }
    }
    // TypeScript проверка
    if (languages.includes("typescript")) {
        try {
            const result = await $.command `cd ${directory} && npx tsc --noEmit 2>&1`.exitCode();
            checks.push({
                name: "TypeScript синтаксис",
                passed: result === 0,
                message: result === 0 ? "OK" : "Ошибка типизации"
            });
        }
        catch {
            checks.push({ name: "TypeScript синтаксис", passed: false, message: "Не удалось проверить" });
        }
    }
    // Go проверка
    if (languages.includes("go")) {
        try {
            const result = await $.command `cd ${directory} && go vet ./... 2>&1`.exitCode();
            checks.push({
                name: "Go валидация",
                passed: result === 0,
                message: result === 0 ? "OK" : "Ошибка go vet"
            });
        }
        catch {
            checks.push({ name: "Go валидация", passed: false, message: "Не удалось проверить" });
        }
    }
    // Markdown проверка (если есть md файлы)
    const hasMd = await $.command `ls ${directory}/*.md 2>/dev/null | head -1`.text();
    if (hasMd.trim()) {
        checks.push({
            name: "Markdown файлы",
            passed: true,
            message: "Найдены markdown файлы"
        });
    }
    return {
        passed: checks.every(c => c.passed),
        gate: 3,
        checks
    };
}
// Gate 4: Pre-Merge — интеграционные проверки
async function preMerge($, directory) {
    const checks = [];
    try {
        // Проверка: нет конфликтов
        const status = await $.command `cd ${directory} && git status --porcelain`.text();
        const hasConflicts = status.includes("UU") || status.includes("AA") || status.includes("DD");
        checks.push({
            name: "Нет конфликтов",
            passed: !hasConflicts,
            message: hasConflicts ? "Есть конфликты" : "OK"
        });
    }
    catch (e) {
        checks.push({
            name: "Git проверки",
            passed: false,
            message: "Ошибка: " + e
        });
    }
    return {
        passed: checks.every(c => c.passed),
        gate: 4,
        checks
    };
}
// Gate 5: Pre-Implementation — проверка спецификаций
async function preImplementation(specFile) {
    const checks = [
        {
            name: "Спецификация существует",
            passed: !!specFile,
            message: specFile ? "OK" : "Файл не указан"
        }
    ];
    return {
        passed: checks.every(c => c.passed),
        gate: 5,
        checks
    };
}
// MCP Check — проверка доступности MCP серверов для технологий проекта
async function mcpCheck($, directory) {
    const checks = [];
    try {
        const { mcpResolution } = await Promise.resolve().then(() => __importStar(require("./mcp-resolution")));
        // Определяем технологии проекта
        const techs = mcpResolution.detectTechnologies($, directory);
        checks.push({
            name: "Технологии определены",
            passed: techs.length > 0,
            message: techs.length > 0 ? `Найдены: ${techs.join(", ")}` : "Технологии не определены"
        });
        // Для каждой технологии ищем MCP серверы
        for (const tech of techs) {
            const servers = mcpResolution.searchMCPServers(tech);
            checks.push({
                name: `MCP для ${tech}`,
                passed: servers.length > 0,
                message: servers.length > 0
                    ? `Найдено ${servers.length} серверов`
                    : `Нет MCP для ${tech}`
            });
        }
        // Проверяем критически важные MCP
        const criticalMCP = ["filesystem", "git", "memory"];
        for (const mcp of criticalMCP) {
            const found = mcpResolution.searchMCPServers("").some((s) => s.id === mcp);
            checks.push({
                name: `Критический MCP: ${mcp}`,
                passed: found || techs.length === 0, // Пропускаем если нет технологий
                message: found ? "Доступен" : "Не требуется"
            });
        }
    }
    catch (e) {
        checks.push({
            name: "MCP Check",
            passed: false,
            message: `Ошибка: ${e}`
        });
    }
    return {
        passed: checks.every(c => c.passed),
        gate: 6,
        checks
    };
}
// Экспорт модуля
exports.qualityGates = {
    preExecution,
    postExecution,
    preCommit,
    preMerge,
    preImplementation,
    mcpCheck
};
exports.default = exports.qualityGates;
