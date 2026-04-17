# Анализ расширения Qwen Orchestrator Kit

**Ветка:** `original-qwen-extension`  
**Дата:** 2026-04-17  
**Статус:** ✅ АНАЛИЗ ЗАВЕРШЁН

---

## 1. Файловая структура и ключевые компоненты

### Основные директории

| Директория | Назначение | Количество файлов |
|------------|------------|-------------------|
| `agents/` | Определения всех агентов системы | 43 файла |
| `skills/` | Навыки (skills) для агентов | 44 директории |
| `scripts/` | Скрипты автоматизации | 50+ файлов |
| `checklists/` | Чек-листы для различных фаз | 12 файлов |
| `commands/` | Команды оркестратора | 21 файл |
| `analytics/reports/` | Отчёты о работе агентов | JSON + MD файлы |
| `analyzers/` | Аналитические скрипты | 3 файла |
| `config/` | Конфигурация MCP | Файлы конфигурации |

### Корневые файлы

- **QWEN.md** — главный оркестрирующий файл (центральный документ системы)
- **config.sh** — конфигурация расширения

---

## 2. Реестр агентов

### 2.1 Оркестраторы (orc_*)

Оркестраторы **не пишут код**, только координируют и делегируют через `task`.

| Агент | Файл | Роль | Разрешено | Запрещено |
|-------|------|------|-----------|-----------|
| `orc_planning_task_analyzer` | `agents/orc_planning_task_analyzer.md` | Анализ и классификация задач, назначение агентов | task, read_file, skill, todo_write, glob, grep_search | write_file |
| `orc_testing_tdd_coordinator` | `agents/orc_testing_tdd_coordinator.md` | Координация TDD workflow по языкам | task, read_file, skill, run_shell_command | write_file |
| `orc_dev_task_coordinator` | `agents/orc_dev_task_coordinator.md` | Координация задач разработки | task, read_file | write_file |
| `orc_backend_api_coordinator` | `agents/orc_backend_api_coordinator.md` | Координация backend API разработки | task, read_file | write_file |
| `orc_frontend_ui_coordinator` | `agents/orc_frontend_ui_coordinator.md` | Координация frontend разработки | task, read_file | write_file |
| `orc_bug_auto_fixer` | `agents/orc_bug_auto_fixer.md` | Автоматическое исправление багов | task, read_file | write_file |
| `orc_research_data_analyzer` | `agents/orc_research_data_analyzer.md` | Анализ исследовательских данных | task, read_file | write_file |
| `orc_security_security_orchestrator` | `agents/orc_security_security_orchestrator.md` | Оркестрация безопасности | task, read_file | write_file |
| `orc_testing_quality_assurer` | `agents/orc_testing_quality_assurer.md` | Обеспечение качества тестирования | task, read_file | write_file |

### 2.2 Speckit-агенты (speckit-*, specification-*)

| Агент | Файл | Роль | Разрешено | Запрещено |
|-------|------|------|-----------|-----------|
| `speckit-constitution-agent` | `agents/speckit-constitution-agent.md` | Создание конституции проекта (Фаза 2) | run_shell_command, read_file, write_file, glob, grep_search, todo_write, skill | — |
| `speckit-specify-agent` | `agents/speckit-specify-agent.md` | Создание спецификаций модулей (Фаза 3) | run_shell_command, read_file, write_file, glob, grep_search, todo_write, skill | — |
| `speckit-plan-agent` | `agents/speckit-plan-agent.md` | Создание ОБЩЕГО плана проекта (Фаза 5) | run_shell_command, read_file, write_file, glob, grep_search, todo_write, skill | — |
| `speckit-tasks-agent` | `agents/speckit-tasks-agent.md` | Разбивка плана на задачи (Фаза 6) | run_shell_command, read_file, write_file, glob, grep_search, todo_write, skill | — |
| `specification-analyst` | `agents/specification-analyst.md` | Анализ противоречий и пробелов (Фазы 4, 7) | run_shell_command, read_file, write_file, glob, grep_search, todo_write, skill | — |
| `specification-compliance-checker` | `agents/specification-compliance-checker.md` | Проверка соответствия спецификациям | read_file, glob, grep_search | write_file |

### 2.3 Work-агенты разработки (work_*)

