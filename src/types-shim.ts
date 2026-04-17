// Shim for @opencode-ai/plugin types

export interface CommandResult {
  text: () => Promise<string>;
  exitCode: () => Promise<number>;
}

export interface CommandExecutor {
  (strings: TemplateStringsArray, ...args: any[]): CommandResult;
  (command: string): CommandResult;
}

export interface PluginInput {
  project: any;
  client: any;
  $: {
    command: CommandExecutor;
  };
  directory: string;
  worktree: string;
}

export interface Hooks {
  event?: (input: any, output: any) => Promise<void>;
  "tool.execute.before"?: (input: any, output: any) => Promise<void>;
  "tool.execute.after"?: (input: any, output: any) => Promise<void>;
  "chat.message"?: (input: any, output: any) => Promise<void>;
}

export type Plugin = (ctx: PluginInput) => Promise<Hooks>;

export function tool(config: {
  description: string;
  args: Record<string, any>;
  execute: (args: any) => Promise<any>;
}): any {
  return config;
}

export const Plugin = {
  // @ts-ignore
};