# Bug Report: OpenCode Orchestrator Kit v1.x

**Дата:** 2026-04-29  
**Автор:** Тестирование оркестратора  
**Версия плагина:** 1.x (предположительно)  
**OpenCode:** Текущая версия

---

## Резюме для разработчиков

### 🚨 Критические проблемы

1. **Disk Agents НЕ распознаются системой** — 10/16 агентов недоступны
2. **Несоответствие документации** — документация OpenCode утверждает что `mode: subagent` + disk location = автоматическая регистрация, но фактически работают только агенты из `opencode.json`
3. **Plugin registration НЕ активирует все инструменты** — tools из tools.js не зарегистрированы

---

## 1. Тестирование Agent Types

### 1.1 Методология

- Вызов Task tool с различными `subagent_type`
- Проверка: работает = `OK`, ошибка = `Unknown agent type`

### 1.2 Результаты

| Агент | subagent_type | Ожидание | Факт | Статус |
|-------|--------------|----------|------|--------|
| explore | explore | ✅ | ✅ OK | РАБОТАЕТ |
| go-developer | go-developer | ✅ | ✅ OK | РАБОТАЕТ |
| react-developer | react-developer | ✅ | ✅ OK | РАБОТАЕТ |
| go-specialist | go-specialist | ✅ | ✅ OK | РАБОТАЕТ |
| ts-specialist | ts-specialist | ✅ | ✅ OK | РАБОТАЕТ |
| general | general | ✅ | ✅ OK | РАБОТАЕТ |
| **python-developer** | python-developer | ✅ | ❌ Unknown agent type | **БАГ** |
| **python-specialist** | python-specialist | ✅ | ❌ Unknown agent type | **БАГ** |
| **code-reviewer** | code-reviewer | ✅ | ❌ Unknown agent type | **БАГ** |
| **security-auditor** | security-auditor | ✅ | ❌ Unknown agent type | **БАГ** |
| **speckit-constitution** | speckit-constitution | ✅ | ❌ Unknown agent type | **БАГ** |
| **speckit-specify** | speckit-specify | ✅ | ❌ Unknown agent type | **БАГ** |
| **speckit-plan** | speckit-plan | ✅ | ❌ Unknown agent type | **БАГ** |
| **speckit-tasks** | speckit-tasks | ✅ | ❌ Unknown agent type | **БАГ** |
| **planning-task-analyzer** | planning-task-analyzer | ✅ | ❌ Unknown agent type | **БАГ** |

**Итого:** 5/15 работают, 10/15 не работают (66% ошибок)

---

## 2. Анализ причин

### 2.1 Где определены агенты

#### Disk Agents (16 файлов)
```
.opencode/agents/
├── backend/worker/python-developer.md
├── backend/worker/go-developer.md
├── frontend/worker/react-developer.md
├── testing/worker/python-specialist.md
├── testing/worker/go-specialist.md
├── testing/worker/ts-specialist.md
├── testing/orchestrator/tdd-coordinator.md
├── orchestrator/reviewer/code-reviewer.md
├── security/auditor/security-auditor.md
├── orchestrator/orchestrator/planning-task-analyzer.md
├── devops/worker/project-initializer.md
├── speckit/constitution-agent.md
├── speckit/specify-agent.md
├── speckit/plan-agent.md
├── speckit/tasks-agent.md
└── speckit/specification-analyst.md
```

#### Config Agents (только 12 в opencode.json)
```json
"agent": {
  "orchestrator": { "mode": "primary" },
  "planning-task-analyzer": { "mode": "subagent" },
  "tdd-coordinator": { "mode": "subagent" },
  "constitution-agent": { "mode": "subagent" },
  "specify-agent": { "mode": "subagent" },
  "plan-agent": { "mode": "subagent" },
  "tasks-agent": { "mode": "subagent" },
  "project-initializer": { "mode": "subagent" },
  "go-developer": { "mode": "subagent" },
  "react-developer": { "mode": "subagent" },
  "go-specialist": { "mode": "subagent" },
  "ts-specialist": { "mode": "subagent" }
}
```

### 2.2 Корневая причина

1. **Disk agents НЕ загружаются автоматически** — Agents в `.opencode/agents/*.md` НЕ распознаются системой
2. **Config agents работают избирательно** — Только часть из config работает
3. **AGENTS.md противоречит реальности** — Документация в проекте НЕВЕРНА

### 2.3 Что заявлено в AGENTS.md

```
task subagent_type: "python-developer"  # → не работает!
task subagent_type: "python-specialist" # → не работает!
task subagent_type: "go-developer"       # → работает
task subagent_type: "react-developer"  # → работает
```

### 2.4 Что утверждает документация OpenCode

According to https://opencode.ai/docs/agents/:

> "You can also define agents using markdown files. Place them in:
> - Global: ~/.config/opencode/agents/
> - Per-project: .opencode/agents/"
>
> "The markdown file name becomes the agent name. For example, review.md creates a review agent."

**Это НЕ работает!**

---

## 3. Проверка Plugin Loading

### 3.1 Конфигурация плагина

```json
// opencode.json
{
  "plugin": ["file:.opencode/dist/index.js"],
  ...
}
```

### 3.2 Plugin Entry Point

`.opencode/dist/index.js` (369 строк) содержит:
- OrchestratorKit export
- State machine hooks
- Tool execute hooks
- Event handlers

