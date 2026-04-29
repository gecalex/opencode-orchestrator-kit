---
name: analyze-state
description: Анализ состояния проекта — определение кода состояния (1-10), проверка наличия спецификаций, конституции, плана, задач.
compatibility: opencode
---

## When to Use
Используй этот скилл:
- ✅ При старте сессии
- ✅ Перед началом любой фазы
- ✅ Для определения текущего состояния проекта

## Определение состояния

### Коды состояний

| Код | Состояние | Описание |
|-----|-----------|----------|
| **1** | empty | Проект пустой, нет ничего |
| **2** | initialized | Проект инициализирован (есть .git) |
| **3** | constitution | Конституция создана |
| **4** | specifications | Спецификации созданы |
| **5** | plan | План готов |
| **6** | tasks | Задачи назначены |
| **7** | testing | Тестовая фаза |
| **8** | coding | Кодинговая фаза |
| **9** | integration | Фаза интеграции |
| **10** | release | Релиз-готов |

## Важно: Поддержка форматов

Проверяй ВСЕ локации (приоритет сверху вниз):

1. **Speckit формат**: `.specify/` (НОВЫЙ стандарт)
2. **utA формат**: `SPEC/` (старый формат проекта uta)
3. **Корневой формат**: `CONSTITUTION.md`, `specs/`, `PLAN.md`, `TASKS.md`

## Инструкции

### Шаг 1: Проверка наличия .git

```bash
test -d .git && echo "yes"
```

### Шаг 2: Проверка наличия конституции

Проверяй в порядке приоритета:

```bash
# 1. Speckit формат
test -f .specify/memory/constitution.md && echo "specify"
# 2. utA формат
test -f SPEC/memory/constitution.md && echo "spec"
# 3. Корень проекта
test -f CONSTITUTION.md && echo "root"
```

### Шаг 3: Проверка наличия спецификаций

```bash
# 1. Speckit
find .specify/specs -type f -name "*.md" 2>/dev/null | head -1
# 2. utA
find SPEC/specs -type f -name "*.md" 2>/dev/null | head -1
# 3. Корень
find specs -type f -name "*.md" 2>/dev/null | head -1
```

### Шаг 4: Проверка наличия плана

```bash
# 1. Speckit
test -f .specify/plan.md && echo "yes"
# 2. utA
test -f SPEC/plan.md && echo "yes"
# 3. Корень
test -f PLAN.md && echo "yes"
```

### Шаг 5: Проверка наличия задач

```bash
# 1. Speckit
test -f .specify/specs/tasks.md && echo "yes"
# 2. utA
test -f SPEC/specs/tasks.md && echo "yes"
# 3. Корень
test -f TASKS.md && echo "yes"
```

### Шаг 6: Определение кода

```
Нет .git → 1 (пустой проект)

Есть .git, нет конституции (ни в одной локации) → 2 (инициализирован)
Есть .git, есть конституция, нет specs → 3 (constitution)

Есть .git, есть конституция, есть specs/, нет plan → 4 (specifications)
Есть .git, есть конституция, есть specs/, есть plan, нет tasks → 5 (plan)
Есть .git, есть конституция, есть specs/, есть plan, есть tasks → 6 (tasks)
```

## Результат

Возвращает код состояния и описание:

```
Состояние проект��: 6 (tasks)

Локации найдены:
- Constitution: .specify/memory/constitution.md
- Specs: .specify/specs/
- Plan: .specify/plan.md
- Tasks: .specify/specs/tasks.md

Разрешённые агенты: speckit-constitution, speckit-specify, speckit-plan, speckit-tasks
Запрещённые агенты: go-developer, python-developer
```

## Использование

```
skill: analyze-state
```