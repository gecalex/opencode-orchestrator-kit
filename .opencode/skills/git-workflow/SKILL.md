---
name: git-workflow
description: Git workflow операции — создание feature-ветки, создание артефактов спецификаций, pre-commit review, merge, conventional commits.
compatibility: opencode
---

## When to Use

Используй этот скилл:

- ✅ Перед созданием коммита
- ✅ Перед созданием feature-ветки
- ✅ Перед merge в develop
- ✅ При создании артефактов (constitution, specs, plan, tasks)

## Важно: Пути спецификаций

При создании артефактов используй правильные пути:

```
priority:
  1. .specify/         # Speckit стандарт (НОВЫЙ)
  2. SPEC/            # utA формат (СТАРЫЙ)
  3. Корень проекта   # CONSTITUTION.md, PLAN.md, TASKS.md
```

Примеры:
```
.specify/memory/constitution.md    # Speckit (приоритет)
SPEC/memory/constitution.md     # utA
CONSTITUTION.md              # Корень
```

## Операции

### 1. Создание feature-ветки

```bash
git checkout -b feature/{task-name}
```

Правила именования:
- Использовать kebab-case
- Начинать с feature/, bugfix/, hotfix/
- Пример: feature/add-user-api

### 2. Pre-commit review

**Обязательно выполнять перед каждым коммитом!**

```bash
# Проверить статус
git status

# Проверить изменения
git diff --stat

# Проверить что изменилось
git diff
```

### 3. Conventional Commits

Формат: `type(scope): description`

Типы:
- `feat` — новая функциональность
- `fix` — исправление бага
- `docs` — документация
- `style` — форматирование
- `refactor` — рефакторинг
- `test` — тесты
- `chore` — другое

Примеры:
```
feat(backend): добавить API для пользователей
fix(frontend): исправить баг с кнопкой
docs: обновить README
test(python): добавить тесты для модуля user
```

### 4. Создание артефактов Speckit

**Constitution:**
```bash
mkdir -p .specify/memory/
# Создание файла
```

**Specs:**
```bash
mkdir -p .specify/specs/{module-name}/
# Создание файлов spec.md, requirements.md
```

**Plan:**
```bash
mkdir -p .specify/
# Создание plan.md
```

**Tasks:**
```bash
mkdir -p .specify/specs/
# Создание tasks.md
```

### 5. Merge в develop

```bash
# Переключиться на develop
git checkout develop

# Влить с no-ff
git merge --no-ff feature/{branch-name}

# Удалить feature-ветку
git branch -d feature/{branch-name}
```

## Quality Gate 3 (Pre-Commit)

**Обязательно выполнять перед коммитом:**

```bash
# Определить язык проекта
ls *.py && echo "Python"
ls *.ts && echo "TypeScript"

# Проверить синтаксис
python -m py_compile *.py  # Python
npx tsc --noEmit           # TypeScript

# Линтинг (если есть)
ruff check .
```

## Результат

- Ветка создана
- Артефакты созданы в правильных локациях
- Изменения проверены
- Коммит сделан по Conventional Commits
- Merge выполнен в develop

## Использование

```
skill: git-workflow
  operation: create-branch
  name: "add-user-api"
```

или

```
skill: git-workflow
  operation: commit
  message: "feat(backend): добавить API"
```

или

```
skill: git-workflow
  operation: create-artifact
  type: "constitution"
  path: ".specify/memory/"
```