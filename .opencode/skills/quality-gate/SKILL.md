---
name: quality-gate
description: "Quality Gate проверки качества. 5 ворот: Pre-Execution, Post-Execution, Pre-Commit, Pre-Merge, Pre-Implementation."
compatibility: opencode
---

## When to Use

Используй этот скилл:

- ✅ Перед коммитом (Gate 3)
- ✅ После выполнения задачи (Gate 2)
- ✅ Перед слиянием веток (Gate 4)
- ✅ Перед реализацией (Gate 5)

## Gates

### Gate 1: Pre-Execution
Проверка корректности задачи перед выполнением.

- Задача определена
- Агент указан

**Блокирующая:** ❌

### Gate 2: Post-Execution
Верификация результата после выполнения.

- Задача выполнена (status: success)
- Есть результат

**Блокирующая:** ❌

### Gate 3: Pre-Commit
Валидация перед коммитом.

- Python синтаксис: `python -m py_compile *.py`
- TypeScript: `npx tsc --noEmit`
- Go: `go vet ./...`
- Линтинг Markdown

**Блокирующая:** ✅

### Gate 4: Pre-Merge
Интеграционные проверки перед слиянием.

- Ветка влита в develop
- Нет конфликтов

**Блокирующая:** ✅

### Gate 5: Pre-Implementation
Проверка спецификаций перед реализацией.

- Спецификация существует
- Есть описание модуля

**Блокирующая:** ✅

## Инструкции

### Запуск Gate 3 (Pre-Commit)

```bash
# Определить язык проекта
ls *.py && echo "Python"
ls *.ts && echo "TypeScript"
ls go.mod && echo "Go"

# Проверить синтаксис
python -m py_compile *.py
npx tsc --noEmit
go vet ./...

# Линтинг
ruff check .
markdownlint .
```

### Запуск Gate 4 (Pre-Merge)

```bash
git branch --merged develop
git status --porcelain
```

## Результат

- Все проверки пройдены → можно продолжать
- Gate 3/4/5 провален → **ЗАПРЕЩЕНО** продолжать

## Блокирующие Gates

Gates 3, 4, 5 являются блокирующими и останавливают процесс при ошибках.