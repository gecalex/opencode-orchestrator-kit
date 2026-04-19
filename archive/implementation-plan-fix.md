# План: Исправление инициализации проекта

## Проблема

Оркестратор не вызывает project-initializer, состояние не обновляется после создания файлов.

## РЕШЕНИЕ (выполнено)

Состояния перенумерованы:
- State 1 = Пустой проект (директория создана, нет .git)
- State 2 = Проект инициализирован (.git есть)
- State 3 = Конституция создана
- State 4 = Спецификации созданы
- State 5 = План готов
- State 6 = Задачи назначены
- State 7 = Тестовая фаза
- State 8 = Кодинговая фаза
- State 9 = Фаза интеграции
- State 10 = Релиз-готов

### Workflow

```
Директория пустая (нет .git) → state 1
        ↓ project-initializer
State 1 → State 2 (инициализация)
        ↓ constitution-agent
State 2 → State 3 (конституция создана)
        ↓ specify-agent
State 3 → State 4 (с��ецификации)
        ↓ plan-agent
State 4 → State 5 (план)
        ↓ tasks-agent
State 5 → State 6 (задачи назначены)
```

## Файлы изменены

1. `src/state-machine.ts` - STATES, TRANSITIONS, detectStateFromFS
2. `src/types.ts` - ProjectStateCode
3. `src/session-hooks.ts` - agentsByState
4. `src/blocking-rules.ts` - checkStateValid
5. `.opencode/skills/analyze-state/SKILL.md`