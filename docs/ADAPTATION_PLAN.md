# ПЛАН АДАПТАЦИИ: Speckit + Qwen Extension → Orchestrator Kit

## 1. ИССЛЕДОВАНИЕ

### 1.1 github/spec-kit (Оригинальный Speckit)

| Компонент | Описание | Наш аналог |
|-----------|----------|------------|
| **Python CLI** | `spec` команда | ❌ Нам не нужен (TypeScript → JS) |
| **Scripts/bash** | Bash скрипты | ⚠️ Заменить на TS |
| **Scripts/powershell** | PowerShell скрипты | ❌ Не нужно |
| **Extensions** | Домены (v-model, automotive, medical) | MCP servers? |
| **Templates** | 20+ шаблонов спецификаций | Мы используем markdown |
| **Integrations** | Claude, Gemini, etc. | ❌ Нам не нужно |

### 1.2 original-qwen-extension (Наш референс)

| Компонент | Количество | Наш аналог |
|-----------|------------|------------|
| **Commands** | 21 файл | 9 Skills |
| **Skills** | 51 директорий | 9 Skills |
| **Agents** | 3 категории | 16 Agents |
| **specify/** | Структура спецификаций | `.opencode/dist/` |
| **scripts/** | Исполняемые скрипты | TypeScript |
| **qwen-extension.json** | Конфиг | `opencode.json` |

### 1.3 Наш текущий плагин

```
.opencode/dist/           # Скомпилированный JS (plugin)
├── index.js              # Главный плагин
├── state-machine.js     # Машина состояний
├── pre-flight.js       # Pre-Flight проверки
├── quality-gates.js    # Quality gates
├── tdd-workflow.js     # TDD workflow
└── __tests__/          # Тесты

.opencode/agents/        # 16 агентов
.opencode/skills/        # 9 скиллов
AGENTS.md               # Документация
```

---

## 2. КОНЦЕПТУАЛЬНАЯ МОДЕЛЬ

### 2.1 Что нам НЕ нужно копировать

| Из Speckit | Причина |
|-----------|----------|
| Python CLI | Мы компилируем TypeScript → JS для opencode |
| Bash scripts | Заменить на TypeScript execution |
| PowerShell | Windows-специфично |
| Extensions (v-model, automotive) | DOMЕНЫ - не нужны для нашего use case |
| Integrations (Claude, Gemini) | Мы работаем с opencode |

| Из Qwen Extension | Причина |
|-------------------|----------|
| 51 skill | Переусложнение |
| 21 command | Нам достаточно 9 skills |
| Специфичные скрипты | Заменить на TS |

### 2.2 Что нам НУЖНО (Aдаптация)

| Компонент | Из чего берем | Как адаптируем |
|----------|--------------|----------------|
| **Commands** | Qwen: 21 commands | Оставить только Core 9 (как сейчас) |
| **Skills** | Qwen: 51 skills | Оставить Core 9 (speckit.*) |
| **Agents** | Оба | 16 agents (достаточно) |
| **specify/** | Qwen: `.qwen/specify/` | Поддержка `.specify/` + `SPEC/` |
| **State machine** | Наш плагин | Сохранить (state 1-10) |
| **Quality gates** | Наш плагин | Сохранить 5 gates |
| **TDD workflow** | Наш плагин | Сохранить TEST → CODE |

---

## 3. АДАПТАЦИОННЫЙ ПЛАН

### Фаза 1: Структура директорий

**Текущая проблема:**
- `SPEC/` vs `.specify/` — рассинхрон

**Решение:** Поддержать обе структуры

```
project/
├── .specify/              # Новый формат (Speckit)
│   ├── memory/
│   │   └── constitution.md
│   └── specs/
│       └── {module}/
├── SPEC/                 # Старый формат (utA)
│   ├── memory/
│   └── specs/
├── specs/                # Альтернатива
├── CONSTITUTION.md       # Корень
├── PLAN.md               # Корень
├── TASKS.md              # Корень
└── .opencode/
    ├── state.json
    ├── agents/
    └── skills/
```

### Фаза 2: Commands → Skills mapping

| Qwen Command | Наш Skill | Статус |
|--------------|----------|--------|
| `/speckit.constitution` | analyze-state + init-project | ✅ Есть |
| `/speckit.specify` | analyze-state | ⚠️ Расширить |
| `/speckit.clarify` | — | ❌ Добавить |
| `/speckit.plan` | analyze-state | ⚠️ Расширить |
| `/speckit.tasks` | analyze-state | ⚠️ Расширить |
| `/speckit.analyze` | code-quality-checker | ❌ Добавить |
| `/speckit.implement` | — | ❌ Добавить |

### Фаза 3: Agents alignment

Переименовать агентов в формат `speckit-*`:

| Старое имя | Новое имя |
|-----------|-----------|
| `constitution-agent` | `speckit-constitution` |
| `specify-agent` | `speckit-specify` |
| `plan-agent` | `speckit-plan` |
| `tasks-agent` | `speckit-tasks` |
| `planning-task-analyzer` | `speckit-analyzer` |

### Фаза 4: Execution scripts

**Текущая проблема:** Нет исполняемых скриптов

**Решение:** TypeScript в `.opencode/dist/`

```typescript
// .opencode/dist/commands/constitution.ts
export async function runConstitution(projectName: string) {
  // 1. Check state
  // 2. Create files
  // 3. Update state.json
  // 4. Return result
}
```

### Фаза 5: MCP Integration

Наши MCP серверы (из qwen-extension):

| MCP Server | Наш плагин | Статус |
|------------|-----------|--------|
| filesystem | ✅ Есть | — |
| memory | ✅ Есть | — |
| github | ✅ Есть | — |
| context7 | ✅ Есть | — |
| neo4j | ❌ Не нужно | — |
| postgres | ❌ Внешнее | — |

---

## 4. РЕАЛИЗАЦИЯ

### Приоритет 1 (Сейчас)

1. ✅ Исправить directory structure (поддержка `.specify/`)
2. ✅ Sync skills с commands
3. ✅ Rename agents → `speckit-*`

### Приоритет 2 (Следующая итерация)

1. ⏳ Добавить `speckit.clarify` skill
2. ⏳ Добавить `speckit.analyze` skill  
3. ⏳ Добавить TS execution scripts

### Приоритет 3 (Если нужно)

1. ⏳ Extension system (если понадобится)
2. ⏳ Templates (если понадобятся)

---

## 5. НЕ НУЖНО

- ❌ Python CLI
- ❌ Bash scripts (заменить на TS)
- ❌ PowerShell
- ❌ Extension system (v-model, automotive)
- ❌ Claude/Gemini integrations

---

## 6. ВЫВОД

Наш плагин — это **УПРОЩЁННАЯ ВЕРСИЯ** Speckit, адаптированная под:
1. TypeScript → JS compilation для opencode
2. Task/Skill системы вместо slash-commands
3. 9 Core skills вместо 51
4. 16 Agents достаточно

**Главное отличие:** Мы не пытаемся быть полной копией Speckit — мы адаптируем философию (spec-first, TDD, state machine) под нашу платформу (opencode).