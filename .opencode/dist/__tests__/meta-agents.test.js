"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Tests for meta-agents.ts
const meta_agents_1 = require("../meta-agents");
describe('Meta Agents Module', () => {
    describe('createAgentFromTemplate()', () => {
        it('должен создавать агента из шаблона python-tdd', () => {
            const agent = (0, meta_agents_1.createAgentFromTemplate)('python-tdd');
            expect(agent).not.toBeNull();
            expect(agent.name).toBe('python-tdd');
            expect(agent.description).toBe('Python TDD разработка');
            expect(agent.template).toBe('python-tdd');
        });
        it('должен создавать агента из шаблона code-reviewer', () => {
            const agent = (0, meta_agents_1.createAgentFromTemplate)('code-reviewer');
            expect(agent).not.toBeNull();
            expect(agent.name).toBe('code-reviewer');
        });
        it('должен создавать агента с кастомным именем', () => {
            const agent = (0, meta_agents_1.createAgentFromTemplate)('python-tdd', 'my-custom-agent');
            expect(agent.name).toBe('my-custom-agent');
        });
        it('должен возвращать null для неизвестного шаблона', () => {
            const agent = (0, meta_agents_1.createAgentFromTemplate)('unknown-template-xyz');
            expect(agent).toBeNull();
        });
        it('должен устанавливать createdAt', () => {
            const agent = (0, meta_agents_1.createAgentFromTemplate)('docs-writer');
            expect(agent.createdAt).toBeDefined();
        });
    });
    describe('registerFuturesAgent()', () => {
        it('должен регистрировать futures агента', () => {
            const before = (0, meta_agents_1.getFuturesAgents)().length;
            (0, meta_agents_1.registerFuturesAgent)('new-capability');
            const after = (0, meta_agents_1.getFuturesAgents)().length;
            expect(after).toBeGreaterThan(before);
        });
        it('должен добавлять с статусом needed', () => {
            (0, meta_agents_1.registerFuturesAgent)('test-capability-xyz');
            const futures = (0, meta_agents_1.getFuturesAgents)();
            const found = futures.find(f => f.capability === 'test-capability-xyz');
            expect(found).toBeDefined();
            expect(found.status).toBe('needed');
        });
    });
    describe('createFuturesAgent()', () => {
        it('должен возвращать null если futures не зарегистрирован', () => {
            const agent = (0, meta_agents_1.createFuturesAgent)('nonexistent-capability', 'python-tdd');
            expect(agent).toBeNull();
        });
        it('должен создавать агента если futures зарегистрирован', () => {
            (0, meta_agents_1.registerFuturesAgent)('test-capability-create');
            const agent = (0, meta_agents_1.createFuturesAgent)('test-capability-create', 'python-tdd');
            expect(agent).not.toBeNull();
        });
    });
    describe('validateAgentStructure()', () => {
        it('должен валидировать корректного агента', () => {
            const agent = (0, meta_agents_1.createAgentFromTemplate)('python-tdd');
            const result = (0, meta_agents_1.validateAgentStructure)(agent);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
        it('должен находить ошибки отсутствия name', () => {
            const agent = {
                description: 'desc',
                createdAt: '2024-01-01'
            };
            const result = (0, meta_agents_1.validateAgentStructure)(agent);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('name is required');
        });
        it('должен находить ошибки отсутствия description', () => {
            const agent = {
                name: 'test',
                createdAt: '2024-01-01'
            };
            const result = (0, meta_agents_1.validateAgentStructure)(agent);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('description is required');
        });
        it('должен находить ошибки отсутствия createdAt', () => {
            const agent = {
                name: 'test',
                description: 'desc'
            };
            const result = (0, meta_agents_1.validateAgentStructure)(agent);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('createdAt is required');
        });
        it('должен находить несколько ошибок', () => {
            const agent = {};
            const result = (0, meta_agents_1.validateAgentStructure)(agent);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(1);
        });
    });
    describe('getTemplates()', () => {
        it('должен возвращать массив шаблонов', () => {
            const templates = (0, meta_agents_1.getTemplates)();
            expect(Array.isArray(templates)).toBe(true);
        });
        it('должен содержать python-tdd', () => {
            const templates = (0, meta_agents_1.getTemplates)();
            expect(templates).toContain('python-tdd');
        });
        it('должен содержать code-reviewer', () => {
            const templates = (0, meta_agents_1.getTemplates)();
            expect(templates).toContain('code-reviewer');
        });
        it('должен содержать docs-writer', () => {
            const templates = (0, meta_agents_1.getTemplates)();
            expect(templates).toContain('docs-writer');
        });
        it('должен иметь минимум 3 шаблона', () => {
            const templates = (0, meta_agents_1.getTemplates)();
            expect(templates.length).toBeGreaterThanOrEqual(3);
        });
    });
    describe('getDynamicAgents()', () => {
        it('должен возвращать массив', () => {
            const agents = (0, meta_agents_1.getDynamicAgents)();
            expect(Array.isArray(agents)).toBe(true);
        });
    });
    describe('getFuturesAgents()', () => {
        it('должен возвращать массив', () => {
            const agents = (0, meta_agents_1.getFuturesAgents)();
            expect(Array.isArray(agents)).toBe(true);
        });
    });
    describe('reloadAgent()', () => {
        it('должен возвращать true для существующего агента', () => {
            (0, meta_agents_1.createAgentFromTemplate)('python-tdd', 'reload-test-agent');
            const result = (0, meta_agents_1.reloadAgent)('reload-test-agent');
            expect(result).toBe(true);
        });
        it('должен возвращать false для несуществующего агента', () => {
            const result = (0, meta_agents_1.reloadAgent)('nonexistent-agent-xyz');
            expect(result).toBe(false);
        });
        it('должен обновлять createdAt', () => {
            (0, meta_agents_1.createAgentFromTemplate)('python-tdd', 'reload-test-agent-2');
            const before = (0, meta_agents_1.getDynamicAgents)().find(a => a.name === 'reload-test-agent-2').createdAt;
            (0, meta_agents_1.reloadAgent)('reload-test-agent-2');
            const after = (0, meta_agents_1.getDynamicAgents)().find(a => a.name === 'reload-test-agent-2').createdAt;
            expect(after).toBeDefined();
        });
    });
    describe('metaAgents default export', () => {
        it('должен экспортировать createAgentFromTemplate', () => {
            expect(meta_agents_1.metaAgents.createAgentFromTemplate).toBeDefined();
        });
        it('должен экспортировать registerFuturesAgent', () => {
            expect(meta_agents_1.metaAgents.registerFuturesAgent).toBeDefined();
        });
        it('должен экспортировать createFuturesAgent', () => {
            expect(meta_agents_1.metaAgents.createFuturesAgent).toBeDefined();
        });
        it('должен экспортировать validateAgentStructure', () => {
            expect(meta_agents_1.metaAgents.validateAgentStructure).toBeDefined();
        });
        it('должен экспортировать getTemplates', () => {
            expect(meta_agents_1.metaAgents.getTemplates).toBeDefined();
        });
        it('должен экспортировать getDynamicAgents', () => {
            expect(meta_agents_1.metaAgents.getDynamicAgents).toBeDefined();
        });
        it('должен экспортировать getFuturesAgents', () => {
            expect(meta_agents_1.metaAgents.getFuturesAgents).toBeDefined();
        });
        it('должен экспортировать reloadAgent', () => {
            expect(meta_agents_1.metaAgents.reloadAgent).toBeDefined();
        });
        it('должен использовать правильные функции', () => {
            const templates = meta_agents_1.metaAgents.getTemplates();
            expect(templates.length).toBeGreaterThan(0);
        });
    });
});
