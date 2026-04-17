# Архитектура плагина OpenCode Orchestrator Kit

**Дата:** 2026-04-17  
**Статус:** ✅ ПРОЕКТИРОВАНИЕ ЗАВЕРШЕНО

---

## Введение

Данный документ описывает архитектуру плагина для OpenCode, который воспроизводит логику и философию расширения Qwen Orchestrator Kit.

**Ключевые адаптации:**
- 43 агента Qwen → ~20-25 ключевых агентов для OpenCode
- 44 скилла Qwen → ~15-20 ключевых скиллов
- Bash-скрипты → Shell-команды через Bun (`$`)
- Pre-Flight / Quality Gates → внешние команды + плагин-хуки

---

## 1. Файловая структура плагина

```
opencode-orchestrator-kit/
├── src/
│   ├── index.ts              # Точка входа плагина
│   ├── state-machine.ts     # Управление состояниями проекта
│   ├── pre-flight.ts        # Pre-Flight проверки
│   ├── quality-gates.ts     # Quality Gates механизм
│   ├── git-workflow.ts      # Git workflow интеграция
│   ├── user-approval.ts     # Механизм утверждения пользователя
│   ├── orchestrator.ts      # Основная логика оркестрации
│   └── types.ts             # TypeScript типы
├── agents/                   # Определения агентов (OpenCode format)
│   ├── orc_planning_task_analyzer.md
│   ├── orc_testing_tdd_coordinator.md
│   ├── speckit-constitution-agent.md
│   ├── speckit-specify-agent.md
│   ├── speckit-plan-agent.md
│   ├── speckit-tasks-agent.md
│   ├── specification-analyst.md
│   ├── work_dev_project_initializer.md
│   ├── work_testing_python_specialist.md
│   ├── work_testing_go_specialist.md
│   ├── work_testing_ts_specialist.md
│   ├── work_backend_python_developer.md
│   ├── work_backend_go_developer.md
│   ├── work_frontend_react_developer.md
│   └── ...
├── skills/                   # Определения скиллов
│   ├── pre-flight/
│   │   └── SKILL.md
│   ├── quality-gate/
│   │   └── SKILL.md
│   ├── analyze-state/
│   │   └── SKILL.md
│   ├── init-project/
│   │   └── SKILL.md
│   ├── git-workflow/
│   │   └── SKILL.md
│   └── ...
└── package.json
```

---

## 2. Точка входа (`src/index.ts`)

```typescript
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
  // Инициализация state machine
  const state = await stateMachine.initialize(directory);

  // Обработчик событий
  const eventHandler = async (input: any, output: any) => {
    if (input.event?.type === "session.created") {
      const preFlightResult = await preFlight.run($, directory);
      if (!preFlightResult.success) {
        await client.session.prompt({
          body: `❌ Pre-Flight проверки не пройдены:\n${preFlightResult.errors.join("\n")}`
        });
        return;
      }
      
      const projectState = await stateMachine.getState($, directory);
      await client.session.prompt({
        body: `Состояние проекта: ${projectState.code} (${projectState.description})`
      });
    }
  };

  // Pre-tool hook (блокировка)
  const toolExecuteBefore = async (input: any, output: any) => {
    const currentState = stateMachine.getCurrentState();
    const allowed = stateMachine.isToolAllowed(input.tool, currentState);
    
    if (!allowed) {
      throw new Error(`Инструмент ${input.tool} запрещён в состоянии ${currentState}`);
    }
    
    if (input.tool === "task") {
      await qualityGates.preExecution(input, client);
    }
  };

  // Post-tool hook
  const toolExecuteAfter = async (input: any, output: any) => {
    if (input.tool === "task") {
      await qualityGates.postExecution(output, client);
      await stateMachine.updateAfterTask(output, directory);
    }
  };

  return {
    event: eventHandler,
    "tool.execute.before": toolExecuteBefore,
    "tool.execute.after": toolExecuteAfter,
  };
};

export default OrchestratorKit;
```

---

## 3. Модуль управления состояниями (`state-machine.ts`)

### Коды состояний

| Код | Состояние | Описание |
|-----|-----------|----------|
| **10** | `empty` | Проект пустой, нет кода и спецификаций |
| **20** | `existing_code_no_specs` | Есть код, но нет спецификаций |
| **30** | `partial_specification` | Есть частичные спецификации |
| **40** | `full_specification` | Все спецификации созданы, план готов |

