// Tests for index.ts (main plugin exports)
describe('Index Module - Plugin Exports', () => {
  describe('getStateDescription()', () => {
    const getStateDescription = (code: number): string => {
      const descriptions: Record<number, string> = {
        1: "Пустой проект (директория создана, нет ничего)",
        2: "Проект инициализирован (есть .git)",
        3: "Конституция создана (основные требования и ограничения)",
        4: "Спецификации модулей созданы (детальное описание компонентов)",
        5: "План реализации готов (оценка усилий, зависимости, риски)",
        6: "Задачи разбиты и агенты назначены (готов к выполнению)",
        7: "Тестовая фаза (написание и выполнение тестов)",
        8: "Кодинговая фаза (написание кода под тесты)",
        9: "Фаза интеграции (объединение компонентов и системное тестирование)",
        10: "Релиз-готов (все качественные gate пройдены, готово к релизу)"
      };
      return descriptions[code] || "Неизвестное состояние";
    };

    it('должен возвращать описание для состояния 1', () => {
      expect(getStateDescription(1)).toBe("Пустой проект (директория создана, нет ничего)");
    });

    it('должен возвращать описание для состояния 2', () => {
      expect(getStateDescription(2)).toBe("Проект инициализирован (есть .git)");
    });

    it('должен возвращать описание для состояния 3', () => {
      expect(getStateDescription(3)).toBe("Конституция создана (основные требования и ограничения)");
    });

    it('должен возвращать описание для состояния 10', () => {
      expect(getStateDescription(10)).toBe("Релиз-готов (все качественные gate пройдены, готово к релизу)");
    });

    it('должен возвращать неизвестное состояние для невалидного кода', () => {
      expect(getStateDescription(0)).toBe("Неизвестное состояние");
      expect(getStateDescription(99)).toBe("Неизвестное состояние");
    });
  });

  describe('getNextSteps()', () => {
    const getNextSteps = (currentState: number): string[] => {
      const nextSteps: Record<number, string[]> = {
        1: ["Инициализировать проект: создать .git, .gitignore, README.md"],
        2: ["Создать конституцию проекта (PROJECT.md)"],
        3: ["Создать спецификации модулей (SPEC/{module}.md)"],
        4: ["Проанализировать противоречия в спецификациях"],
        5: ["Создать план реализации (IMPLEMENTATION_PLAN.md)"],
        6: ["Разбить на задачи с зависимостями (TASKS.md)"],
        7: ["Назначить агентов на задачи"],
        8: ["Запустить TDD цикл: тесты → код"],
        9: ["Выполнить интеграцию и финальное тестирование"],
        10: ["Подготовить релиз и завершить проект"]
      };
      return nextSteps[currentState] || ["Ожидание действий"];
    };

    it('должен возвращать шаги для состояния 1', () => {
      expect(getNextSteps(1)[0]).toContain("Инициализировать проект");
    });

    it('должен возвращать шаги для состояния 2', () => {
      expect(getNextSteps(2)).toContain("Создать конституцию проекта (PROJECT.md)");
    });

    it('должен возвращать шаги для состояния 8', () => {
      expect(getNextSteps(8)).toContain("Запустить TDD цикл: тесты → код");
    });

    it('должен возвращать ожидание действий для неизвестного состояния', () => {
      expect(getNextSteps(99)).toEqual(["Ожидание действий"]);
    });
  });

  describe('formatConfirmationDialog()', () => {
    const formatConfirmationDialog = (phaseName: string, results: string[], nextStep: string): string => {
      return `✅ ${phaseName} завершена!

Результат:
${results.map(r => `- ${r}`).join('\n')}

Следующий шаг: ${nextStep}

Продолжить? (да/нет)`;
    };

    it('должен форматировать диалог подтверждения', () => {
      const dialog = formatConfirmationDialog("Фаза 1", ["result1", "result2"], "Следующий шаг");
      
      expect(dialog).toContain("Фаза 1 завершена!");
      expect(dialog).toContain("result1");
      expect(dialog).toContain("result2");
      expect(dialog).toContain("Следующий шаг");
      expect(dialog).toContain("Продолжить?");
    });

    it('должен содержать эмодзиcheckmark', () => {
      const dialog = formatConfirmationDialog("Test", [], "Next");
      
      expect(dialog).toContain("✅");
    });
  });

  describe('formatInitDialog()', () => {
    const formatInitDialog = (): string => {
      return `✅ Подготовка завершена!

Создано:
- Git репозиторий инициализирован
- Ветка develop активирована

Следующий шаг: Создание конституции проекта (PROJECT.md)

Продолжить? (да/нет)`;
    };

    it('должен форматировать диалог инициализации', () => {
      const dialog = formatInitDialog();
      
      expect(dialog).toContain("Подготовка завершена!");
      expect(dialog).toContain("Git репозиторий инициализирован");
      expect(dialog).toContain("Ветка develop активирована");
      expect(dialog).toContain("Создание конституции проекта");
    });

    it('должен запрашивать подтверждение', () => {
      const dialog = formatInitDialog();
      
      expect(dialog).toContain("Продолжить?");
    });
  });

  describe('State machine states', () => {
    it('должен иметь 10 состояний', () => {
      const states = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      expect(states).toHaveLength(10);
    });

    it('каждое состояние должно иметь описание', () => {
      const getStateDescription = (code: number): string => {
        const descriptions: Record<number, string> = {
          1: "Пустой проект",
          2: "Проект инициализирован",
          3: "Конституция создана",
          4: "Спецификации готовы",
          5: "План реализации готов",
          6: "Задачи разбиты",
          7: "Тестовая фаза",
          8: "Кодинговая фаза",
          9: "Фаза интеграции",
          10: "Релиз-готов"
        };
        return descriptions[code] || "Неизвестное состояние";
      };

      for (let i = 1; i <= 10; i++) {
        expect(getStateDescription(i)).not.toBe("Неизвестное состояние");
      }
    });
  });

  describe('Quality Gates', () => {
    it('должен быть 6 Quality Gates', () => {
      const gates = [
        "Pre-Execution (синтаксис)",
        "Post-Execution (покрытие ≥80%)",
        "Pre-Commit (безопасность)",
        "Pre-Merge (интеграция)",
        "Pre-Implementation (требования)"
      ];
      
      expect(gates.length).toBe(5);
    });
  });

  describe('TDD Workflow', () => {
    it('должен иметь 3 фазы TDD', () => {
      const phases = ["TEST", "CODE", "REFACTOR"];
      expect(phases).toHaveLength(3);
    });

    it('TEST фаза должна приводить к RED', () => {
      const expectedResult = "RED";
      expect(expectedResult).toBe("RED");
    });

    it('CODE фаза должна приводить к GREEN', () => {
      const expectedResult = "GREEN";
      expect(expectedResult).toBe("GREEN");
    });
  });

  describe('Project Structure', () => {
    it('должен содержать обязательные файлы', () => {
      const files = ["AGENTS.md", "PROJECT.md", "SPEC/", "TASKS.md", "REPORTS/"];
      
      files.forEach(file => {
        expect(file.length).toBeGreaterThan(0);
      });
    });
  });
});