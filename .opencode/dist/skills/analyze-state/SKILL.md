---
name: analyze-state
description: Анализ состояния проекта — определение кода состояния (1-10), проверка наличия кода, спецификаций, конституции.
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

## Инструкции

### Шаг 1: Проверка наличия .git

```bash
test -d .git && echo "yes"
```

### Шаг 2: Проверка наличия конституции

```bash
test -f CONSTITUTION.md && echo "yes"
```

### Шаг 3: Проверка наличия спецификаций

```bash
find specs -type f -name "*.md" 2>/dev/null | head -1
```

### Шаг 4: Проверка наличия плана

```bash
test -f PLAN.md && echo "yes"
```

### Шаг 5: Проверка наличия задач

```bash
test -f TASKS.md && echo "yes"
```

### Шаг 6: Определение кода

```
Нет .git → 1 (пустой проект)
Есть .git, нет CONSTITUTION.md → 2 (инициализирован)
Есть .git, есть CONSTITUTION.md, нет specs/ → 3 (constitution)
Есть .git, есть CONSTITUTION.md, есть specs/, нет PLAN.md → 4 (specifications)
Есть .git, есть CONSTITUTION.md, есть specs/, есть PLAN.md, нет TASKS.md → 5 (plan)
Есть .git, есть CONSTITUTION.md, есть specs/, есть PLAN.md, есть TASKS.md → 6 (tasks)
```

## Результат

Возвращает код состояния и описание:

```
Состояние проекта: 6 (tasks)

Разрешённые агенты: project-initializer, constitution-agent, specify-agent, plan-agent, task-agent
Запрещённые агенты: python-developer
```

## Использование

```
skill: analyze-state
```