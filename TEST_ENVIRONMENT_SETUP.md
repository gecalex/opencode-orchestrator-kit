# Настройка тестовой среды для Orchestrator Kit

## 1. Введение

Данный документ описывает настройку тестовой среды для проекта Orchestrator Kit, включая языковые специализации агентов, изолированные среды для выполнения тестов, правила написания тестовых данных и моков.

## 2. Языковая специализация агентов

Orchestrator Kit реализован на TypeScript, поэтому основные тесты пишутся с использованием Jest и React Testing Library (при необходимости для frontend компонентов).

### 2.1. Тестовые агенты по языкам

| Язык | Тестовый агент | Тестовый фреймворк | Дополнительные библиотеки |
|------|---------------|-------------------|--------------------|
| TypeScript | ts-specialist | Jest | @types/jest, ts-jest, @testing-library/* |
| Python | python-specialist | pytest | pytest-cov, pytest-mock, pytest-asyncio |
| Go | go-specialist | testing (std), testify | stretchr/testify, golang/mock |

### 2.2. Назначение агентов по умолчанию

Для проекта Orchestrator Kit (TypeScript):

- **Основной тестовый агент**: ts-specialist
- **Резервный тестовый агент**: python-specialist (для вспомогательных скриптов)

## 3. Изолированные тестовые среды

### 3.1. Принципы изоляции

1. **Каждая тестовая сессия** выполняется в отдельном временном каталоге
2. **Внешние сервисы** изолируются через моки и заглушки
3. **Тестовые данные** генерируются программно, а не берутся из реальных источников
4. **Состояние** сбрасывается между тестами

### 3.2. Структура каталогов для тестов

```
orchestrator-kit/
├── src/
│   ├── __tests__/           # Unit тесты для src/
│   └── ...
├── .opencode/
│   └── __tests__/          # Тесты для ресурсов плагина
├── tests/
│   ├── integration/         # Интеграционные тесты
│   ├── e2e/               # E2E тесты (если применимо)
│   └── fixtures/           # Тестовые данные
└── scripts/
    └── test-setup.sh      # Скрипт настройки тестовой среды
```

### 3.3. Конфигурация изолированных сред

#### Для Jest (TypeScript)

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/.opencode'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 10000,
};
```

#### Для pytest (Python)

```ini
# pytest.ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = --cov=src --cov-report=term-missing --cov-fail-under=80
```

### 3.4. Скрипт настройки тестовой среды

```bash
#!/bin/bash
# scripts/test-setup.sh

set -e

echo "Setting up test environment..."

# Создаем временный каталог для тестов
export TEST_TEMP_DIR=$(mktemp -d)
echo "Test temp directory: $TEST_TEMP_DIR"

# Копируем тестовые данные
cp -r tests/fixtures/* "$TEST_TEMP_DIR/"

# Настраиваем переменные окружения для тестов
export NODE_ENV=test
export TEST_MODE=true

# Инициализируем тестовую машину состояний
export STATE_FILE="$TEST_TEMP_DIR/state.json"
echo '{"state":0}' > "$STATE_FILE"

echo "Test environment ready."
```

## 4. Правила написания тестовых данных и моков

### 4.1. Принципы

1. **Не использовать реальные секреты** - всегда использовать тестовые значения
2. **Генерировать данные программно** - не захардкодивать
3. **Изолировать внешние вызовы** - использовать моки
4. **Использовать фабрики данных** - для создания тестовых объектов

### 4.2. Примеры фабрик данных

```typescript
// tests/factories.ts

// Фабрика для ProjectState
export function createMockProjectState(overrides = {}): ProjectState {
  return {
    code: 0,
    description: 'Test state',
    allowedAgents: [],
    blockedAgents: [],
    allowedTools: ['read', 'write'],
    lastUpdated: new Date().toISOString(),
    ...overrides,
  };
}

// Фабрика для Agent
export function createMockAgent(overrides = {}): Agent {
  return {
    name: 'test-agent',
    description: 'Test agent',
    tools: ['read', 'write'],
    allowedStates: [0, 1, 2],
    ...overrides,
  };
}

// Фабрика для Task
export function createMockTask(overrides = {}): Task {
  return {
    id: 'TEST-001',
    description: 'Test task',
    dependencies: [],
    assignee: 'ts-specialist',
    status: 'pending',
    estimate: '8 ч',
    ...overrides,
  };
}
```

### 4.3. Примеры моков

```typescript
// tests/mocks.ts
import * as fs from 'fs';
import * as path from 'path';

// Мок для файловой системы
export const mockFs = {
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  readdirSync: jest.fn().mockReturnValue([]),
};

// Мок для Git команд
export const mockGit = {
  init: jest.fn().mockResolvedValue({}),
  checkout: jest.fn().mockResolvedValue({}),
  add: jest.fn().mockResolvedValue({}),
  commit: jest.fn().mockResolvedValue({ hash: 'abc123' }),
  status: jest.fn().mockResolvedValue({ files: [] }),
};

// Мок для HTTP запросов (для MCP серверов)
export const mockHttp = {
  get: jest.fn().mockResolvedValue({ data: {} }),
  post: jest.fn().mockResolvedValue({ data: {} }),
};

// Мок для opencode API
export const mockOpencodeApi = {
  command: jest.fn().mockResolvedValue({ text: () => '' }),
  session: {
    prompt: jest.fn().mockResolvedValue({ body: 'Test response' }),
  },
};
```

## 5. Правила запуска тестов

### 5.1. Локальный запуск

```bash
# Все тесты
npm test

# Только unit тесты
npm run test:unit

# Только интеграционные тесты
npm run test:integration

# С покрытием
npm run test:coverage

# С watching
npm run test:watch
```

### 5.2. CI/CD запуск

```bash
# Полный набор тестов (аналог GitHub Actions, GitLab CI, etc.)
npm ci
npm run typecheck
npm run lint
npm run test:coverage
npm run build
```

### 5.3. Pre-commit hooks (husky + lint-staged)

```bash
# .husky/pre-commit
#!/bin/bash
npm run pre-commit-check
```

```javascript
// lint-staged.config.js
module.exports = {
  '*.ts': ['npm run typecheck', 'npm run lint', 'npm test -- --passWithNoTests'],
};
```

## 6. Порядок выполнения TDD цикла

Согласно философии QWEN и TDD First!, порядок выполнения:

1. **TEST**: Запустить тестовую задачу (TEST:*) - тесты должны упасть (RED)
2. **CODE**: Запустить кодовую задачу (T:*) - написать код, пока тесты не пройдут (GREEN)
3. **REFACTOR**: Рефакторинг без регрессии - тесты продолжают проходить (REFACTOR)

### 6.1. Блокировка

- **Кодер не может начать работу**, пока тесты не провалились (RED)
- **Переход от TEST к CODE блокируется** до прохождения тестов
- **Минимальное покрытие тестами**: 80%

### 6.2. Подтверждение пользователя

После каждого цикла RED-GREEN-REFACTOR:
- Показывать результат пользователю
- Запрашивать подтверждение перехода к следующей задаче

## 7. Интеграция с Quality Gates

Тестовая среда интегрируется с Quality Gate 2 (Post-Execution):

| Gate | Проверка | Порог |
|------|----------|-------|
| 2: Post-Execution | Покрытие тестами | ≥ 80% среднее по проекту, ≥ 60% минимум для файла |

### 7.1. Проверка покрытия

```bash
# Проверка покрытия всех файлов
npm run test:coverage

# Проверка конкретного файла
npx jest --coverage --collectCoverageFrom=src/state-machine.ts
```

### 7.2. Отчет о покрытии

Отчет генерируется в формате:
- Текстовый (в терминале)
- HTML (для визуализации)
- JSON (для интеграции с CI/CD)

```
----------|----------|----------|----------|-------------------|
File      | % Stmts | % Branch | % Funcs | % Lines           |
----------|----------|----------|----------|-------------------|
All files |    85.2 |    82.1 |    88.9 |    85.2          |
```

## 8. Troubleshooting

### 8.1. Тесты падают из-за таймаута

```typescript
// Увеличить таймаут для конкретного теста
test('should do something slow', async () => {
  jest.setTimeout(30000);
  // ...
});
```

### 8.2. Тесты падают из-за утечки состояния

```typescript
// Очищать состояние после каждого теста
afterEach(() => {
  jest.clearAllMocks();
  // Сбросить глобальное состояние если есть
});
```

### 8.3. Моки не работают

```typescript
// Использовать jest.mock() в начале файла
jest.mock('fs', () => mockFs);

// Или использовать jest.spyOn()
const readFileSyncSpy = jest.spyOn(fs, 'readFileSync');
```

## 9. Вывод

Данный документ описывает настройку тестовой среды для проекта Orchestrator Kit. Следуя этим правилам, мы обеспечиваем:
- Изолированные тесты, которые не завис��т от внешних сервисов
- Консистентное покрытие тестами ≥ 80%
- Чёткий TDD цикл с блокировкой переходов
- Интеграцию с Quality Gates

---
*Создан как часть фазы 10: TDD Координация (языковая специализация)*