Воркеры **пишут код** и выполняют реализацию.

| Агент | Файл | Роль | Разрешено |
|-------|------|------|-----------|
| `work_dev_project_initializer` | `agents/work_dev_project_initializer.md` | Инициализация проекта (проверка расширения, Git, .gitignore, Pre-Flight) | run_shell_command, read_file, write_file, glob, grep_search, todo_write, skill |
| `work_dev_meta_agent` | `agents/work_dev_meta_agent.md` | Создание новых агентов | read_file, write_file, glob, grep_search, todo_write, skill |
| `work_dev_code_analyzer` | `agents/work_dev_code_analyzer.md` | Анализ кода | read_file, glob, grep_search |
| `work_dev_dependency_analyzer` | `agents/work_dev_dependency_analyzer.md` | Анализ зависимостей | read_file, run_shell_command, glob, grep_search |
| `work_backend_python_developer` | `agents/work_backend_python_developer.md` | Python backend разработка | run_shell_command, read_file, write_file, glob, grep_search, todo_write, skill |
| `work_backend_go_developer` | `agents/work_backend_go_developer.md` | Go backend разработка | run_shell_command, read_file, write_file, glob, grep_search, todo_write, skill |
| `work_backend_api_validator` | `agents/orc_backend_api_coordinator.md` | Валидация backend API | read_file, write_file, run_shell_command |
| `work_frontend_react_developer` | `agents/work_frontend_react_developer.md` | React frontend разработка | run_shell_command, read_file, write_file, glob, grep_search, todo_write, skill |
| `work_frontend_component_generator` | `agents/work_frontend_component_generator.md` | Генерация React компонентов | read_file, write_file, glob, grep_search, todo_write |
| `work_db_architect` | `agents/work_db_architect.md` | Проектирование баз данных | read_file, write_file, glob, grep_search, run_shell_command |
| `work_devops_engineer` | `agents/work_devops_engineer.md` | DevOps задачи | run_shell_command, read_file, write_file, glob, grep_search, todo_write |
| `work_doc_tech_translator_ru` | `agents/work_doc_tech_translator_ru.md` | Техническая документация на русском | read_file, write_file, glob, grep_search |

### 2.4 Work-агенты тестирования (work_testing_*)

| Агент | Файл | Роль |
|-------|------|------|
| `work_testing_python_specialist` | `agents/work_testing_python_specialist.md` | Python тестирование (pytest, unittest) |
| `work_testing_go_specialist` | `agents/work_testing_go_specialist.md` | Go тестирование (testing, testify) |
| `work_testing_ts_specialist` | `agents/work_testing_ts_specialist.md` | TypeScript/React тестирование (Jest, RTL) |
| `work_testing_security_tester` | `agents/work_testing_security_tester.md` | Security тестирование (OWASP) |
| `work_testing_code_quality_checker` | `agents/work_testing_code_quality_checker.md` | Проверка качества кода |

### 2.5 Work-агенты планирования (work_planning_*)

| Агент | Файл | Роль |
|-------|------|------|
| `work_planning_task_classifier` | `agents/work_planning_task_classifier.md` | Классификация задач по домену |
| `work_planning_agent_requirer` | `agents/work_planning_agent_requirer.md` | Определение требуемых агентов |
| `work_planning_executor_assigner` | `agents/work_planning_executor_assigner.md` | Назначение агентов на задачи |
| `work_planning_test_assigner` | `agents/work_planning_test_assigner.md` | TEST/CODE разделение (TDD) |

### 2.6 Work-агенты здоровья проекта (work_health_*)

| Агент | Файл | Роль |
|-------|------|------|
| `work_health_bug_hunter` | `agents/work_health_bug_hunter.md` | Охота на баги |
| `work_health_bug_fixer` | `agents/work_health_bug_fixer.md` | Исправление багов |
| `work_health_dead_code_detector` | `agents/work_health_dead_code_detector.md` | Обнаружение мёртвого кода |

### 2.7 Work-агенты безопасности (work_security_*)

| Агент | Файл | Роль |
|-------|------|------|
| `work_security_specialist` | `agents/work_security_specialist.md` | Специалист по безопасности |
| `work_security_security_analyzer` | `agents/work_security_security_analyzer.md` | Анализ безопасности |

### 2.8 Специализированные агенты

