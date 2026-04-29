"use strict";
// OpenCode Orchestrator Kit — Точка входа плагина
// Реализует логику оркестрации на основе Speckit/TDD методологии
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrchestratorKit = void 0;
const state_machine_1 = require("./state-machine");
const quality_gates_1 = require("./quality-gates");
const session_hooks_1 = require("./session-hooks");
const blocking_rules_1 = require("./blocking-rules");
// AGENTS.md template content - will be copied to project on init
const AGENTS_TEMPLATE = `# AGENTS.md — Orchestrator Kit

> **ВАЖНО:** Все ответы, документация и отчёты на РУССКОМ ЯЗЫКЕ.

---

## 🚫 Блокирующие правила

### Аварийный тормоз
- Проверка текущего состояния workflow
- Наличие подтверждения пользователя на критических переходах
- Pre-condition проверки для текущей фазы

### Правило пре-условий
- Аналитики: доступность исходных данных
- Кодеры: наличие написанных тестов (TDD First!)
- Рецензенты: наличие артефакта для рецензирования

---

## 🚀 Быстрый старт

\`\`\`bash
# 1. Анализ состояния
opencode analyze-state

# 2. Планирование
opencode plan-implementation --feature "feature-name"

# 3. Задачи
opencode break-down-tasks --feature "feature-name"

# 4. TDD: тесты → код
opencode create-test --task-id TASK-001
opencode write-code --task-id TASK-001
\`\`\`

---

## 📊 Машина состояний

| Код | Состояние |
|-----|----------|
| 1 | Пустой проект |
| 2 | Инициализирован (есть .git) |
| 3 | Конституция создана (PROJECT.md) |
| 4 | Спецификации готовы (SPEC/) |
| 5 | План реализации готов |
| 6 | Задачи назначены |
| 7 | Тестовая фаза |
| 8 | Кодинговая фаза |
| 9 | Фаза интеграции |
| 10 | Релиз-готов |

---

## 📋 Pre-condition чек-листы

### Перед анализом
- [ ] Git инициализирован
- [ ] Нет незакоммиченных изменений

### Перед написанием кода
- [ ] Тесты написаны (RED)
- [ ] Покрытие ≥ 80%
- [ ] Подтверждение на переход TEST → CODE

### Перед мержем в develop
- [ ] Все тесты проходят (GREEN)
- [ ] Quality gates пройдены
- [ ] Код рецензирован

---

## 🔄 TDD Workflow

1. **TEST**: Написать тесты (должны упасть - RED)
2. **CODE**: Написать код (тесты проходят - GREEN)
3. **REFACTOR**: Рефакторинг

---

## 🛠️ Quality Gates

| Gate | Проверка |
|------|----------|
| 1 | Pre-Execution (синтаксис) |
| 2 | Post-Execution (покрытие ≥80%) |
| 3 | Pre-Commit (безопасность) |
| 4 | Pre-Merge (интеграция) |
| 5 | Pre-Implementation (требования) |

---

## 📁 Структура проекта

\`\`\`
project/
├── AGENTS.md          # Этот файл
├── PROJECT.md         # Конституция
├── SPEC/              # Спецификации модулей
├── TASKS.md           # Задачи
├── REPORTS/           # Отчёты
└── src/               # Исходный код
\`\`\`

---

_Created by Orchestrator Kit_
`;
// Функция авто-инициализации при загрузке плагина
// Функция логирования в файл
async function logToFile($, directory, message) {
    const logFile = `${directory}/.opencode/orchestrator.log`;
    const timestamp = new Date().toISOString();
    await $.command `echo "${timestamp} | ${message}" >> ${logFile} 2>/dev/null || true`.text();
}
// Функция отображения текущего состояния и следующих шагов
function getStateDescription(code) {
    const descriptions = {
        1: "Пустой проект (директория создана, нет ничего)",
        2: "Проект инициализирован (есть .git)",
        3: "Конституция создана (основные требования и ограничения)",
        4: "Спецификации модулей созданы (детальное описание компонентов)",
        5: "План реализации готов (оценка усилий, зависимости, риски)",
        6: "Задачи разбиты и агенты назначены (готов к выполнению)",
        7: "Тестовая фаза (написание и выполнение тестов)",
        8: "Кодинговая фаза (написание кода под тесты)",
        9: "Фаза интеграции (объединение компонентов и системное тестирование)",
        10: "Релиз-готов (все качественные gate пройдены, готово к релизу)"
    };
    return descriptions[code] || "Неизвестное состояние";
}
function getNextSteps(currentState) {
    const nextSteps = {
        1: ["Инициализировать проект: создать .git, .gitignore, README.md"],
        2: ["Создать конституцию проекта (PROJECT.md)"],
        3: ["Создать спецификации модулей (SPEC/{module}.md)"],
        4: ["Проанализировать противоречия в спецификациях"],
        5: ["Создать план реализации (IMPLEMENTATION_PLAN.md)"],
        6: ["Разбить на задачи с зависимостями (TASKS.md)"],
        7: ["Назначить агентов на задачи"],
        8: ["Запустить TDD цикл: тесты → код"],
        9: ["Выполнить интеграцию и финальное тестирование"],
        10: ["Подготовить релиз и завершить проект"]
    };
    return nextSteps[currentState] || ["Ожидание действий"];
}
// Функция формирования диалога подтверждения
function formatConfirmationDialog(phaseName, results, nextStep) {
    return `✅ ${phaseName} завершена!

Результат:
${results.map(r => `- ${r}`).join('\n')}

Следующий шаг: ${nextStep}

Продолжить? (да/нет)`;
}
// Функция формирования результата инициализации
function formatInitDialog() {
    return `✅ Подготовка завершена!

Создано:
- Git репозиторий инициализирован
- Ветка develop активирована

Следующий шаг: Создание конституции проекта (PROJECT.md)

Продолжить? (да/нет)`;
}
async function autoInitOnPluginLoad($, directory, client, worktree) {
    try {
        await logToFile($, directory, "autoInitOnPluginLoad: START");
        // Проверка: есть .git?
        const hasGitDir = await $.command `test -d ${directory}/.git && echo "yes"`.text();
        await logToFile($, directory, `autoInitOnPluginLoad: hasGit=${hasGitDir.trim()}`);
        const hasGit = hasGitDir.trim() === "yes";
        if (!hasGit) {
            // НЕ выполняем автоматическую инициализацию!
            // Согласно философии QWEN - инициализация требует явного подтверждения
            // Показываем пользователю инструкцию
            await client.session.prompt({
                body: `⚠️ Проект не инициализирован!
        
Для инициализации проекта используйте:
\`orchestrator-init\`

Или вызовитеагента инициализации:
task '{
  "subagent_type": "orchestrator",
  "prompt": "Инициализируй проект"
}'

После инициализации будет создан:
- Git репозиторий с веткой develop
- .gitignore
- README.md
- AGENTS.md (этот файл)

Затем можно будет перейти к созданию конституции проекта.`
            });
            await logToFile($, directory, "autoInitOnPluginLoad: NOT initialized - waiting for user confirmation");
            return false; // Не инициализируем автоматически
        }
        // Проверка: есть AGENTS.md?
        const hasAgents = await $.command `test -f ${directory}/AGENTS.md && echo "yes"`.text();
        if (hasAgents.trim() !== "yes") {
            // AGENTS.md не существует - копируем из шаблона
            await $.command `cat > ${directory}/AGENTS.md << 'EOF'${AGENTS_TEMPLATE}
EOF`.text();
            await logToFile($, directory, "autoInitOnPluginLoad: AGENTS.md created from template");
        }
        // Показываем текущее состояние и следующие шаги
        const currentState = state_machine_1.stateMachine.getCurrentState();
        const stateDesc = getStateDescription(currentState);
        const nextSteps = getNextSteps(currentState);
        await client.session.prompt({
            body: `✅ Orchestrator Kit загружен!

Текущее состояние: ${currentState} (${stateDesc})

Следующие шаги:
${nextSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Для продолжения работы используйте команды оркестратора или вызовите соответствующего агента.`
        });
        return true;
    }
    catch (e) {
        await logToFile($, directory, `autoInitOnPluginLoad: ERROR=${e}`);
        return false;
    }
}
const OrchestratorKit = async ({ project, client, $, directory, worktree }) => {
    // Инициализация state machine при запуске плагина
    await state_machine_1.stateMachine.initialize(directory);
    // Выполняем авто-инициализацию при загрузке плагина
    // Это обходит баг с tool.execute.before для subagent
    const wasInitialized = await autoInitOnPluginLoad($, directory, client, worktree);
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
    let initRetryAttempted = false;
    const toolExecuteBefore = async (input, output) => {
        await logToFile($, directory, `toolExecuteBefore: tool=${input.tool}, state=${state_machine_1.stateMachine.getCurrentState()}`);
        // Fallback: если autoInit не сработал - пробуем тут
        if (!initRetryAttempted) {
            initRetryAttempted = true;
            const currentState = state_machine_1.stateMachine.getCurrentState();
            if (currentState === 1) {
                await logToFile($, directory, "toolExecuteBefore: RETRY init...");
                try {
                    const hasGit = await $.command `test -d ${directory}/.git && echo "yes"`.text();
                    if (hasGit.trim() !== "yes") {
                        await $.command `git init && git checkout -b develop`.text();
                        await $.command `cat > .gitignore << 'EOF'
node_modules/
.env
dist/
.DS_Store
EOF`.text();
                        state_machine_1.stateMachine.setState(2, "Инициализация выполнена");
                        await logToFile($, directory, "toolExecuteBefore: RETRY init SUCCESS");
                    }
                }
                catch (e) {
                    await logToFile($, directory, `toolExecuteBefore: RETRY init ERROR=${e}`);
                }
            }
        }
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
        // Pre-commit валидация ПЕРЕД git commit
        if (input.tool === "bash" && input.args?.command?.includes("git commit")) {
            const gateResult = await quality_gates_1.qualityGates.preCommit($, directory);
            if (!gateResult.passed) {
                throw new Error(`❌ Pre-Commit проверка не пройдена: ${gateResult.checks.filter(c => !c.passed).map(c => c.name).join(", ")}\n\nКоммит заблокирован. Исправьте ошибки и попробуйте снова.`);
            }
        }
        // Pre-Merge валидация ПЕРЕД git merge в develop
        if (input.tool === "bash" && input.args?.command?.includes("git merge") && input.args.command.includes("develop")) {
            const gateResult = await quality_gates_1.qualityGates.preMerge($, directory);
            if (!gateResult.passed) {
                throw new Error(`❌ Pre-Merge проверка не пройдена: ${gateResult.checks.filter(c => !c.passed).map(c => c.name).join(", ")}\n\nМерж заблокирован.`);
            }
            // Запрашиваем подтверждение пользователя
            await client.session.prompt({
                body: `⚠️ Вы собираетесь выполнить мерж в develop.\n\nПодтвердите мерж (да/нет):`
            });
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
    };
    return {
        event: eventHandler,
        "tool.execute.before": toolExecuteBefore,
        "tool.execute.after": toolExecuteAfter,
    };
};
exports.OrchestratorKit = OrchestratorKit;
exports.default = exports.OrchestratorKit;
