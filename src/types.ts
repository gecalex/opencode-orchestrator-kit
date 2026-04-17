// Типы для плагина OpenCode Orchestrator Kit

// Коды состояний проекта
export type ProjectStateCode = 10 | 20 | 30 | 40;

export interface ProjectState {
  code: ProjectStateCode;
  description: string;
  allowedAgents: string[];
  blockedAgents: string[];
  allowedTools: string[];
}

// Результат Pre-Flight проверки
export interface PreFlightResult {
  success: boolean;
  passed: number;
  failed: number;
  errors: string[];
}

// Результат Quality Gate
export interface QualityGateResult {
  passed: boolean;
  gate: number;
  checks: CheckResult[];
}

export interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
}

// Контекст плагина
export interface PluginContext {
  project: any;
  client: any;
  $: any;
  directory: string;
  worktree: string;
}

// Агент в формате OpenCode
export interface OpenCodeAgent {
  name: string;
  description: string;
  mode: "primary" | "subagent" | "all";
  tools: Record<string, boolean>;
  permission?: Record<string, Record<string, string>>;
}

// Скилл в формате OpenCode
export interface OpenCodeSkill {
  name: string;
  description: string;
  compatibility?: string;
  license?: string;
}

// Конфигурация плагина
export interface PluginConfig {
  name: string;
  version: string;
  description: string;
  agents: string[];
  skills: string[];
}