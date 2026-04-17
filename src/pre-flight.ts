// Pre-Flight проверки готовности проекта
// Выполняет 10 пунктов проверки перед началом фазы разработки

import type { PreFlightResult } from "./types";

// Выполнение всех Pre-Flight проверок
export async function run($: any, directory: string): Promise<PreFlightResult> {
  const checks = [
    { name: "Git репозиторий", check: checkGitRepository.bind(null, $) },
    { name: "Ветка develop", check: checkDevelopBranch.bind(null, $) },
    { name: ".gitignore", check: checkGitignore.bind(null, directory) },
    { name: "Конституция проекта", check: checkConstitution.bind(null, directory) },
    { name: "Quality Gates скрипты", check: checkQualityGatesScripts.bind(null, directory) },
    { name: "Агенты", check: checkAgents.bind(null, directory) },
    { name: "Speckit команды", check: checkSpeckitCommands.bind(null, directory) },
    { name: "Skills", check: checkSkills.bind(null, directory) },
    { name: "MCP конфигурация", check: checkMcpConfig.bind(null, directory) },
    { name: "Скрипты", check: checkScripts.bind(null, directory) }
  ];

  const errors: string[] = [];
  let passed = 0;

  for (const check of checks) {
    try {
      const result = await check.check();
      if (result) {
        passed++;
      } else {
        errors.push(`❌ ${check.name}`);
      }
    } catch (e) {
      errors.push(`❌ ${check.name}: ${e}`);
    }
  }

  return {
    success: errors.length === 0,
    passed,
    failed: errors.length,
    errors
  };
}

// Проверка 1: Git репозиторий
async function checkGitRepository($: any): Promise<boolean> {
  try {
    const result = await $.command`git rev-parse --git-dir`.exitCode();
    return result === 0;
  } catch {
    return false;
  }
}

// Проверка 2: Ветка develop
async function checkDevelopBranch($: any): Promise<boolean> {
  try {
    const result = await $.command`git branch --list develop`.text();
    return result.includes("develop");
  } catch {
    return false;
  }
}

// Проверка 3: .gitignore
async function checkGitignore(directory: string): Promise<boolean> {
  try {
    // @ts-ignore
    const result = await $.command(`test -f ${directory}/.gitignore && echo "yes"`).text();
    return result.trim() === "yes";
  } catch {
    return false;
  }
}

// Проверка 4: Конституция проекта
async function checkConstitution(directory: string): Promise<boolean> {
  try {
    // @ts-ignore
    const result = await $.command(`test -f ${directory}/.opencode/specify/memory/constitution.md && echo "yes"`).text();
    return result.trim() === "yes";
  } catch {
    return false;
  }
}

// Проверка 5: Quality Gates скрипты
async function checkQualityGatesScripts(directory: string): Promise<boolean> {
  try {
    // @ts-ignore
    const result = await $.command(`test -d ${directory}/scripts && echo "yes"`).text();
    return result.trim() === "yes";
  } catch {
    return false;
  }
}

// Проверка 6: Агенты
async function checkAgents(directory: string): Promise<boolean> {
  try {
    // @ts-ignore
    const result = await $.command(`ls ${directory}/agents/*.md 2>/dev/null | wc -l`).text();
    return parseInt(result.trim()) > 0;
  } catch {
    return false;
  }
}

// Проверка 7: Speckit команды
async function checkSpeckitCommands(directory: string): Promise<boolean> {
  try {
    // @ts-ignore
    const result = await $.command(`ls ${directory}/commands/*.md 2>/dev/null | wc -l`).text();
    return parseInt(result.trim()) > 0;
  } catch {
    return false;
  }
}

// Проверка 8: Skills
async function checkSkills(directory: string): Promise<boolean> {
  try {
    // @ts-ignore
    const result = await $.command(`ls ${directory}/skills/*/SKILL.md 2>/dev/null | wc -l`).text();
    return parseInt(result.trim()) > 0;
  } catch {
    return false;
  }
}

// Проверка 9: MCP конфигурация
async function checkMcpConfig(directory: string): Promise<boolean> {
  try {
    // @ts-ignore
    const result = await $.command(`test -f ${directory}/opencode.json && grep -l "mcp" ${directory}/opencode.json 2>/dev/null`).text();
    return result.trim().length > 0;
  } catch {
    return false;
  }
}

// Проверка 10: Скрипты
async function checkScripts(directory: string): Promise<boolean> {
  try {
    // @ts-ignore
    const result = await $.command(`ls ${directory}/scripts/*.sh 2>/dev/null | wc -l`).text();
    return parseInt(result.trim()) > 0;
  } catch {
    return false;
  }
}

// Экспорт модуля
export const preFlight = {
  run
};

export default preFlight;