| Агент | Файл | Роль |
|-------|------|------|
| `work_research_trend_tracker` | `agents/work_research_trend_tracker.md` | Отслеживание трендов |
| `work_trading_strategy_engineer` | `agents/work_trading_strategy_engineer.md` | Инженер торговых стратегий |
| `work_dev_qwen_code_cli_specialist` | `agents/work_dev_qwen_code_cli_specialist.md` | Qwen Code CLI специалист |

---

## 3. Реестр скиллов

### Основные скиллы (включая Pre-Flight, Quality Gate, Workflow)

| Название скилла | Путь | Назначение |
|-----------------|------|------------|
| `pre-flight` | `skills/pre-flight/SKILL.md` | Pre-Flight проверки (10 пунктов) — блокирующая проверка |
| `quality-gate` | `skills/quality-gate/SKILL.md` | Quality Gate проверки (Gates 1-5) |
| `init-project` | `skills/init-project/SKILL.md` | Инициализация проекта |
| `analyze-state` | `skills/analyze-state/SKILL.md` | Анализ состояния проекта |
| `save-session-context` | `skills/save-session-context/SKILL.md` | Сохранение контекста сессии |
| `resume-session` | `skills/resume-session/SKILL.md` | Восстановление контекста сессии |
| `git-workflow` | `skills/git-workflow/SKILL.md` | Git workflow операции |
| `speckit-constitution` | `skills/speckit-constitution/SKILL.md` | Создание конституции |
| `speckit-specify` | `skills/speckit-specify/SKILL.md` | Создание спецификаций |

### Скиллы анализа и валидации

| Название скилла | Путь | Назначение |
|-----------------|------|------------|
| `code-quality-checker` | `skills/code-quality-checker/SKILL.md` | Проверка качества кода |
| `dependency-auditor` | `skills/dependency-auditor/SKILL.md` | Аудит зависимостей |
| `dependency-validation` | `skills/dependency-validation/SKILL.md` | Валидация зависимостей |
| `security-analyzer` | `skills/security-analyzer/SKILL.md` | Анализ безопасности |
| `security-scan` | `skills/security-scan/SKILL.md` | Сканирование безопасности |
| `specification-analyzer` | `skills/specification-analyzer/SKILL.md` | Анализ спецификаций |
| `task-analyzer` | `skills/task-analyzer/SKILL.md` | Анализ задач |

### Скиллы тестирования

| Название скилла | Путь | Назначение |
|-----------------|------|------------|
| `bug-fixer` | `skills/bug-fixer/SKILL.md` | Исправление багов |
| `bug-hunter` | `skills/bug-hunter/SKILL.md` | Поиск багов |

### Скиллы документации и генерации

| Название скилла | Путь | Назначение |
|-----------------|------|------------|
| `documentation-generator` | `skills/documentation-generator/SKILL.md` | Генерация документации |
| `generate-document` | `skills/generate-document/SKILL.md` | Генерация документов |
| `generate-changelog` | `skills/generate-changelog/SKILL.md` | Генерация changelog |

### Скиллы React (frontend)

| Название скилла | Путь | Назначение |
|-----------------|------|------------|
| `react-build` | `skills/react-build/SKILL.md` | Сборка React проекта |
| `react-lint` | `skills/react-lint/SKILL.md` | Линтинг React |
| `react-test` | `skills/react-test/SKILL.md` | Тестирование React |

### Утилитарные скиллы

| Название скилла | Путь | Назначение |
|-----------------|------|------------|
| `docker-compose` | `skills/docker-compose/SKILL.md` | Docker Compose операции |
| `external-api-mocking` | `skills/external-api-mocking/SKILL.md` | Mocking внешних API |
| `webhook-sender` | `skills/webhook-sender/SKILL.md` | Отправка webhook |
| `orchestrator-delegation-checker` | `skills/orchestrator-delegation-checker/SKILL.md` | Проверка делегирования |
| `agent-structure-checker` | `skills/agent-structure-checker/SKILL.md` | Проверка структуры агента |

---

## 4. Машина состояний проекта

### Коды состояний

