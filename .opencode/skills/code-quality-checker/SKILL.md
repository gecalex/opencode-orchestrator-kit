---
name: code-quality-checker
description: Проверка качества кода — синтаксис, линтинг, форматирование, type checking.
compatibility: opencode
---

## When to Use

Используй этот скилл:

- ✅ Перед коммитом (Quality Gate 3)
- ✅ После написания кода
- ✅ Перед merge в develop

## Проверки по языкам

### Python

```bash
# Синтаксис
python -m py_compile *.py

# Линтинг
ruff check .

# Форматирование
ruff format .

# Типизация (если есть mypy)
mypy .
```

### TypeScript/JavaScript

```bash
# Синтаксис
npx tsc --noEmit

# Линтинг
npx eslint . --ext .ts,.tsx

# Форматирование
npx prettier --check .
```

### Go

```bash
# Синтаксис и vet
go vet ./...

# Форматирование
go fmt ./...

# Линтинг (если есть golangci-lint)
golangci-lint run
```

## Структура проверок

| Проверка | Инструмент | Блокирующая |
|----------|------------|-------------|
| Синтаксис | py_compile, tsc, go vet | ✅ |
| Линтинг | ruff, eslint, golangci-lint | ✅ |
| Форматирование | ruff format, prettier, go fmt | ❌ |
| Типизация | mypy, tsc --strict | ❌ |

## Инструкции

### Шаг 1: Определить язык проекта

```bash
ls *.py 2>/dev/null && echo "Python"
ls *.ts *.tsx 2>/dev/null && echo "TypeScript"
ls go.mod 2>/dev/null && echo "Go"
```

### Шаг 2: Выполнить проверки

```bash
# Выполнить все проверки для определённого языка
```

### Шаг 3: Проверить результаты

- Все проверки пройдены → можно коммитить
- Есть ошибки → исправить и повторить

## Результат

```
=== Проверка качества кода ===

✅ Python синтаксис
✅ ruff lint
✅ ruff format

Результат: ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ
```

## Использование

```
skill: code-quality-checker
  language: python
```

или

```
skill: code-quality-checker
```