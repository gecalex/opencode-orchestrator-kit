---
name: speckit.analyze
description: Анализ согласованности артефактов — проверка соответствия между конституцией, спецификациями, планом и задачами.
compatibility: opencode
---

## When to Use

Используй этот скилл:

- ✅ После /speckit.tasks — перед /speckit.implement
- ✅ Перед quality gate
- ❌ НЕ используй перед созданием спецификаций

## Назначение

Проверить согласованность между всеми артефактами:
- Constitution → Specs
- Specs → Plan
- Plan → Tasks

## Инструкции

### Шаг 1: Прочитать все артефакты

Проверь наличие файлов (все локации):

```bash
# Constitution
test -f .specify/memory/constitution.md || test -f SPEC/memory/constitution.md || test -f CONSTITUTION.md

# Specs
find .specify/specs -name "*.md" 2>/dev/null | wc -l
find SPEC/specs -name "*.md" 2>/dev/null | wc -l

# Plan
test -f .specify/plan.md || test -f SPEC/plan.md || test -f PLAN.md

# Tasks
test -f .specify/specs/tasks.md || test -f SPEC/specs/tasks.md || test -f TASKS.md
```

### Шаг 2: Анализ Constitution → Specs

Проверь:
- [ ] Все модули из specs соответствуют целям constitution
- [ ] Нет модулей, не описанных в constitution

### Шаг 3: Анализ Specs → Plan

Проверь:
- [ ] Все модули учтены в плане
- [ ] Зависимости между модулями учтены

### Шаг 4: Анализ Plan → Tasks

Проверь:
- [ ] Все пункты плана разбиты на задачи
- [ ] Задачи упорядочены по зависимостям
- [ ] Нет пропущенных задач

### Шаг 5: Создание отчёта анализа

```markdown
# Анализ согласованности

## Constitution → Specs
✅ Соответствует / ⚠️ Несоответствует

## Specs → Plan
✅ Соответствует / ⚠️ Несоответствует

## Plan → Tasks
✅ Соответствует / ⚠️ Несоответствует

## Проблемы

### Критические
- none

### Предупреждения
- none
```

## Результат

```json
{
  "status": "analyzed",
  "constitution_specs": "consistent",
  "specs_plan": "consistent",
  "plan_tasks": "consistent",
  "critical_issues": 0,
  "warnings": 0
}
```

## Quality Gate

Используй перед /speckit.implement:

- ✅ Все артефакты согласованы → можно переходить к реализации
- ⚠️ Есть предупреждения → уточнить перед реализацией
- ❌ Есть критические проблемы → ОСТАНОВИТЬСЯ и исправить

## Использование

```
skill: speckit.analyze
```

## Workflow

```
speckit.constitution → speckit.specify → speckit.clarify → speckit.plan → speckit.tasks → speckit.analyze → speckit.implement
```