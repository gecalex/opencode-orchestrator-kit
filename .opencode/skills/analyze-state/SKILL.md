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

### Шаг 5: Определение кода

```
Нет .git → 1 (пустой проект)
Есть .git, нет CONSTITUTION.md → 2 (инициализирован)
Есть .git, есть CONSTITUTION.md, нет specs/ → 3 (constitution)
Есть .git, есть CONSTITUTION.md, есть specs/, нет PLAN.md → 4 (specifications)
Есть .git, есть CONSTITUTION.md, есть specs/, есть PLAN.md → 5 (plan)
```
Нет .git → 1 (пустой проект)
Есть .git, нет CONSTITUTION → 2 (инициализирован)
Есть CONSTITUTION, нет specs → 3 (constitution)
Есть CONSTITUTION, есть specs, нет PLAN → 4 (спецификации)
Есть CONSTITUTION, есть specs, есть PLAN → 5 (план)
```

## Результат

Возвращает код состояния и описание:

```
Состояние проекта: 4 (specifications)

Разрешённые агенты: project-initializer, constitution-agent, specify-agent, plan-agent
Запрещённые агенты: tasks-agent, python-developer
```

## Использование

```
skill: analyze-state
```