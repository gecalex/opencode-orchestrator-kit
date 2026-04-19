// OpenCode Orchestrator Kit — Точка входа плагина
// Реализует логику оркестрации на основе Speckit/TDD методологии

import type { Plugin } from "@opencode-ai/plugin";
import { stateMachine } from "./state-machine";
import { preFlight } from "./pre-flight";
import { qualityGates } from "./quality-gates";
import { sessionHooks, saveContext } from "./session-hooks";
import { blockingRules } from "./blocking-rules";
import { gitWorkflow } from "./git-workflow";

// Функция авто-инициализации при загрузке плагина (через config hook)
async function autoInitOnPluginLoad($: any, directory: string, client: any): Promise<boolean> {
  try {
    // Проверка: есть .git?
    const hasGitDir = await $.command`test -d ${directory}/.git && echo "yes"`.text();
    const hasGit = hasGitDir.trim() === "yes";
    
    if (!hasGit) {
      // Инициализация Git
      await $.command`git init`.text();
      await $.command`git checkout -b develop`.text();
      
      // Создание базового .gitignore
      await $.command`cat > .gitignore << 'EOF'
node_modules/
.env
dist/
.DS_Store
*.log
.tmp/
.vscode/
.idea/
EOF`.text();
      
      // Создание базового README
      await $.command`cat > README.md << 'EOF'
# Project

Personal project created by Orchestrator Kit.

## Getting Started

Run \`opencode\` to start working on this project.
EOF`.text();
      
      // Первый коммит
      await $.command`git add -A && git commit -m "feat: initialize project with Orchestrator Kit"`.text();
      
      // Обновляем state
      stateMachine.setState(2, "Инициализация завершена");
      
      return true;
    }
    
    // Проверка: есть AGENTS.md (или QWEN.md)?
    const hasAgents = await $.command`test -f ${directory}/AGENTS.md && echo "yes"`.text();
    const hasQwen = await $.command`test -f ${directory}/QWEN.md && echo "yes"`.text();
    
    if (hasAgents.trim() !== "yes" && hasQwen.trim() !== "yes") {
      console.log("[OrchestratorKit] AGENTS.md не найден в проекте. Рекомендуется использовать /init для инициализации.");
    }
    
    return false;
  } catch (e) {
    console.error("[OrchestratorKit] Ошибка инициализации:", e);
    return false;
  }
}

export const OrchestratorKit: Plugin = async ({
  project,
  client,
  $,
  directory,
  worktree
}) => {
  // Инициализация state machine при запуске плагина
  await stateMachine.initialize(directory);

  // Выполняем авто-инициализацию при загрузке плагина
  // Это обходит баг с tool.execute.before для subagent
  const wasInitialized = await autoInitOnPluginLoad($, directory, client);
  
  if (wasInitialized) {
    await client.session.prompt({
      body: "✅ Проект инициализирован! Git репозиторий создан, ветка develop активирована.\n\nТеперь можно работать с оркестратором."
    });
  }

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
    // Инициализация теперь через autoInitOnPluginLoad при загрузке плагина
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

    // Gate 1: Pre-Execution проверка — пропускаем для task (оркестратор делегирует)
    // if (input.tool === "task") {
    //   const gateResult = await qualityGates.preExecution(input.args);
    //   if (!gateResult.passed) {
    //     const failedChecks = gateResult.checks.filter(c => !c.passed).map(c => c.message).join(", ");
    //     throw new Error(`❌ Gate 1 (Pre-Execution) не пройден: ${failedChecks}`);
    //   }
    // }
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