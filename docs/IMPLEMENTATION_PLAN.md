# План реализации OpenCode Orchestrator Kit

**Дата:** 2026-04-17  
**Статус:** В РАЗРАБОТКЕ

---

## Реализованные задачи

| ID | Этап | Задача | Статус | Коммит |
|----|------|--------|--------|--------|
| T-001 | Подготовка | Инициализация структуры плагина | ✅ Выполнено | 5a98336 |
| T-001-fix | Исправления | Приведение имён агентов к структуре OpenCode | ✅ Выполнено | f6e2a2d |

---

## Оставшиеся задачи

| ID | Этап | Задача | Ожидаемый результат | Зависимости |
|----|------|--------|---------------------|-------------|
| T-002 | Агенты | Добавить React разработчика и TS тестировщика | agents/frontend/worker/react-developer.md, agents/testing/worker/ts-specialist.md | T-001 |
| T-003 | Агенты | Добавить speckit-агентов (specify, plan, tasks, analyst) | agents/speckit/specify-agent.md, agents/speckit/plan-agent.md, agents/speckit/tasks-agent.md, agents/speckit/specification-analyst.md | T-001 |
| T-004 | Скиллы | Добавить основные скиллы (analyze-state, init-project, git-workflow, code-quality-checker, security-analyzer) | skills/analyze-state/, skills/init-project/, skills/git-workflow/, skills/code-quality-checker/, skills/security-analyzer/ | T-001 |
| T-005 | Git | Добавить Git workflow модуль | src/git-workflow.ts | T-001 |
| T-006 | Модули | Добавить модули user-approval и orchestrator | src/user-approval.ts, src/orchestrator.ts | T-001 |
| T-007 | Конфиг | Обновить opencode.json с полным списком агентов и скиллов | opencode.json (полный) | T-002, T-003, T-004 |
| T-008 | Тест | Проверить плагин | Тестовая сборка | T-007 |

---

## Итоговые метрики (цель)

| Компонент | Целевое количество |
|-----------|-------------------|
| TypeScript модули | 8 (включая types) |
| Агенты | 20-25 |
| Скиллы | 15-20 |
| Состояния | 4 (10/20/30/40) |
| Quality Gates | 5 |
| Pre-Flight пунктов | 10 |

---

## Структура директорий

```
opencode-orchestrator-kit/
├── src/                    # TypeScript ядро
├── agents/                 # Агенты (иерархия domain/type)
│   ├── backend/worker/
│   ├── frontend/worker/
│   ├── testing/orchestrator/
│   ├── testing/worker/
│   ├── devops/worker/
│   ├── orchestrator/orchestrator/
│   ├── speckit/
│   ├── security/worker/
│   └── health/worker/
├── skills/                 # Скиллы (папка/SKILL.md)
├── docs/                   # Документация
└── opencode.json           # Манифест плагина
```