# План этапа 2: MCP Registry и инструменты

## Цель
Создать полноценный реестр MCP серверов и инструменты управления для OpenCode Orchestrator Kit.

## Выполнено

### 1. Исследование MCP серверов
Изучены источники:
- modelcontextprotocol/servers (официальные серверы)
- awesome-mcp-servers (сообщество)
- OpenCode Docs (интеграция)
- OpenCode Ecosystem (kratos, archon, in-memoria)

### 2. Создан реестр MCP серверов
Файл: `src/mcp-registry.ts`

Содержит 20+ MCP серверов в 12 категориях:
- filesystem, git, memory — файлы и контроль версий
- postgres, sqlite, supabase, neo4j — базы данных
- searxng — поиск
- playwright — браузерная автоматизация
- aws, kubernetes, sentry — DevOps
- slack, github, jira — коммуникация
- kratos, archon, in-memoria — OpenCode Ecosystem

### 3. Инструменты управления MCP
Добавлены в `src/tools.ts`:
- `speckit-mcp-search` — поиск по технологии/категории/тегу
- `speckit-mcp-list` — список всех MCP по категориям

### 4. Скилл MCP Manager
Создан: `.opencode/skills/mcp-manager/SKILL.md`

## Статус
- [x] Исследование доступных MCP серверов
- [x] Создание полноценного реестра MCP серверов
- [x] Добавление инструментов для поиска и установки MCP
- [ ] Интеграция MCP проверки в Quality Gates
- [x] Создание скилла для MCP управления

## Следующий этап
Этап 3: Интеграция с Quality Gate и финальная сборка