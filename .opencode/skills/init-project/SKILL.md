---
name: init-project
description: Инициализация проекта — проверка расширения, создание структуры директорий, базовая настройка.
compatibility: opencode
---

## When to Use

Используй этот скилл:

- ✅ При создании нового проекта
- ✅ Перед началом разработки
- ✅ Для проверки окружения

## Инструкции

### Шаг 1: Проверка расширения

```bash
test -d ~/.opencode/extensions/ || echo "Расширение не установлено"
```

### Шаг 2: Создание структуры директорий

```bash
mkdir -p .opencode/agents
mkdir -p .opencode/skills
mkdir -p .opencode/specify/specs
mkdir -p .opencode/specify/memory
mkdir -p scripts
mkdir -p docs
```

### Шаг 3: Инициализация Git (если не инициализирован)

```bash
git rev-parse --git-dir || git init && git checkout -b develop
```

### Шаг 4: Создание .gitignore (если отсутствует)

```bash
test -f .gitignore || echo "node_modules/\n__pycache__/\n*.pyc" > .gitignore
```

### Шаг 5: Запуск Pre-Flight проверок

```bash
skill: pre-flight
```

## Результат

- Структура директорий создана
- Git инициализирован (если нужно)
- .gitignore создан (если нужно)
- Pre-Flight проверки выполнены

## Использование

```
skill: init-project
```