# OpenCode Orchestrator Kit

Плагин оркестрации разработки на основе Speckit/TDD методологии для OpenCode.

## Возможности

- **Машина состояний** — 10 состояний проекта (0-90) с автоматическим определением
- **TDD Workflow** — обязательное разделение TEST/CODE задач
- **Quality Gates** — 6 ворот качества (Pre-Execution, Post-Execution, Pre-Commit, Pre-Merge, Pre-Implementation, MCP Check)
- **Git Workflow** — автоматическое создание feature-веток, проверка коммитов, блокировка мержа без подтверждения
- **MCP Dynamic Resolution** — реестр из 20+ MCP серверов для различных технологий
- **Блокирующие правила** — автоматическая проверка пре-условий и безопасности
- **16 агентов** — специализированные агенты для разных задач
- **8 скиллов** — управление анализом, качеством, безопасностью

## Установка

```bash
# Клонирование репозитория
git clone https://github.com/your-repo/opencode-orchestrator-kit.git
cd opencode-orchestrator-kit

# Установка зависимостей
npm install

# Сборка плагина
npm run build
```

## Конфигурация

Добавьте в ваш `opencode.json`:

```json
{
  "plugin": ["./node_modules/opencode-orchestrator-kit/dist/index.js"]
}
```

## Структура проекта

```
├── src/                      # TypeScript код плагина
│   ├── index.ts              # Точка входа
│   ├── state-machine.ts      # Машина состояний
│   ├── quality-gates.ts      # Quality Gates
│   ├── mcp-registry.ts      # MCP серверы
│   ├── git-workflow.ts       # Git операции
│   └── ...
├── .opencode/               # Ресурсы плагина
│   ├── agents/              # 16 агентов
│   └── skills/              # 8 скиллов
├── dist/                    # Скомпилированный JS
├── AGENTS.md                # Документация
└── package.json
```

## Использование

### Анализ состояния
```bash
opencode speckit-analyze-state
```

### Pre-Flight проверка
```bash
opencode speckit-pre-flight-check
```

### Quality Gate
```bash
opencode speckit-quality-gate-run --gate preExecution
```

### Поиск MCP серверов
```bash
opencode speckit-mcp-search --technology python
```

## Агенты

- **Оркестратор**: planning-task-analyzer, tdd-coordinator
- **Спецификации**: constitution-agent, specify-agent, specification-analyst
- **Планирование**: plan-agent, tasks-agent
- **Разработка**: python-developer, go-developer, react-developer
- **Тестирование**: python-specialist, go-specialist, ts-specialist
- **Рецензирование**: code-reviewer, security-auditor

## Скиллы

- analyze-state — анализ состояния проекта
- code-quality-checker — проверка качества кода
- git-workflow — Git операции
- init-project — инициализация проекта
- pre-flight — предварительные проверки
- quality-gate — контроль качества
- security-analyzer — анализ безопасности
- mcp-manager — управление MCP серверами

## Требования

- Node.js 18+
- TypeScript 5.0+
- OpenCode CLI

## Лицензия

MIT