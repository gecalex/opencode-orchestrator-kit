# План: Исправление инициализации проекта

## Проблема

Оркестратор не вызывает project-initializer, состояние не обновляется после создания файлов.

## Задачи

### 1. Исправить detectStateFromFS

**Файл:** `src/state-machine.ts`

**Изменения:**
- Проверять `CONSTITUTION.md` (было `PROJECT.md`)
- Проверять `PLAN.md`
- Проверять `specs/` директорию

```typescript
// Текущий код (неправильно)
if (hasSpecs || hasConstitution) return 10;

// Новый код
if (hasConstitution && hasSpecs && hasPlan) return 20;
if (hasConstitution) return 10;
```

### 2. Добавить автообновление state

**Файл:** `src/index.ts`

**Изменения:**
- После успешного выполнения task - проверять результат
- Если созданы файлы - обновлять state
- Или добавить отдельный вызов setState после создания файлов

### 3. Добавить вызов project-initializer в workflow

**Файл:** `src/index.ts` или новый модуль

**Логика:**
```
При обнаружении пустой директории + TZ.md:
1. Запустить project-initializer
2. Дождаться завершения
3. Обновить state → 0 (инициализирован)
4. Продолжить workflow
```

### 4. Проверить project-initializer агента

**Проверить:** `.opencode/agents/devops/worker/project-initializer.md`

**Убедиться:**
- Есть tools: write, bash, glob, read
- Есть логика: git init, .gitignore, README, CHANGELOG
- Есть вызов setState

## Критерии готовности

- [ ] detectStateFromFS правильно определяет состояние
- [ ] project-initializer вызывается для нового проекта
- [ ] После инициализации state = 0 (или 10)
- [ ] После создания SPEC - state = 20
- [ ] Bash доступен после инициализации

## Файлы для изменения

1. `src/state-machine.ts` - detectStateFromFS
2. `src/index.ts` - workflow инициализации
3. `.opencode/agents/devops/worker/project-initializer.md` - если нужно