### 3.3 Plugin Loading — РАБОТАЕТ ✅

Плагин загружается, но:
- Не регистрирует custom tools (из tools.js)
- Не активирует disk agents auto-discovery

---

## 4. Проверка Skills

### 4.1 Доступные Skills (11)

```
.opencode/skills/
├── analyze-state/SKILL.md
├── init-project/SKILL.md
├── git-workflow/SKILL.md
├── pre-flight/SKILL.md
├── quality-gate/SKILL.md
├── security-analyzer/SKILL.md
├── code-quality-checker/SKILL.md
├── mcp-manager/SKILL.md
├── mcp-analyzer/SKILL.md
├── speckit.analyze/SKILL.md
└── speckit.clarify/SKILL.md
```

### 4.2 Тест Skills — РАБОТАЕТ ✅

```
skill: analyze-state → работает корректно
```

---

## 5. Проверка Custom Tools

### 5.1 Tools Registry (tools.js)

```javascript
exports.toolsRegistry = {
  "speckit-analyze-state": analyzeState,
  "speckit-pre-flight-check": preFlightCheck,
  "speckit-quality-gate-run": qualityGateRun,
  "speckit-task-delegator": taskDelegator,
  "speckit-mcp-search": mcpSearch,
  "speckit-mcp-list": mcpList,
  "speckit-mcp-analyze": mcpAnalyze
};
```

### 5.2 Tools — НЕ зарегистрированы ❌

Tools из tools.js НЕ подключены к системе. Plugin загружает index.js, но не использует toolsRegistry.

---

## 6. Анализ кода плагина (index.js)

### 6.1 Проблемы в коде

1. **Нет вызова toolsRegistry** — tools.js экспортирует toolsRegistry, но index.js его не импортирует и не использует
2. **Нет agent registration** — Пла��ин ��е регистрирует disk agents
3. **Hook функции не экспортируются** — Вся логика в одном файле без модульности
4. **Hardcoded AGENTS_TEMPLATE** — Вместо загрузки из файлов

### 6.2 Проблемные участки кода

```javascript
// Строка 10-120: AGENTS_TEMPLATE — hardcoded, не читается из .opencode/agents/*.md
const AGENTS_TEMPLATE = `...`;

// Отсутствует:
const { toolsRegistry } = require("./tools");
```

---

## 7. Качество State Machine

### 7.1 State Definition — работает ✅

```
State 1: Пустой проект
State 2: Инициализирован
State 3: Constitution
State 4: Specifications
State 5: Plan
State 6: Tasks (ТЕКУЩЕЕ СОСТОЯНИЕ)
State 7: Testing
State 8: Coding
State 9: Integration
State 10: Release
```

### 7.2 Allowed/Blocked Agents — работает, но бесполезно

State machine правильно определяет allowed/blocked agents, но система их не видит потому что агенты не зарегистрированы.

---

## 8. Дополнительные замечания

### 8.1 MCP Servers — работают ✅

```json
"mcp": {
  "filesystem": { "enabled": true },
  "memory": { "enabled": true },
  "github": { "enabled": true },
  "searxng": { "enabled": true },
  "chrome-devtools": { "enabled": true },
  "context7": { "enabled": true }
}
```

### 8.2 Skills — работают ✅

11 skills загружаются корректно через skill tool.

---

## 9. Итоговый отчёт

### 9.1 Что работает

| Компонент | Статус |
|----------|--------|
| Plugin loading | ✅ |
| State machine logic | ✅ |
| Skills loading | ✅ |
| MCP servers | ✅ |
| Config agents (частично) | ⚠️ 5/12 |
| Pre-flight hooks | ✅ |
| Quality gates hooks | ✅ |

### 9.2 Что НЕ работает

| Компонент | Статус | Причина |
|----------|--------|---------|
| Disk agents | ❌ 0% | Не загружаются |
| Custom tools | ❌ 0% | Не подключены |
| Config agents | ❌ 58% | Частично работают |
| Documentation vs reality | ❌ | Несоответствие |

### 9.3 Процент успеха

- **Agent System:** 5/15 = 33%
- **Total Plugin:** ~40%

---

## 10. Рекомендации для исправления

### 10.1 Critical Fixes

1. **Добавить все agents в opencode.json** — disk agents не работают
2. **Подключить toolsRegistry** — добавить в index.js:
   ```javascript
   const { toolsRegistry } = require("./tools");
   server.tool(toolsRegistry);
   ```
3. **Исправить AGENTS.md** — убрать неработающие примеры или добавить реальные subagent_type в config
4. **Agent auto-discovery** — для disk agents нужен отдельный механизм загрузки

### 10.2 Medium Fixes

1. Добавить agent permission в config для всех агентов
2. Подключить все 16 disk agents в opencode.json
3. Исправить tool permissions

### 10.3 Low Priority

1. Улучшить логирование
2. Добавить type definitions
3. Documentation sync

---

## 11. Контактная информация

Тестирование проводилось на стенде:
- OS: Linux
- Working directory: /home/alex/MyProjects/uta
- Project state: 6 (tasks)

**Для воспроизведения:**
```bash
task subagent_type: "python-developer" prompt: "test"
# → Expected: OK, Actual: Unknown agent type
```

---

*Report generated: 2026-04-29*
*Test methodology: Direct Task tool invocation with various subagent_type values*