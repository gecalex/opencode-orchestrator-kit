"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Tests for orchestrator.ts
const orchestrator_1 = require("../orchestrator");
describe('Orchestrator Module', () => {
    describe('Orchestrator class', () => {
        it('должен создаваться с конфигурацией по умолчанию', () => {
            const orch = new orchestrator_1.Orchestrator();
            expect(orch).toBeDefined();
        });
        it('должен создаваться с кастомной конфигурацией', () => {
            const config = {
                enablePreFlight: false,
                enableQualityGates: false
            };
            const orch = new orchestrator_1.Orchestrator(config);
            expect(orch).toBeDefined();
        });
        it('должен иметь начальная фазу init', () => {
            const orch = new orchestrator_1.Orchestrator();
            expect(orch.getPhase()).toBe('init');
        });
        it('должен позволять установку фазы', () => {
            const orch = new orchestrator_1.Orchestrator();
            orch.setPhase('ready');
            expect(orch.getPhase()).toBe('ready');
        });
        it('должен позволять смену фазы несколько раз', () => {
            const orch = new orchestrator_1.Orchestrator();
            orch.setPhase('phase1');
            orch.setPhase('phase2');
            orch.setPhase('phase3');
            expect(orch.getPhase()).toBe('phase3');
        });
    });
    describe('createOrchestrator factory', () => {
        it('должен создавать экземпляр Orchestrator', () => {
            const orch = (0, orchestrator_1.createOrchestrator)();
            expect(orch).toBeInstanceOf(orchestrator_1.Orchestrator);
        });
        it('должен принимать конфигурацию', () => {
            const orch = (0, orchestrator_1.createOrchestrator)({ enableGitWorkflow: false });
            expect(orch).toBeDefined();
        });
    });
    describe('isAgentAllowed()', () => {
        it('должен быть функцией', () => {
            const orch = new orchestrator_1.Orchestrator();
            expect(typeof orch.isAgentAllowed).toBe('function');
        });
        it('должен возвращать boolean', () => {
            const orch = new orchestrator_1.Orchestrator();
            const result = orch.isAgentAllowed('python-developer');
            expect(typeof result).toBe('boolean');
        });
    });
    describe('isToolAllowed()', () => {
        it('должен быть функцией', () => {
            const orch = new orchestrator_1.Orchestrator();
            expect(typeof orch.isToolAllowed).toBe('function');
        });
        it('должен возвращать boolean', () => {
            const orch = new orchestrator_1.Orchestrator();
            const result = orch.isToolAllowed('write');
            expect(typeof result).toBe('boolean');
        });
    });
    describe('preExecution()', () => {
        it('должен быть async функцией', () => {
            const orch = new orchestrator_1.Orchestrator();
            expect(orch.preExecution.constructor.name).toBe('AsyncFunction');
        });
        it('должен возвращать true когда quality gates отключены', async () => {
            const orch = new orchestrator_1.Orchestrator({ enableQualityGates: false });
            const result = await orch.preExecution({ prompt: 'test' });
            expect(result).toBe(true);
        });
        it('должен принимать task input', async () => {
            const orch = new orchestrator_1.Orchestrator();
            const result = await orch.preExecution({ prompt: 'test task', subagent_type: 'test' });
            expect(typeof result).toBe('boolean');
        });
    });
    describe('postExecution()', () => {
        it('должен быть async функцией', () => {
            const orch = new orchestrator_1.Orchestrator();
            expect(orch.postExecution.constructor.name).toBe('AsyncFunction');
        });
        it('должен возвращать true когда quality gates отключены', async () => {
            const orch = new orchestrator_1.Orchestrator({ enableQualityGates: false });
            const result = await orch.postExecution({ status: 'success' });
            expect(result).toBe(true);
        });
    });
    describe('createFeatureBranch()', () => {
        it('должен быть async функцией', () => {
            const orch = new orchestrator_1.Orchestrator();
            expect(orch.createFeatureBranch.constructor.name).toBe('AsyncFunction');
        });
        it('должен выбрасывать ошибку когда git workflow отключен', async () => {
            const orch = new orchestrator_1.Orchestrator({ enableGitWorkflow: false });
            await expect(orch.createFeatureBranch({}, '/test', 'test-task')).rejects.toThrow('Git Workflow отключён');
        });
    });
    describe('preCommitCheck()', () => {
        it('должен быть async функцией', () => {
            const orch = new orchestrator_1.Orchestrator();
            expect(orch.preCommitCheck.constructor.name).toBe('AsyncFunction');
        });
        it('должен возвращать valid:true когда git workflow отключен', async () => {
            const orch = new orchestrator_1.Orchestrator({ enableGitWorkflow: false });
            const result = await orch.preCommitCheck({}, '/test');
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
    });
    describe('suggestNextStep()', () => {
        it('должен быть функцией', () => {
            const orch = new orchestrator_1.Orchestrator();
            expect(typeof orch.suggestNextStep).toBe('function');
        });
        it('должен возвращать строку', () => {
            const orch = new orchestrator_1.Orchestrator();
            const result = orch.suggestNextStep('python-developer', 'test task');
            expect(typeof result).toBe('string');
        });
        it('должен принимать параметры', () => {
            const orch = new orchestrator_1.Orchestrator();
            const result = orch.suggestNextStep('agent', 'task');
            expect(result.length).toBeGreaterThan(0);
        });
    });
    describe('getStateInfo()', () => {
        it('должен быть функцией', () => {
            const orch = new orchestrator_1.Orchestrator();
            expect(typeof orch.getStateInfo).toBe('function');
        });
        it('должен возвращать объект с code и description', () => {
            const orch = new orchestrator_1.Orchestrator();
            const info = orch.getStateInfo();
            expect(info).toHaveProperty('code');
            expect(info).toHaveProperty('description');
        });
    });
    describe('orchestrator default export', () => {
        it('должен экспортировать create', () => {
            expect(orchestrator_1.orchestrator.create).toBeDefined();
        });
        it('должен экспортировать getPhase', () => {
            expect(orchestrator_1.orchestrator.getPhase).toBeDefined();
        });
        it('должен экспортировать analyzeState', () => {
            expect(orchestrator_1.orchestrator.analyzeState).toBeDefined();
        });
        it('должен экспортировать isAgentAllowed', () => {
            expect(orchestrator_1.orchestrator.isAgentAllowed).toBeDefined();
        });
    });
    describe('OrchestratorConfig', () => {
        it('должен иметь все необходимые поля', () => {
            const config = {
                enablePreFlight: true,
                enableQualityGates: true,
                enableGitWorkflow: true,
                enableUserApproval: true
            };
            expect(config.enablePreFlight).toBe(true);
            expect(config.enableQualityGates).toBe(true);
            expect(config.enableGitWorkflow).toBe(true);
            expect(config.enableUserApproval).toBe(true);
        });
        it('должен позволять отключение компонентов', () => {
            const config = {
                enablePreFlight: false,
                enableQualityGates: false,
                enableGitWorkflow: false,
                enableUserApproval: false
            };
            expect(config.enablePreFlight).toBe(false);
            expect(config.enableQualityGates).toBe(false);
            expect(config.enableGitWorkflow).toBe(false);
            expect(config.enableUserApproval).toBe(false);
        });
    });
});