### Разрешённые агенты по состояниям

| Состояние | ✅ Разрешено | ❌ Запрещено |
|-----------|-------------|--------------|
| **10** | `work_dev_project_initializer` | `speckit-*`, `work_*` |
| **20** | `speckit-constitution`, `speckit-specify` | `speckit-plan`, `work_*` |
| **30** | `speckit-specify`, `specification-analyst` | `speckit-plan`, `work_*` |
| **40** | `speckit-plan`, `speckit-tasks`, `work_*` | `speckit-constitution`, `speckit-specify` |

```typescript
type ProjectStateCode = 10 | 20 | 30 | 40;

interface ProjectState {
  code: ProjectStateCode;
  description: string;
  allowedAgents: string[];
  blockedAgents: string[];
  allowedTools: string[];
}

export const stateMachine = {
  async getState($: any, directory: string): Promise<ProjectState> {
    // Проверка наличия кода, спецификаций, конституции
    // Возвращает соответствующее состояние
  },

  isToolAllowed(tool: string, stateCode: ProjectStateCode): boolean {
    // Проверка разрешённых инструментов
  },

  isAgentAllowed(agent: string, stateCode: ProjectStateCode): boolean {
    // Проверка разрешённых агентов с учётом паттернов (*)
  }
};
```

---

## 4. Модуль Pre-Flight (`pre-flight.ts`)

### Проверки (10 пунктов)

| № | Проверка | Команда |
|---|----------|---------|
| 1 | Git репозиторий | `git rev-parse --git-dir` |
| 2 | Ветка develop | `git branch --list develop` |
| 3 | .gitignore | `test -f .gitignore` |
| 4 | Конституция проекта | `test -f .opencode/specify/memory/constitution.md` |
| 5 | Quality Gates скрипты | Проверка директории scripts |
| 6 | Агенты | `ls .opencode/agents/*.md | wc -l` |
| 7 | Speckit команды | Проверка команд |
| 8 | Skills | `ls .opencode/skills/*/SKILL.md | wc -l` |
| 9 | MCP конфигурация | Проверка opencode.json |
| 10 | Скрипты | Проверка директории |

**Блокирующая:** `true` — останавливает процесс при любой ошибке

---

## 5. Quality Gates (5 контрольных точек)

| Gate | Название | Описание | Блокирующая |
|------|----------|----------|-------------|
| **Gate 1** | Pre-Execution | Проверка корректности задачи | ❌ |
| **Gate 2** | Post-Execution | Верификация результата | ❌ |
| **Gate 3** | Pre-Commit | Валидация перед коммитом | ✅ |
| **Gate 4** | Pre-Merge | Интеграционные проверки | ✅ |
| **Gate 5** | Pre-Implementation | Проверка спецификаций | ✅ |

### Gate 3 (Pre-Commit) — проверки по языкам

```typescript
// Python
python -m py_compile *.py

// TypeScript  
npx tsc --noEmit

// Go
go vet ./...

// Markdown
markdownlint

// JSON
jq empty
```

---

## 6. Агенты в формате OpenCode

### Пример оркестратора

```markdown
---
description: Анализ и классификация задач, назначение агентов
mode: subagent
tools:
  task: true
  read: true
  skill: true
  todowrite: true
  glob: true
  grep: true
  write: false
  edit: false
  bash: false
---

# Orchestrator Task Analyzer

Ты — оркестратор для анализа задач. Координируешь работу, не пишешь код.

## ❌ ЗАПРЕЩЕНО
- Писать код (write_file, edit)
- Выполнять shell команды
- Создавать файлы проекта

## ✅ РАЗРЕШЕНО
- Читать файлы
- Использовать task для делегирования
- Анализировать и классифицировать

## Workflow
1. Прочитай tasks.md
2. Классифицируй по доменам
3. Определи требуемых агентов
4. Назначь агентов через task
```

### Пример воркера

```markdown
---
description: Python backend разработка с TDD
mode: subagent
tools:
  write: true
  edit: true
  bash: true
  read: true
  glob: true
  grep: true
  task: false
---

# Python Backend Developer

Пишешь качественный код с использованием TDD.

## Обязанности
- Python-разработка
- Написание тестов (pytest)
- Соблюдение TDD (тесты → код)
- Покрытие ≥ 80%

## Git Workflow
После каждой задачи:
1. Pre-commit review
2. Quality Gate
3. Коммит (Conventional Commits)
```

