// OpenCode Orchestrator Kit — Точка входа плагина
// Реализует логику оркестрации на основе Speckit/TDD методологии

import type { Plugin } from "@opencode-ai/plugin";
import { stateMachine } from "./state-machine";
import { preFlight } from "./pre-flight";
import { qualityGates } from "./quality-gates";
import { sessionHooks } from "./session-hooks";
import { blockingRules } from "./blocking-rules";
import { gitWorkflow } from "./git-workflow";

export const OrchestratorKit: Plugin = async ({ 
  project, 
  client, 
  $, 
  directory, 
  worktree 
}) => {
  // Инициализация state machine при запуске плагина
  await stateMachine.initialize(directory);

  // Обработчик событий (делегируем в session-hooks.ts)
  const eventHandler = async (input: any, output: any) => {
    if (input.event?.type === "session.created") {
      await sessionHooks.onSessionCreated($, directory, client);
    }
    
    if (input.event?.type === "session.idle") {
      await sessionHooks.onSessionIdle(directory, client);
    }
    
    if (input.event?.type === "session.compacted") {
      await sessionHooks.onSessionCompacted(directory, client);
    }
    
    if (input.event?.type === "session.error") {
      const error = input.error instanceof Error ? input.error : new Error(String(input.error));
      await sessionHooks.onSessionError(directory, error, input.context);
    }
  };

  // Pre-tool hook — выполняется перед каждым инструментом
  const toolExecuteBefore = async (input: any, output: any) => {
    const currentState = stateMachine.getCurrentState();
    
    // Проверка: инструмент разрешён в текущем состоянии
    if (!stateMachine.isToolAllowed(input.tool, currentState)) {
      throw new Error(`❌ Инструмент "${input.tool}" запрещён в состоянии ${currentState} (${stateMachine.getStateDescription(currentState)}).`);
    }
    
    // Блокирующие правила проверка
    const rulesResult = await blockingRules.checkAllRules();
    if (!rulesResult.passed) {
      throw new Error(`❌ Блокирующие правила не пройдены:\n${rulesResult.violations.join('\n')}`);
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
    
    // Pre-Merge валидация при git merge
    if (input.tool === "bash" && input.args?.command?.includes("git merge")) {
      const currentBranch = await $.command`git branch --show-current`.text();
      
      // Проверяем что мерж в develop
      if (input.args.command.includes("develop")) {
        const gateResult = await qualityGates.preMerge($, directory);
        
        if (!gateResult.passed) {
          await client.session.prompt({
            body: `❌ Gate 4 (Pre-Merge) не пройден: ${gateResult.checks.filter(c => !c.passed).map(c => c.name).join(", ")}\n\nМерж заблокирован.`
          });
          throw new Error(`❌ Мерж заблокирован: Gate 4 не пройден`);
        }
        
        // Запрашиваем подтверждение пользователя
        await client.session.prompt({
          body: `⚠️ Вы собираетесь выполнить мерж ветки "${currentBranch}" в develop.\n\nКоммиты:\n${output?.result || 'Нет данных'}\n\nПодтвердите мерж (да/нет):`
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