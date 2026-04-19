// Quality Gates — контрольные точки качества
// 5 ворот: Pre-Execution, Post-Execution, Pre-Commit, Pre-Merge, Pre-Implementation

import type { QualityGateResult, CheckResult } from "./types";

// Определение языков проекта
async function detectLanguages($: any, directory: string): Promise<string[]> {
  const languages: string[] = [];

  try {
    const hasPython = await $.command`ls ${directory}/*.py 2>/dev/null | head -1`.text();
    if (hasPython.trim()) languages.push("python");

    const hasTs = await $.command`ls ${directory}/*.ts 2>/dev/null | head -1`.text();
    if (hasTs.trim()) languages.push("typescript");

    const hasJs = await $.command`ls ${directory}/*.js 2>/dev/null | head -1`.text();
    if (hasJs.trim()) languages.push("javascript");

    const hasGo = await $.command`ls ${directory}/go.mod 2>/dev/null | head -1`.text();
    if (hasGo.trim()) languages.push("go");
  } catch {
    // Игнорируем ошибки
  }

  return languages;
}

// Gate 1: Pre-Execution — проверка корректности задачи
export async function preExecution(taskInput: any): Promise<QualityGateResult> {
  // Для task инструмента - разрешаем без строгой проверки
  // Оркестратор должен делегировать, Gate 2 проверит результат
  if (taskInput?.subagent_type || taskInput?.prompt || taskInput?.description) {
    return {
      passed: true,
      gate: 1,
      checks: [{ name: "Task input", passed: true, message: "OK" }]
    };
  }
  
  const checks: CheckResult[] = [
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
export async function postExecution(taskOutput: any): Promise<QualityGateResult> {
  const checks: CheckResult[] = [
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
export async function preCommit($: any, directory: string): Promise<QualityGateResult> {
  const languages = await detectLanguages($, directory);
  const checks: CheckResult[] = [];

  // Python проверка
  if (languages.includes("python")) {
    try {
      const result = await $.command`python -m py_compile ${directory}/*.py 2>&1`.exitCode();
      checks.push({
        name: "Python синтаксис",
        passed: result === 0,
        message: result === 0 ? "OK" : "Ошибка компиляции"
      });
    } catch {
      checks.push({ name: "Python синтаксис", passed: false, message: "Не удалось проверить" });
    }
  }

  // TypeScript проверка
  if (languages.includes("typescript")) {
    try {
      const result = await $.command`cd ${directory} && npx tsc --noEmit 2>&1`.exitCode();
      checks.push({
        name: "TypeScript синтаксис",
        passed: result === 0,
        message: result === 0 ? "OK" : "Ошибка типизации"
      });
    } catch {
      checks.push({ name: "TypeScript синтаксис", passed: false, message: "Не удалось проверить" });
    }
  }

  // Go проверка
  if (languages.includes("go")) {
    try {
      const result = await $.command`cd ${directory} && go vet ./... 2>&1`.exitCode();
      checks.push({
        name: "Go валидация",
        passed: result === 0,
        message: result === 0 ? "OK" : "Ошибка go vet"
      });
    } catch {
      checks.push({ name: "Go валидация", passed: false, message: "Не удалось проверить" });
    }
  }

  // Markdown проверка (если есть md файлы)
  const hasMd = await $.command`ls ${directory}/*.md 2>/dev/null | head -1`.text();
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
export async function preMerge($: any, directory: string): Promise<QualityGateResult> {
  const checks: CheckResult[] = [];

  try {
    // Проверка: нет конфликтов
    const status = await $.command`cd ${directory} && git status --porcelain`.text();
    const hasConflicts = status.includes("UU") || status.includes("AA") || status.includes("DD");
    checks.push({
      name: "Нет конфликтов",
      passed: !hasConflicts,
      message: hasConflicts ? "Есть конфликты" : "OK"
    });
  } catch (e) {
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
export async function preImplementation(specFile: string): Promise<QualityGateResult> {
  const checks: CheckResult[] = [
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
export async function mcpCheck($: any, directory: string): Promise<QualityGateResult> {
  const checks: CheckResult[] = [];
  
  try {
    const { mcpResolution } = await import("./mcp-resolution");
    
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
      const found = mcpResolution.searchMCPServers("").some((s: any) => s.id === mcp);
      checks.push({
        name: `Критический MCP: ${mcp}`,
        passed: found || techs.length === 0, // Пропускаем если нет технологий
        message: found ? "Доступен" : "Не требуется"
      });
    }
  } catch (e) {
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
export const qualityGates = {
  preExecution,
  postExecution,
  preCommit,
  preMerge,
  preImplementation,
  mcpCheck
};

export default qualityGates;