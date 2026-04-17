---
name: security-analyzer
description: Анализ безопасности кода — проверка уязвимостей, secrets, OWASP Top 10.
compatibility: opencode
---

## When to Use

Используй этот скилл:

- ✅ Перед merge в develop
- ✅ После написания кода
- ✅ Периодически во время разработки

## Проверки безопасности

### 1. Secrets detection

Поиск secrets в коде:

```bash
# Поиск ключей и паролей
grep -r "password\|secret\|api_key\|token" --include="*.py" --include="*.ts" .
```

### 2. Зависимости

Проверка уязвимостей в зависимостях:

```bash
# Python
pip-audit
safety check

# JavaScript/TypeScript
npm audit
yarn audit

# Go
govulncheck ./...
```

### 3. OWASP Top 10

Проверка распространённых уязвимостей:

- SQL Injection
- XSS
- CSRF
- Broken Authentication
- и т.д.

### 4. Статический анализ

```bash
# Python
bandit -r .

# Go
gosec ./...

# JavaScript/TypeScript
npm audit
```

## Инструкции

### Шаг 1: Определить язык

```bash
ls *.py && echo "Python"
ls *.ts *.tsx && echo "TypeScript"
ls go.mod && echo "Go"
```

### Шаг 2: Выполнить проверки

```bash
# Secrets
detect-secrets scan

# Зависимости
npm audit || pip-audit || govulncheck

# Статический анализ
bandit -r . || gosec ./...
```

### Шаг 3: Проверить результаты

- Нет уязвимостей → можно продолжать
- Есть уязвимости → исправить немедленно!

## Категории уязвимостей

| Категория | Пример | Критичность |
|-----------|--------|-------------|
| Secrets | API key в коде | 🔴 Критическая |
| Injection | SQL Injection | 🔴 Критическая |
| Auth | Слабый пароль | 🟠 Высокая |
| XSS | Reflected XSS | 🟡 Средняя |
| Config | Небезопасные настройки | 🟡 Средняя |

## Результат

```
=== Анализ безопасности ===

✅ Secrets: не найдены
✅ Dependencies: уязвимостей не найдено
✅ Static analysis: предупреждений нет

Результат: БЕЗОПАСНО
```

## Использование

```
skill: security-analyzer
```

или

```
skill: security-analyzer
  scan-type: dependencies
```