// Кастомные инструменты для Speckit операций
// Реализует инструменты: speckit-analyze-state, speckit-pre-flight-check, speckit-quality-gate-run, speckit-task-delegator

import { stateMachine } from "./state-machine";
import { preFlight } from "./pre-flight";
import { qualityGates } from "./quality-gates";

interface ToolResult {
  success: boolean;
  result?: any;
  error?: string;
  message?: string;
}

// Инструмент: analyze-state — определение состояния проекта
export async function analyzeState($: any, directory: string): Promise<ToolResult> {
  try {
    const state = await stateMachine.getState($, directory);
    
    return {
      success: true,
      result: {
        code: state.code,
        description: state.description,
        allowedAgents: state.allowedAgents,
        blockedAgents: state.blockedAgents,
        allowedTools: state.allowedTools
      },
      message: `Состояние: ${state.code} (${state.description})`
    };
  } catch (e) {
    return {
      success: false,
      error: String(e),
      message: `Ошибка определения состояния: ${e}`
    };
  }
}

// Инструмент: pre-flight-check — запуск предварительных проверок
export async function preFlightCheck($: any, directory: string): Promise<ToolResult> {
  try {
    const result = await preFlight.run($, directory);
    
    return {
      success: result.success,
      result: {
        passed: result.passed,
        failed: result.failed,
        errors: result.errors
      },
      message: result.success 
        ? `✅ Pre-Flight пройден (${result.passed}/${result.passed + result.failed})`
        : `❌ Pre-Flight не пройден: ${result.errors.join(", ")}`
    };
  } catch (e) {
    return {
      success: false,
      error: String(e),
      message: `Ошибка: ${e}`
    };
  }
}

// Инструмент: quality-gate-run — выполнение контрольных точек
export async function qualityGateRun(
  $: any, 
  directory: string, 
  gateType: "preExecution" | "postExecution" | "preCommit" | "preMerge" | "preImplementation",
  args?: any
): Promise<ToolResult> {
  try {
    let result;
    
    switch (gateType) {
      case "preExecution":
        result = await qualityGates.preExecution(args);
        break;
      case "postExecution":
        result = await qualityGates.postExecution(args);
        break;
      case "preCommit":
        result = await qualityGates.preCommit($, directory);
        break;
      case "preMerge":
        result = await qualityGates.preMerge($, directory);
        break;
      case "preImplementation":
        result = await qualityGates.preImplementation(args?.specFile || "");
        break;
      default:
        return {
          success: false,
          error: `Unknown gate type: ${gateType}`,
          message: `Неизвестный тип gate: ${gateType}`
        };
    }
    
    return {
      success: result.passed,
      result: {
        passed: result.passed,
        checks: result.checks
      },
      message: result.passed 
        ? `✅ Gate ${gateType} пройден`
        : `❌ Gate ${gateType} не пройден: ${result.checks.filter((c: any) => !c.passed).map((c: any) => c.message).join(", ")}`
    };
  } catch (e) {
    return {
      success: false,
      error: String(e),
      message: `Ошибка: ${e}`
    };
  }
}

// Инструмент: task-delegator — делегирование задач агентам с автоматическим созданием feature-ветки
export async function taskDelegator(
  taskInput: {
    prompt: string;
    subagent_type: string;
    description?: string;
  }
): Promise<ToolResult> {
  // Валидация входных данных
  if (!taskInput?.prompt) {
    return {
      success: false,
      error: "Prompt задачи пуст",
      message: "❌ Промпт задачи обязателен"
    };
  }
  
  if (!taskInput?.subagent_type) {
    return {
      success: false,
      error: "Agent type not specified",
      message: "❌ Тип агента обязателен"
    };
  }
  
  // Проверка допустимости агента в текущем состоянии
  if (!stateMachine.isAgentAllowed(taskInput.subagent_type)) {
    return {
      success: false,
      error: `Agent ${taskInput.subagent_type} not allowed`,
      message: `❌ Агент ${taskInput.subagent_type} запрещён в текущем состоянии`
    };
  }
  
  return {
    success: true,
    result: {
      prompt: taskInput.prompt,
      subagent_type: taskInput.subagent_type,
      description: taskInput.description
    },
    message: `✅ Задача подготовлена для ${taskInput.subagent_type}`
  };
}

// Инструмент: mcp-search — поиск MCP серверов в реестре
export async function mcpSearch(args: {
  technology?: string;
  category?: string;
  tag?: string;
}): Promise<ToolResult> {
  try {
    const { mcpRegistry } = await import("./mcp-registry");
    
    let results: any[] = [];
    
    if (args.technology) {
      results = mcpRegistry.getByTech(args.technology);
    } else if (args.category) {
      results = mcpRegistry.getByCategory(args.category as any);
    } else if (args.tag) {
      results = mcpRegistry.getByTag(args.tag);
    } else {
      results = mcpRegistry.getAll();
    }
    
    return {
      success: true,
      result: {
        count: results.length,
        servers: results.map(s => ({
          id: s.id,
          name: s.name,
          description: s.description,
          category: s.category,
          type: s.type
        }))
      },
      message: `Найдено ${results.length} MCP серверов`
    };
  } catch (e) {
    return {
      success: false,
      error: String(e),
      message: `Ошибка поиска MCP: ${e}`
    };
  }
}

// Инструмент: mcp-list — список всех доступных MCP серверов
export async function mcpList(): Promise<ToolResult> {
  try {
    const { mcpRegistry } = await import("./mcp-registry");
    const all = mcpRegistry.getAll();
    const grouped = mcpRegistry.getGroupedByCategory();
    
    return {
      success: true,
      result: {
        total: all.length,
        byCategory: Object.entries(grouped).map(([cat, servers]) => ({
          category: cat,
          count: servers.length,
          servers: servers.map(s => s.name)
        }))
      },
      message: `Всего ${all.length} MCP серверов в ${Object.keys(grouped).length} категориях`
    };
  } catch (e) {
    return {
      success: false,
      error: String(e),
      message: `Ошибка: ${e}`
    };
  }
}

// Registry инструментов
export const toolsRegistry = {
  "speckit-analyze-state": analyzeState,
  "speckit-pre-flight-check": preFlightCheck,
  "speckit-quality-gate-run": qualityGateRun,
  "speckit-task-delegator": taskDelegator,
  "speckit-mcp-search": mcpSearch,
  "speckit-mcp-list": mcpList
};

export default toolsRegistry;