"use strict";
// Основной модуль оркестратора
// Координация работы всех компонентов плагина
Object.defineProperty(exports, "__esModule", { value: true });
exports.orchestrator = exports.Orchestrator = void 0;
exports.createOrchestrator = createOrchestrator;
const state_machine_1 = require("./state-machine");
const pre_flight_1 = require("./pre-flight");
const quality_gates_1 = require("./quality-gates");
const git_workflow_1 = require("./git-workflow");
const user_approval_1 = require("./user-approval");
// Конфигурация по умолчанию
const DEFAULT_CONFIG = {
    enablePreFlight: true,
    enableQualityGates: true,
    enableGitWorkflow: true,
    enableUserApproval: true
};
// Основной класс оркестратора
class Orchestrator {
    config;
    currentPhase = "init";
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }
    // Получить текущую фазу
    getPhase() {
        return this.currentPhase;
    }
    // Установить фазу
    setPhase(phase) {
        this.currentPhase = phase;
    }
    // Выполнить инициализацию
    async initialize($, directory) {
        this.setPhase("initialization");
        if (this.config.enablePreFlight) {
            const result = await pre_flight_1.preFlight.run($, directory);
            if (!result.success) {
                throw new Error(`Pre-Flight не пройден: ${result.errors.join(", ")}`);
            }
        }
        await state_machine_1.stateMachine.initialize(directory);
        this.setPhase("ready");
    }
    // Определить состояние проекта
    async analyzeState($, directory) {
        this.setPhase("analyze-state");
        const state = await state_machine_1.stateMachine.getState($, directory);
        return state.code;
    }
    // Проверить разрешение агента
    isAgentAllowed(agentName) {
        const currentState = state_machine_1.stateMachine.getCurrentState();
        return state_machine_1.stateMachine.isAgentAllowed(agentName, currentState);
    }
    // Проверить разрешение инструмента
    isToolAllowed(toolName) {
        const currentState = state_machine_1.stateMachine.getCurrentState();
        return state_machine_1.stateMachine.isToolAllowed(toolName, currentState);
    }
    // Выполнить Pre-Execution проверку
    async preExecution(taskInput) {
        if (!this.config.enableQualityGates)
            return true;
        const result = await quality_gates_1.qualityGates.preExecution(taskInput);
        return result.passed;
    }
    // Выполнить Post-Execution проверку
    async postExecution(taskOutput) {
        if (!this.config.enableQualityGates)
            return true;
        const result = await quality_gates_1.qualityGates.postExecution(taskOutput);
        return result.passed;
    }
    // Создать feature-ветку
    async createFeatureBranch($, directory, taskName) {
        if (!this.config.enableGitWorkflow) {
            throw new Error("Git Workflow отключён");
        }
        return await git_workflow_1.gitWorkflow.createFeatureBranch($, { directory }, taskName);
    }
    // Выполнить pre-commit проверку
    async preCommitCheck($, directory) {
        if (!this.config.enableGitWorkflow) {
            return { valid: true, errors: [] };
        }
        return await git_workflow_1.gitWorkflow.preCommitCheck($, directory);
    }
    // Предложить следующий шаг
    suggestNextStep(nextAgent, task) {
        return user_approval_1.userApproval.suggestNextStep(this.currentPhase, nextAgent, task);
    }
    // Получить информацию о состоянии
    getStateInfo() {
        const code = state_machine_1.stateMachine.getCurrentState();
        return {
            code,
            description: state_machine_1.stateMachine.getStateDescription(code)
        };
    }
}
exports.Orchestrator = Orchestrator;
// Фабрика для создания оркестратора
function createOrchestrator(config) {
    return new Orchestrator(config);
}
exports.orchestrator = {
    create: createOrchestrator,
    getPhase: (orch) => orch.getPhase(),
    analyzeState: (orch) => orch.analyzeState.bind(orch),
    isAgentAllowed: (orch) => orch.isAgentAllowed.bind(orch)
};
exports.default = exports.orchestrator;
