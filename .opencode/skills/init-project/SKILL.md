---
name: init-project
description: Инициализация проекта — проверка расширения, создание структуры директорий, базовая настройка.
compatibility: opencode
---

## When to Use

Используй этот скилл:

- ✅ При создании нового проекта
- ✅ Перед началом разработки
- ✅ Для проверки окружения

## Инструкции

### Шаг 1: Проверка расширения

```bash
test -f .opencode/dist/index.js && echo "Плагин установлен"
```

### Шаг 2: Создание структуры директорий

Обязательные:
```bash
mkdir -p .opencode/agents
mkdir -p .opencode/skills
mkdir -p docs/
mkdir -p scripts/
```

### Шаг 3: Создание структуры спецификаций

**Speckit формат (НОВЫЙ стандарт):**
```bash
mkdir -p .specify/memory/
mkdir -p .specify/specs/
```

**utA формат (СТАРЫЙ):**
```bash
mkdir -p SPEC/memory/
mkdir -p SPEC/specs/
```

**Корневой формат (альтернатива):**
```bash
mkdir -p specs/
```

### Шаг 4: Инициализация Git (если не инициализирован)

```bash
git rev-parse --git-dir || git init && git checkout -b develop
```

### Шаг 5: Создание .gitignore (если отсутствует)

```bash
test -f .gitignore || cat > .gitignore <<EOF
node_modules/
__pycache__/
*.pyc
dist/
build/
.env
EOF
```

### Шаг 6: Создание .opencode/state.json

```bash
echo '{"state":2,"lastUpdated":"'$(date -Iseconds)'"}' > .opencode/state.json
```

### Шаг 7: Запуск Pre-Flight проверок

```bash
skill: pre-flight
```

## Структура директорий после инициализации

```
project/
├── .git/
├── .gitignore
├── .opencode/
│   ├── state.json
│   ├── agents/
│   └── skills/
├── .specify/              # Speckit (приоритет)
│   ├── memory/
│   └── specs/
├── SPEC/                  # utA (альтернатива)
│   ├── memory/
│   └── specs/
├── specs/                 # Корень (альтернатива)
├── docs/
└── scripts/
```

## Результат

- Структура директорий создана
- Git инициализирован (если нужно)
- .gitignore создан (если нужно)
- .opencode/state.json создан (state 2)
- Pre-Flight проверки выполнены

## Использование

```
skill: init-project
```