| Код | Состояние | Описание |
|-----|-----------|----------|
| **10** | `empty` | Проект пустой, нет кода и спецификаций |
| **20** | `existing_code_no_specs` | Есть код, но нет спецификаций |
| **30** | `partial_specification` | Есть частичные спецификации |
| **40** | `full_specification` | Все спецификации созданы, план готов |

### Условия перехода между состояниями

```
10 (empty) → 20: После инициализации project_initializer
20 → 30: После создания конституции и спецификаций (speckit-constitution + speckit-specify)
30 → 40: После завершения анализа противоречий (Фаза 4) и дополнения спецификаций
40 → ...: Запуск реализации (work_* агенты)
```

### Разрешённые/запрещённые агенты по состояниям

| Состояние | ✅ Разрешено | ❌ Запрещено |
|-----------|-------------|--------------|
| **10 (empty)** | `work_dev_project_initializer`<br>`skill: init-project`<br>`speckit-constitution` | `speckit-specify`<br>`speckit-plan`<br>`work_*`<br>Писать код |
| **20 (existing_code_no_specs)** | `speckit-constitution`<br>`speckit-specify`<br>`bug-hunter` | `speckit-plan`<br>`work_*` |
| **30 (partial_specification)** | `speckit-specify` (дополнение)<br>`specification-analyst` | `speckit-plan`<br>`work_*` |
| **40 (full_specification)** | `speckit-plan`<br>`speckit-tasks`<br>`work_*`<br>`speckit.implement` | `speckit-constitution`<br>`speckit-specify` |

---

## 5. Key Workflows (Speckit, TDD)

### 5.1 Speckit Workflow (полная последовательность фаз)

```
Фаза 1: analyze-project-state.sh    → Определение кода состояния (10/20/30/40)
         ↓
Фаза 2: speckit-constitution-agent  → Создание конституции проекта
         ↓
Фаза 3: speckit-specify-agent      → Создание спецификаций модулей
         ↓
Фаза 4: specification-analyst      → Анализ противоречий (критически важно!)
         ↓
Фаза 5: speckit-plan-agent         → Создание ОБЩЕГО плана (ОДИН раз для всего проекта!)
         ↓
Фаза 6: speckit-tasks-agent        → Разбивка плана на задачи
         ↓
Фаза 7: specification-analyst      → Анализ пробелов (критически важно!)
         ↓
Фаза 8: orc_planning_task_analyzer  → Назначение агентов на задачи
         ↓
Фаза 9: work_planning_test_assigner → TEST/CODE разделение (TDD First!)
         ↓
Фаза 10: work_testing_{lang}_specialist → Написание тестов → RED
         ↓
Фаза 11: work_backend_{lang}_developer  → Написание кода → GREEN
         ↓
Фаза 12: work_* агенты              → Реализация остальных задач
```

**⚠️ Важные предупреждения:**
- Не пропускать Фазу 4 (анализ противоречий) → приведёт к противоречиям в спецификациях
- Не пропускать Фазу 7 (анализ пробелов) → приведёт к неполной реализации
- Не пропускать Фазу 8 (назначение агентов) → приведёт к хаосу в задачах
- Не пропускать Фазу 9 (TEST/CODE разделение) → нарушит TDD
- speckit-plan-agent вызывается ОДИН раз для ВСЕГО проекта (не для каждого модуля)

### 5.2 TDD Workflow (детальный)

```
1. work_planning_test_assigner    → Создаёт TEST/CODE разделение для каждой задачи
                                      TEST задача (T-XXX-T): work_testing_{lang}_specialist
                                      CODE задача (T-XXX-C): work_backend_{lang}_developer
                                      Зависимость: CODE зависит от TEST
         ↓
2. orc_testing_tdd_coordinator    → Определяет язык проекта
                                      Python → work_testing_python_specialist
                                      Go → work_testing_go_specialist
                                      TypeScript → work_testing_ts_specialist
         ↓
3. work_testing_{lang}_specialist → Пишет тесты (перед кодом!) → RED
         ↓
4. work_backend_{lang}_developer  → Пишет код (под тесты) → GREEN
         ↓
5. orc_testing_quality_assurer   → Quality Gate проверка (покрытие ≥ 80%)
```

**Ключевые принципы TDD:**
- ✅ TEST задачи выполняются ПЕРЕД CODE задачами
- ✅ CODE задачи НЕ могут начаться БЕЗ завершения TEST задач
- ✅ Языковая специализация тестировщиков
- ✅ Покрытие ≥ 80%

