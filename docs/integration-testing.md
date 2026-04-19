# Интеграционное тестирование плагина

## Подготовка тестового проекта

### 1. Создать тестовый проект
```bash
mkdir test-orchestrator-project
cd test-orchestrator-project
git init
git checkout -b develop
```

### 2. Настроить OpenCode с плагином

Создать `opencode.json`:
```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "file:///путь/к/opencode_orc_kit/.opencode/dist/index.js"
  ],
  "agent": {
    "python-developer": {
      "description": "Python разработка с TDD",
      "mode": "subagent"
    }
  }
}
```

### 3. Настроить MCP (опционально)
```json
{
  "mcp": {
    "filesystem": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-filesystem", "./src"]
    },
    "memory": {
      "type": "local", 
      "command": ["npx", "-y", "@modelcontextprotocol/server-memory"]
    }
  }
}
```

## Тестовые сценарии

### Тест 1: Анализ состояния
```bash
opencode speckit-analyze-state
```
**Ожидаемый результат:** Определение состояния 0 (инициализация)

### Тест 2: Pre-Flight проверка
```bash
opencode speckit-pre-flight-check
```
**Ожидаемый результат:** Список проверок с результатами

### Тест 3: Создание конституции
- Запустить агента `constitution-agent`
- Создать `PROJECT.md`
**Ожидаемый результат:** Состояние переходит в 10

### Тест 4: Git Workflow проверка
- Попробовать сделать commit в ветке `develop`
**Ожидаемый результат:** Блокировка с сообщением о необходимости feature-ветки

### Тест 5: Создание feature-ветки
```bash
git checkout -b feature/test-task
```
**Ожидаемый результат:** Ветка создана, блокировка снята

### Тест 6: MCP поиск
```bash
opencode speckit-mcp-search --technology python
```
**Ожидаемый результат:** Список MCP серверов для Python

### Тест 7: MCP список
```bash
opencode speckit-mcp-list
```
**Ожидаемый результат:** Все MCP серверы по категориям

### Тест 8: Quality Gate Pre-Execution
```bash
opencode speckit-quality-gate-run --gate preExecution
```
**Ожидаемый результат:** Результат проверки

### Тест 9: TDD Workflow
- Создать TEST задачу
- Запустить тесты (должны упасть)
- Создать CODE задачу
- Запустить тесты (должны пройти)
**Ожидаемый результат:** Блокировка CODE до прохождения TEST

### Тест 10: Мерж в develop
```bash
git checkout develop
git merge feature/test-task
```
**Ожидаемый результат:** Quality Gate 4 проверка + подтверждение

## Критерии успешного теста

| Тест | Критерий |
|------|----------|
| 1-2 | Инструменты работают без ошибок |
| 3-4 | Блокировка работает корректно |
| 5 | Feature-ветки создаются правильно |
| 6-7 | MCP поиск возвращает результаты |
| 8 | Quality Gates выполняются |
| 9 | TDD блокировка работает |
| 10 | Мерж требует подтверждения |

## Устранение проблем

### Плагин не загружается
- Проверить путь в `opencode.json`
- Проверить `npm run build` без ошибок

### Ошибки TypeScript
- Запустить `npm run typecheck`
- Исправить ошибки типизации

### MCP не работает
- Проверить установку npx
- Проверить настройки в opencode.json

## Отчёт о тестировании

После каждого теста заполнить:
- **Тест №**: 
- **Команда**: 
- **Результат**: 
- **Ожидание**: 
- **Статус**: ✅ / ❌