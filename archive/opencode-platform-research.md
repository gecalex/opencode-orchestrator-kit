# Исследование платформы OpenCode

**Дата:** 2026-04-17  
**Статус:** ✅ ИССЛЕДОВАНИЕ ЗАВЕРШЕНО

---

## 0.1 Плагинная система (Plugin System)

### Точка входа
- Плагин — это асинхронная функция, экспортируемая из `index.ts`
- Сигнатура: `export const MyPlugin: Plugin = async (ctx) => { return { ... } }`
- Типы импортируются из `@opencode-ai/plugin`

### Жизненный цикл (хук-и)
- `event` — подписка на события (`session.created`, `session.idle`, `session.updated`)
- `tool.execute.before` — перед выполнением любого инструмента
- `tool.execute.after` — после выполнения инструмента
- `chat.message` — при обработке сообщений
- `tui.prompt.append`, `tui.command.execute`, `tui.toast.show`

### Структура контекста (`PluginInput`)
- `project` — метаданные текущего проекта
- `client` — SDK-клиент для взаимодействия с OpenCode API
- `$` — интерфейс выполнения shell-команд (Bun shell)
- `directory` — текущая рабочая директория
- `worktree` — путь к Git worktree

### Организация файловой структуры
- Локальные плагины: `.opencode/plugins/` (проект) или `~/.config/opencode/plugins/` (глобально)
- Конфигурация в `opencode.json` / `opencode.jsonc`
- Поддержка npm-пакетов через поле `plugins` в конфиге

---

## 0.2 Агенты (Agents)

### Определение агентов
- В `.md` файлах с YAML-фронтматтером
- Директории: `.opencode/agents/` (проект) или `~/.config/opencode/agents/` (глобально)

### Обязательные поля YAML
- `name` — имя агента
- `description` — описание (показывается при выборе subagent)
- `mode` — режим: `primary`, `subagent`, или `all`
- `tools` — разрешённые инструменты
- `permission` — права доступа (allow/deny/ask)

### Разница между primary и subagent
- `primary` — главный агент, пользователь переключается через Tab или селектор
- `subagent` — вызывается другими агентами через `task`
- `all` — может быть и тем, и другим

### Поиск агентов
- OpenCode сканирует `.opencode/agents/*.md`
- Поддерживаются вложенные папки

**Известные проблемы (bugs):**
- Баг #22130: Subagents неправильно обрабатываются как primary при указании в `opencode.json`
- Баг #12254: Дубликаты YAML-ключей вызывают молчаливый парсинг-фейл

---

## 0.3 Скиллы (Skills)

### Определение скиллов
- В файлах `SKILL.md` с YAML-фронтматтером
- Каждый скилл — в своей папке: `skills/<skill-name>/SKILL.md`

### Поиск скиллов
- `.opencode/skills/` (проект)
- `~/.config/opencode/skills/` (глобально)
- `.claude/skills/` (совместимость с Claude Code)
- `.agents/skills/`

### Обязательные поля фронтматтера
- `name` — должно совпадать с именем папки
- `description` — 1-1024 символа
- `license` (опционально)
- `compatibility` (опционально)

### Валидация имён
- 1-64 символа
- lowercase alphanumeric с одинарными дефисами
- Не начинаться/заканчиваться на `-`
- Совпадать с именем папки

---

## 0.4 Взаимодействие с пользователем

### API для интерактивных запросов
- Через `client.session.prompt()` — отправка сообщений пользователю
- Пример использования в плагине: `await client.session.prompt({ ... })`
- Типичные сценарии: запрос подтверждения, выбор из списка

**Ограничение:** Нет прямого API для "Да/Нет" — требует workaround через промпт и ожидание ответа

---

## 0.5 Валидация и Quality Gates

### Механизмы проверки
- **Нет встроенных механизмов** — реализуется через внешние команды (`run_shell_command`)
- Проверка синтаксиса: вызов компиляторов/линтеров (`python -m py_compile`, `tsc --noEmit`, `go vet`)
- Линтинг Markdown: внешние утилиты
- Валидация JSON/YAML: `jq`, Python PyYAML

### Хуки для pre-commit
- Можно реализовать через `tool.execute.before` — перехват вызовов bash
- Проверка перед коммитом: анализ аргументов команды `git commit`

---

## Источники информации

1. Официальная документация: https://dev.opencode.ai/docs/plugins/
2. GitHub репозиторий: https://github.com/anomalyco/opencode
3. OpenCode Plugin Guide (Gist): https://gist.github.com/rstacruz/946d02757525c9a0f49b25e316fbe715
4. Agent Skills Guide: https://dev.opencode.ai/docs/skills/
5. Community плагины и шаблоны

---

**Примечание:** Некоторые детали требуют уточнения на практике, так как документация частично устарела.