---

## 7. Скиллы в формате OpenCode

### Пример скилла pre-flight

```markdown
---
name: pre-flight
description: Pre-Flight проверки готовности проекта перед фазой разработки. Проверяет Git, ветку develop, .gitignore, конституцию, агентов и скиллы.
compatibility: opencode
---

## When to Use

- ✅ Перед любой фазой разработки
- ✅ После инициализации проекта

## Инструкции

### Шаг 1: Git
```bash
git rev-parse --git-dir || echo "ERROR"
```

### Шаг 2: Ветка develop
```bash
git branch --list | grep develop
```

### Шаг 3: .gitignore
```bash
test -f .gitignore
```

## Результат
- Все пройдены → продолжаем
- Есть ошибки → останавливаемся

## Блокирующий
Да
```

---

## 8. Git Workflow интеграция

```typescript
export const gitWorkflow = {
  async preCommitCheck($: any, directory: string): Promise<boolean> {
    const status = await $.command`git status --porcelain`.text();
    if (!status.trim()) return false;
    
    const branch = await $.command`git branch --show-current`.text();
    // Проверка Conventional Commits формата
    
    return true;
  },

  async createFeatureBranch($: any, directory: string, taskName: string) {
    const branchName = taskName.toLowerCase().replace(/\s+/g, "-");
    await $.command`git checkout -b feature/${branchName}`;
    return `feature/${branchName}`;
  }
};
```

---

## 9. Утверждение пользователя

```typescript
export const userApproval = {
  async suggestNextStep(client: any, phase: string, nextAgent: string, task: string) {
    await client.session.prompt({
      body: `✅ Фаза "${phase}" завершена!
      
Следующий шаг: ${nextAgent}

Выполню:
task '{
  "subagent_type": "${nextAgent}",
  "prompt": "${task}"
}'

Продолжить? (да/нет)`
    });
  }
};
```

**Примечание:** OpenCode не имеет прямого API для "Да/Нет" — требует workaround через промпт и ожидание ответа.

---

## 10. Реестр агентов плагина

| Агент | Тип | Роль |
|-------|-----|------|
| `orc_planning_task_analyzer` | orc | Анализ задач, назначение агентов |
| `orc_testing_tdd_coordinator` | orc | Координация TDD по языкам |
| `speckit-constitution-agent` | speckit | Создание конституции |
| `speckit-specify-agent` | speckit | Создание спецификаций |
| `speckit-plan-agent` | speckit | Создание общего плана |
| `speckit-tasks-agent` | speckit | Разбивка на задачи |
| `specification-analyst` | speckit | Анализ противоречий и пробелов |
| `work_dev_project_initializer` | work | Инициализация проекта |
| `work_testing_python_specialist` | work | Python тестирование |
| `work_testing_go_specialist` | work | Go тестирование |
| `work_testing_ts_specialist` | work | TS/React тестирование |
| `work_backend_python_developer` | work | Python разработка |
| `work_backend_go_developer` | work | Go разработка |
| `work_frontend_react_developer` | work | React разработка |

---

## 11. Реестр скиллов плагина

| Скилл | Назначение |
|-------|------------|
| `pre-flight` | Pre-Flight проверки (10 пунктов) |
| `quality-gate` | Quality Gate проверки (Gates 1-5) |
| `analyze-state` | Анализ состояния проекта |
| `init-project` | Инициализация проекта |
| `git-workflow` | Git workflow операции |
| `speckit-constitution` | Создание конституции |
| `speckit-specify` | Создание спецификаций |
| `code-quality-checker` | Проверка качества кода |
| `security-analyzer` | Анализ безопасности |
| `bug-fixer` | Исправление багов |

---

## Итоговые метрики

| Компонент | Количество |
|-----------|------------|
| Агентов | ~20-25 |
| Скиллов | ~15-20 |
| Состояний | 4 (10/20/30/40) |
| Quality Gates | 5 |
| Pre-Flight пунктов | 10 |

---

**Примечание:** Архитектура адаптирована под возможности OpenCode с сохранением логики Qwen-расширения.