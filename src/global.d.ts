// Глобальные типы для плагина

// Тип для Bun shell ($)
declare global {
  // @ts-ignore
  const $: {
    command(strings: TemplateStringsArray): {
      text(): Promise<string>;
      exitCode(): Promise<number>;
    };
  };
}

// Экспорт пустой, чтобы файл был модулем
export {};