---

## 6. Блокирующие правила и проверки

### 6.1 Pre-Flight проверки (10 пунктов)

**Выполняются перед ЛЮБОЙ фазой разработки:**

| № | Проверка | Описание |
|---|----------|----------|
| 1 | Git репозиторий | Проверка инициализации Git |
| 2 | Ветка develop | Проверка существования ветки develop |
| 3 | .gitignore | Проверка наличия .gitignore |
| 4 | Конституция проекта | Проверка наличия constitution.md |
| 5 | Quality Gates скрипты | Проверка наличия скриптов качества |
| 6 | Агенты | Проверка наличия агентов (22+ шт.) |
| 7 | Speckit команды | Проверка команд Speckit |
| 8 | Skills | Проверка наличия skills (44+ шт.) |
| 9 | MCP конфигурация | Проверка конфигурации MCP |
| 10 | Скрипты | Проверка наличия скриптов (50+ шт.) |

**Блокирующая:** `true` — останавливает процесс при любой ошибке

### 6.2 Quality Gates (5 контрольных точек)

| Gate | Название | Описание | Блокирующая |
|------|----------|----------|-------------|
| **Gate 1** | Pre-Execution | Проверка корректности задачи | ❌ |
| **Gate 2** | Post-Execution | Верификация результата | ❌ |
| **Gate 3** | Pre-Commit | Валидация перед коммитом (синтаксис, линтинг, Conventional Commits) | ✅ |
| **Gate 4** | Pre-Merge | Интеграционные проверки | ✅ |
| **Gate 5** | Pre-Implementation | Проверка спецификаций | ✅ |

**Gate 3 (Pre-Commit) выполняет:**
- Проверка синтаксиса (по языкам проекта: Python, Go, TypeScript, Rust и др.)
- Линтинг Markdown
- Валидация JSON
- Валидация YAML
- Проверка git workflow
- Валидация сообщения коммита (Conventional Commits)
- Базовая проверка на наличие секретов

### 6.3 Блокирующие правила из QWEN.md

**Правило 1.1: НЕ запускать агентов до инициализации**
- ❌ Запрещено вызывать `speckit-*` агентов до инициализации
- ❌ Запрещено вызывать `work_*` агентов до инициализации
- ❌ Запрещено писать код до инициализации
- ✅ Сначала `work_dev_project_initializer` → затем возврат управления оркестратору

**Правило 1.2: Чек-лист пре-условий**
- [ ] Расширение установлено
- [ ] Git инициализирован
- [ ] Ветка `develop` существует
- [ ] `.gitignore` существует
- [ ] `work_dev_project_initializer` выполнен успешно
- [ ] Pre-Flight проверки пройдены
- [ ] **Получено утверждение пользователя** (да/нет)

**Правило 1.3: Аварийный тормоз**
- Автоматическая блокировка через `$EXTENSION_DIR/scripts/orchestration-tools/pre-flight-check.sh`
- Процесс НЕ продолжится до успеха проверок

### 6.4 Границы ответственности агентов

**Оркестраторы (`orc_*`):**
- ✅ Делегируют задачи через `task`
- ❌ НЕ пишут код напрямую (нет write_file)

**Воркеры (`work_*`):**
- ✅ Пишут код (write_file, edit)
- ✅ Пишут тесты
- ✅ Выполняют Git Workflow после задачи
- ❌ НЕ создают конституцию (это задача speckit-constitution-agent)

---

## Итоговые метрики

| Компонент | Количество |
|-----------|------------|
| Всего агентов | 43 |
| Оркестраторов | 9 |
| Speckit-агентов | 6 |
| Work-агентов разработки | 12 |
| Work-агентов тестирования | 5 |
| Work-агентов планирования | 4 |
| Work-агентов здоровья | 3 |
| Work-агентов безопасности | 2 |
| Всего скиллов | 44 |
| Скриптов | 50+ |
| Команд | 21 |
| Чек-листов | 12 |

---

## Примечание

Данный анализ основан на содержимом ветки `original-qwen-extension`. Некоторые детали могут отсутствовать (например, полные определения всех агентов и скиллов), но представленная структура является полной для понимания архитектуры системы оркестрации.