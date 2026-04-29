# OpenCode Orchestrator Kit (плагин для opencode)

**ВАЖНО: Все ответы, комментарии, документация и отчёты должны быть на РУССКОМ ЯЗЫКЕ.**

---

## 🛑 ГЛАВНОЕ ПРАВИЛО: ДЕЛЕГИРОВАНИЕ

**ВСЕГДА используй специализированного агента для кода!**

| Задача | Агент | Как вызвать |
|--------|-------|------------|
| Python код | `python-developer` | `task subagent_type: "python-developer"` |
| Go код | `go-developer` | `task subagent_type: "go-developer"` |
| Frontend (React) | `react-developer` | `task subagent_type: "react-developer"` |
| Python тесты | `python-specialist` | `task subagent_type: "python-specialist"` |
| Go тесты | `go-specialist` | `task subagent_type: "go-specialist"` |
| TS/React тесты | `ts-specialist` | `task subagent_type: "ts-specialist"` |
| Code review | `code-reviewer` | `task subparameter_name: "code-reviewer"` |
| Security audit | `security-auditor` | `task subagent_type: "security-auditor"` |

**ЗАПРЕЩЕНО делать код самому, если есть специализированный агент!**

---

## 🔄 Speckit Workflow (Spec-Driven Development)

Стандартный 7-этапный процесс:

```
1. speckit.constitution    → Создание конституции (ПЕРВАЯ команда!)
2. speckit.specify       → Создание спецификаций модулей
3. speckit.clarify      → Уточнение спецификаций (опционально)
4. speckit.plan        → Создание плана реализации
5. speckit.tasks        → Разбивка на задачи
6. speckit.analyze      → Анализ согласованности
7. speckit.implement   → Реализация (TDD: тесты → код)
```

### Использование через Skills

```bash
skill: analyze-state
skill: init-project
skill: git-workflow

# Speckit workflow
skill: speckit.constitution   # → state 3
skill: speckit.specify        # → state 4
skill: speckit.clarify       # → уточнение
skill: speckit.plan          # → state 5
skill: speckit.tasks         # → state 6
skill: speckit.analyze       # → проверка перед implement
```

---

## 📂 Поддерживаемые форматы директорий

Важно: Проверяй ВСЕ локации (приоритет сверху вниз):

| Компонент | Speckit (новый) | utA | Корень |
|-----------|-----------------|-----|--------|
| Constitution | `.specify/memory/constitution.md` | `SPEC/memory/constitution.md` | `CONSTITUTION.md` |
| Specs | `.specify/specs/` | `SPEC/specs/` | `specs/` |
| Plan | `.specify/plan.md` | `SPEC/plan.md` | `PLAN.md` |
| Tasks | `.specify/specs/tasks.md` | `SPEC/specs/tasks.md` | `TASKS.md` |

---

## 🚫 Блокирующие правила

### Аварийный тормоз
Перед запуском любого агента проверяется:
- ✅ Плагин Orchestrator Kit загружен
- ✅ Git инициализирован
- ✅ Pre-Flight проверки пройдены
- ✅ Пользователь подтвердил переход

### Запрет на самокодинг
**НЕЛЬЗЯ** писать код самостоятельно, если:
- Задача > 15 минут
- Есть специализированный агент для этого языка/фреймворка
- Это не тривиальная правка (комментарий, фор��атирование)

---

## 🔌 Как использовать агентов

### Пример 1: Python разработка

**НЕПРАВИЛЬНО:**
```
Я: Найди ошибку в engine.py и исправь
```

**ПРАВИЛЬНО:**
```
task subagent_type: "python-developer" prompt: "Исправь NameError в services/backtest/src/engine.py"
```

### Пример 2: Speckit Constitution

**ПРАВИЛЬНО:**
```
task subagent_type: "speckit-constitution" prompt: "Создай конституцию проекта MyProject"
```

---

## 📊 State Machine

| State | Название | Описание |
|-------|----------|----------|
| 1 | empty | Пустой проект |
| 2 | initialized | Git инициализирован |
| 3 | constitution | Конституция создана |
| 4 | specifications | Спецификации созданы |
| 5 | plan | План готов |
| 6 | tasks | Задачи назначены |
| 7 | testing | Тестовая фаза |
| 8 | coding | Кодинговая фаза |
| 9 | integration | Фаза интеграции |
| 10 | release | Релиз-готов |

---

## ⚡ Быстрый старт

```bash
# 1. Анализ состояния
skill: analyze-state

# 2. Pre-flight проверки
skill: pre-flight

# 3. Инициализация проекта
skill: init-project

# 4. Speckit workflow
skill: speckit.constitution
# → skill: speckit.specify
# → skill: speckit.plan
# → skill: speckit.tasks
# → skill: speckit.analyze

# 5. Делегирование задачи
task subagent_type: "python-developer" prompt: "..."
```

---

*Документ обновлён для поддержки Speckit workflow и множественных форматов директорий.*