---
name: mcp-manager
description: Управление MCP серверами — поиск, установка и настройка Model Context Protocol серверов
version: 1.0.0
when_to_use: 
  - Когда нужно найти MCP сервер для технологии или задачи
  - При настройке нового окружения разработки
  - Для добавления внешних инструментов в OpenCode
---

# MCP Manager

Управляет MCP (Model Context Protocol) серверами для расширения возможностей OpenCode.

## Доступные инструменты

### speckit-mcp-search
Поиск MCP серверов в реестре.

**Параметры:**
- `technology` — технология (python, typescript, go, postgres, и т.д.)
- `category` — категория (database, search, filesystem, git, browser, devops, memory)
- `tag` — тег для поиска (файлы, поиск, мониторинг)

**Примеры:**
```
speckit-mcp-search --technology python
speckit-mcp-search --category database
speckit-mcp-search --tag "браузер"
```

### speckit-mcp-list
Список всех доступных MCP серверов по категориям.

**Пример:**
```
speckit-mcp-list
```

## Популярные MCP серверы

### Базы данных
- `postgres` — PostgreSQL (только чтение)
- `sqlite` — SQLite (полный доступ)
- `supabase` — Supabase
- `neo4j` — Neo4j графовая БД

### Поиск
- `context7` — Поиск документации
- `searxng` — Приватный веб-поиск (SearXNG)

### Файлы и Git
- `filesystem` — Файловые операции
- `git` — Git операции
- `github` — GitHub API интеграция

### Автоматизация
- `playwright` — Браузерная автоматизация

### Память
- `kratos` — Постоянная память для OpenCode
- `archon` — RAG для документов
- `memory` — Граф знаний

### DevOps
- `aws` — AWS инструменты
- `sentry` — Мониторинг ошибок

## Установка MCP сервера

### Локальный
```bash
opencode.json:
{
  "mcp": {
    "my-server": {
      "type": "local",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path"]
    }
  }
}
```

### Удаленный
```bash
opencode.json:
{
  "mcp": {
    "sentry": {
      "type": "remote",
      "url": "https://mcp.sentry.dev/mcp",
      "oauth": {}
    }
  }
}
```

## Категории MCP

| Категория | Описание |
|-----------|----------|
| database | Базы данных (SQL) |
| search | Поиск документации и веба |
| filesystem | Файловые операции |
| git | Контроль версий |
| browser | Автоматизация браузера |
| devops | DevOps инструменты |
| memory | Память и контекст |
| communication | Коммуникация (Slack и т.д.) |
| project-management | Управление проектами |
| code-intelligence | Анализ кода |

## Рекомендации

1. **Для начала работы:** установи `filesystem`, `git`, `memory`
2. **Для веб-разработки:** добавь `playwright`, `context7`
3. **Для DevOps:** добавь `sentry`, `aws`
4. **Не добавляй сразу все** — ограничь контекст