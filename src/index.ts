// OpenCode Orchestrator Kit — Точка входа плагина
// Реализует логику оркестрации на основе Speckit/TDD методологии

import type { Plugin } from "@opencode-ai/plugin";
import { stateMachine } from "./state-machine";
import { preFlight } from "./pre-flight";
import { qualityGates } from "./quality-gates";

export const OrchestratorKit: Plugin = async ({ 
  project, 
  client, 
  $, 
  directory, 
  worktree 
}) => {
  // Инициализация state machine при запуске плагина
  await stateMachine.initialize(directory);

  // Обработчик событий
  const eventHandler = async (input: any, output: any) => {
    if (input.event?.type === "session.created") {
      // При старте сессии выполняем Pre-Flight проверки
      const preFlightResult = await preFlight.run($, directory);
      
      if (!preFlightResult.success) {
        await client.session.prompt({
          body: `❌ Pre-Flight проверки не пройдены:\n${preFlightResult.errors.join("\n")}\n\nПроверьте готовность проекта перед началом работы.`
        });
        return;
      }
      
      // Определение состояния проекта
      const projectState = await stateMachine.getState($, directory);
      await client.session.prompt({
        body: `✅ Pre-Flight проверки пройдены (${preFlightResult.passed}/${preFlightResult.passed + preFlightResult.failed})\n\nСостояние проекта: ${projectState.code} (${projectState.description})\n\nРазрешённые агенты: ${projectState.allowedAgents.join(", ")}`
      });
    }
    
    if (input.event?.type === "session.idle") {
      // При завершении сессии сохраняем контекст
      await client.session.prompt({
        body: `💾 Контекст сессии сохранён.\n\nТекущее состояние: ${stateMachine.getCurrentState()}`
      });
    }
  };

  // Pre-tool hook — выполняется перед каждым инструментом
  const toolExecuteBefore = async (input: any, output: any) => {
    const currentState = stateMachine.getCurrentState();
    
    // Проверка: инструмент разрешён в текущем состоянии
    if (!stateMachine.isToolAllowed(input.tool, currentState)) {
      throw new Error(`❌ Инструмент "${input.tool}" запрещён в состоянии ${currentState} (${stateMachine.getStateDescription(currentState)}).`);
    }
    
    // Gate 1: Pre-Execution проверка для task
    if (input.tool === "task") {
      const gateResult = await qualityGates.preExecution(input.args);
      if (!gateResult.passed) {
        const failedChecks = gateResult.checks.filter(c => !c.passed).map(c => c.message).join(", ");
        throw new Error(`❌ Gate 1 (Pre-Execution) не пройден: ${failedChecks}`);
      }
    }
  };

  // Post-tool hook — выполняется после каждого инструмента
  const toolExecuteAfter = async (input: any, output: any) => {
    // Gate 2: Post-Execution проверка для task
    if (input.tool === "task") {
      const gateResult = await qualityGates.postExecution(output);
      if (!gateResult.passed) {
        // Логируем, но не блокируем — задача уже выполнена
        await client.session.prompt({
          body: `⚠️ Gate 2 (Post-Execution) предупреждение: ${gateResult.checks.filter(c => !c.passed).map(c => c.message).join(", ")}`
        });
      }
      
      // Обновление состояния после выполнения задачи
      await stateMachine.updateAfterTask(output, directory, $);
    }
    
    // Pre-commit валидация при git commit
    if (input.tool === "bash" && input.args?.command?.includes("git commit")) {
      const gateResult = await qualityGates.preCommit($, directory);
      if (!gateResult.passed) {
        await client.session.prompt({
          body: `⚠️ Gate 3 (Pre-Commit) предупреждение: ${gateResult.checks.filter(c => !c.passed).map(c => c.name).join(", ")}`
        });
      }
    }
  };

  return {
    event: eventHandler,
    "tool.execute.before": toolExecuteBefore,
    "tool.execute.after": toolExecuteAfter,
  };
};

export default OrchestratorKit;