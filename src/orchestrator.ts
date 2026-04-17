// Основной модуль оркестратора
// Координация работы всех компонентов плагина

import { stateMachine } from "./state-machine";
import { preFlight } from "./pre-flight";
import { qualityGates } from "./quality-gates";
import { gitWorkflow } from "./git-workflow";
import { userApproval } from "./user-approval";
import type { ProjectStateCode } from "./types";

export interface OrchestratorConfig {
  enablePreFlight: boolean;
  enableQualityGates: boolean;
  enableGitWorkflow: boolean;
  enableUserApproval: boolean;
}

// Конфигурация по умолчанию
const DEFAULT_CONFIG: OrchestratorConfig = {
  enablePreFlight: true,
  enableQualityGates: true,
  enableGitWorkflow: true,
  enableUserApproval: true
};

// Основной класс оркестратора
export class Orchestrator {
  private config: OrchestratorConfig;
  private currentPhase: string = "init";

  constructor(config: Partial<OrchestratorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // Получить текущую фазу
  getPhase(): string {
    return this.currentPhase;
  }

  // Установить фазу
  setPhase(phase: string): void {
    this.currentPhase = phase;
  }

  // Выполнить инициализацию
  async initialize($: any, directory: string): Promise<void> {
    this.setPhase("initialization");
    
    if (this.config.enablePreFlight) {
      const result = await preFlight.run($, directory);
      if (!result.success) {
        throw new Error(`Pre-Flight не пройден: ${result.errors.join(", ")}`);
      }
    }

    await stateMachine.initialize(directory);
    this.setPhase("ready");
  }

  // Определить состояние проекта
  async analyzeState($: any, directory: string): Promise<ProjectStateCode> {
    this.setPhase("analyze-state");
    const state = await stateMachine.getState($, directory);
    return state.code;
  }

  // Проверить разрешение агента
  isAgentAllowed(agentName: string): boolean {
    const currentState = stateMachine.getCurrentState();
    return stateMachine.isAgentAllowed(agentName, currentState);
  }

  // Проверить разрешение инструмента
  isToolAllowed(toolName: string): boolean {
    const currentState = stateMachine.getCurrentState();
    return stateMachine.isToolAllowed(toolName, currentState);
  }

  // Выполнить Pre-Execution проверку
  async preExecution(taskInput: any): Promise<boolean> {
    if (!this.config.enableQualityGates) return true;
    
    const result = await qualityGates.preExecution(taskInput);
    return result.passed;
  }

  // Выполнить Post-Execution проверку
  async postExecution(taskOutput: any): Promise<boolean> {
    if (!this.config.enableQualityGates) return true;
    
    const result = await qualityGates.postExecution(taskOutput);
    return result.passed;
  }

  // Создать feature-ветку
  async createFeatureBranch($: any, directory: string, taskName: string): Promise<string> {
    if (!this.config.enableGitWorkflow) {
      throw new Error("Git Workflow отключён");
    }
    
    return await gitWorkflow.createFeatureBranch($, { directory }, taskName);
  }

  // Выполнить pre-commit проверку
  async preCommitCheck($: any, directory: string): Promise<{ valid: boolean; errors: string[] }> {
    if (!this.config.enableGitWorkflow) {
      return { valid: true, errors: [] };
    }
    
    return await gitWorkflow.preCommitCheck($, directory);
  }

  // Предложить следующий шаг
  suggestNextStep(nextAgent: string, task: string): string {
    return userApproval.suggestNextStep(this.currentPhase, nextAgent, task);
  }

  // Получить информацию о состоянии
  getStateInfo(): { code: number; description: string } {
    const code = stateMachine.getCurrentState();
    return {
      code,
      description: stateMachine.getStateDescription(code)
    };
  }
}

// Фабрика для создания оркестратора
export function createOrchestrator(config?: Partial<OrchestratorConfig>): Orchestrator {
  return new Orchestrator(config);
}

export const orchestrator = {
  create: createOrchestrator,
  getPhase: (orch: Orchestrator) => orch.getPhase(),
  analyzeState: (orch: Orchestrator) => orch.analyzeState.bind(orch),
  isAgentAllowed: (orch: Orchestrator) => orch.isAgentAllowed.bind(orch)
};

export default orchestrator;