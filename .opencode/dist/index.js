"use strict";
// OpenCode Orchestrator Kit — Точка входа плагина
// Реализует логику оркестрации на основе Speckit/TDD методологии
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrchestratorKit = void 0;
const state_machine_1 = require("./state-machine");
const quality_gates_1 = require("./quality-gates");
const session_hooks_1 = require("./session-hooks");
const blocking_rules_1 = require("./blocking-rules");
// Функция авто-инициализации при загрузке плагина (через config hook)
async function autoInitOnPluginLoad($, directory, client) {
    try {
        // Проверка: есть .git?
        const hasGitDir = await $.command `test -d ${directory}/.git && echo "yes"`.text();
        const hasGit = hasGitDir.trim() === "yes";
        if (!hasGit) {
            // Инициализация Git
            await $.command `git init`.text();
            await $.command `git checkout -b develop`.text();
            // Создание базового .gitignore
            await $.command `cat > .gitignore << 'EOF'
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
            await $.command `cat > README.md << 'EOF'
# Project

Personal project created by Orchestrator Kit.

## Getting Started

Run \`opencode\` to start working on this project.
EOF`.text();
            // Первый коммит
            await $.command `git add -A && git commit -m "feat: initialize project with Orchestrator Kit"`.text();
            // Обновляем state
            state_machine_1.stateMachine.setState(2, "Инициализация завершена");
            return true;
        }
        // Проверка: есть AGENTS.md (или QWEN.md)?
        const hasAgents = await $.command `test -f ${directory}/AGENTS.md && echo "yes"`.text();
        const hasQwen = await $.command `test -f ${directory}/QWEN.md && echo "yes"`.text();
        if (hasAgents.trim() !== "yes" && hasQwen.trim() !== "yes") {
            console.log("[OrchestratorKit] AGENTS.md не найден в проекте. Рекомендуется использовать /init для инициализации.");
        }
        return false;
    }
    catch (e) {
        console.error("[OrchestratorKit] Ошибка инициализации:", e);
        return false;
    }
}
const OrchestratorKit = async ({ project, client, $, directory, worktree }) => {
    // Инициализация state machine при запуске плагина
    await state_machine_1.stateMachine.initialize(directory);
    // Выполняем авто-инициализацию при загрузке плагина
    // Это обходит баг с tool.execute.before для subagent
    const wasInitialized = await autoInitOnPluginLoad($, directory, client);
    if (wasInitialized) {
        await client.session.prompt({
            body: "✅ Проект инициализирован! Git репозиторий создан, ветка develop активирована.\n\nТеперь можно работать с оркестратором."
        });
    }
    // Обработчик событий (делегируем в session-hooks.ts)
    const eventHandler = async (input, output) => {
        if (input.event?.type === "session.created") {
            await session_hooks_1.sessionHooks.onSessionCreated($, directory, client);
        }
        if (input.event?.type === "session.idle") {
            await session_hooks_1.sessionHooks.onSessionIdle(directory, client);
        }
        if (input.event?.type === "session.compacted") {
            await session_hooks_1.sessionHooks.onSessionCompacted(directory, client);
        }
        if (input.event?.type === "session.error") {
            const error = input.error instanceof Error ? input.error : new Error(String(input.error));
            await session_hooks_1.sessionHooks.onSessionError(directory, error, input.context);
        }
    };
    // Pre-tool hook — выполняется перед каждым инструментом
    const toolExecuteBefore = async (input, output) => {
        // Инициализация теперь через autoInitOnPluginLoad при загрузке плагина
        const currentState = state_machine_1.stateMachine.getCurrentState();
        // Проверка: инструмент разрешён в текущем состоянии
        if (!state_machine_1.stateMachine.isToolAllowed(input.tool, currentState)) {
            throw new Error(`❌ Инструмент "${input.tool}" запрещён в состоянии ${currentState} (${state_machine_1.stateMachine.getStateDescription(currentState)}).`);
        }
        // Блокирующие правила проверка
        const rulesResult = await blocking_rules_1.blockingRules.checkAllRules();
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
    const toolExecuteAfter = async (input, output) => {
        // Gate 2: Post-Execution проверка для task
        if (input.tool === "task") {
            const gateResult = await quality_gates_1.qualityGates.postExecution(output);
            if (!gateResult.passed) {
                // Логируем, но не блокируем — задача уже выполнена
                await client.session.prompt({
                    body: `⚠️ Gate 2 (Post-Execution) предупреждение: ${gateResult.checks.filter(c => !c.passed).map(c => c.message).join(", ")}`
                });
            }
            // Обновление состояния после выполнения задачи
            await state_machine_1.stateMachine.updateAfterTask(output, directory, $);
        }
        // Pre-commit валидация при git commit
        if (input.tool === "bash" && input.args?.command?.includes("git commit")) {
            const gateResult = await quality_gates_1.qualityGates.preCommit($, directory);
            if (!gateResult.passed) {
                await client.session.prompt({
                    body: `⚠️ Gate 3 (Pre-Commit) предупреждение: ${gateResult.checks.filter(c => !c.passed).map(c => c.name).join(", ")}`
                });
            }
        }
        // Pre-Merge валидация при git merge
        if (input.tool === "bash" && input.args?.command?.includes("git merge")) {
            const currentBranch = await $.command `git branch --show-current`.text();
            // Проверяем что мерж в develop
            if (input.args.command.includes("develop")) {
                const gateResult = await quality_gates_1.qualityGates.preMerge($, directory);
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
exports.OrchestratorKit = OrchestratorKit;
exports.default = exports.OrchestratorKit;
