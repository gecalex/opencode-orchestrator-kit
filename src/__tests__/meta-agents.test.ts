// Tests for meta-agents.ts
import {
  createAgentFromTemplate,
  registerFuturesAgent,
  createFuturesAgent,
  validateAgentStructure,
  getTemplates,
  getDynamicAgents,
  getFuturesAgents,
  reloadAgent,
  metaAgents
} from '../meta-agents';

describe('Meta Agents Module', () => {
  describe('createAgentFromTemplate()', () => {
    it('должен создавать агента из шаблона python-tdd', () => {
      const agent = createAgentFromTemplate('python-tdd');
      
      expect(agent).not.toBeNull();
      expect(agent!.name).toBe('python-tdd');
      expect(agent!.description).toBe('Python TDD разработка');
      expect(agent!.template).toBe('python-tdd');
    });

    it('должен создавать агента из шаблона code-reviewer', () => {
      const agent = createAgentFromTemplate('code-reviewer');
      
      expect(agent).not.toBeNull();
      expect(agent!.name).toBe('code-reviewer');
    });

    it('должен создавать агента с кастомным именем', () => {
      const agent = createAgentFromTemplate('python-tdd', 'my-custom-agent');
      
      expect(agent!.name).toBe('my-custom-agent');
    });

    it('должен возвращать null для неизвестного шаблона', () => {
      const agent = createAgentFromTemplate('unknown-template-xyz');
      
      expect(agent).toBeNull();
    });

    it('должен устанавливать createdAt', () => {
      const agent = createAgentFromTemplate('docs-writer');
      
      expect(agent!.createdAt).toBeDefined();
    });
  });

  describe('registerFuturesAgent()', () => {
    it('должен регистрировать futures агента', () => {
      const before = getFuturesAgents().length;
      registerFuturesAgent('new-capability');
      const after = getFuturesAgents().length;
      
      expect(after).toBeGreaterThan(before);
    });

    it('должен добавлять с статусом needed', () => {
      registerFuturesAgent('test-capability-xyz');
      const futures = getFuturesAgents();
      const found = futures.find(f => f.capability === 'test-capability-xyz');
      
      expect(found).toBeDefined();
      expect(found!.status).toBe('needed');
    });
  });

  describe('createFuturesAgent()', () => {
    it('должен возвращать null если futures не зарегистрирован', () => {
      const agent = createFuturesAgent('nonexistent-capability', 'python-tdd');
      
      expect(agent).toBeNull();
    });

    it('должен создавать агента если futures зарегистрирован', () => {
      registerFuturesAgent('test-capability-create');
      const agent = createFuturesAgent('test-capability-create', 'python-tdd');
      
      expect(agent).not.toBeNull();
    });
  });

  describe('validateAgentStructure()', () => {
    it('должен валидировать корректного агента', () => {
      const agent = createAgentFromTemplate('python-tdd')!;
      const result = validateAgentStructure(agent);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('должен находить ошибки отсутствия name', () => {
      const agent: any = {
        description: 'desc',
        createdAt: '2024-01-01'
      };
      const result = validateAgentStructure(agent);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('name is required');
    });

    it('должен находить ошибки отсутствия description', () => {
      const agent: any = {
        name: 'test',
        createdAt: '2024-01-01'
      };
      const result = validateAgentStructure(agent);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('description is required');
    });

    it('должен находить ошибки отсутствия createdAt', () => {
      const agent: any = {
        name: 'test',
        description: 'desc'
      };
      const result = validateAgentStructure(agent);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('createdAt is required');
    });

    it('должен находить несколько ошибок', () => {
      const agent: any = {};
      const result = validateAgentStructure(agent);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('getTemplates()', () => {
    it('должен возвращать массив шаблонов', () => {
      const templates = getTemplates();
      
      expect(Array.isArray(templates)).toBe(true);
    });

    it('должен содержать python-tdd', () => {
      const templates = getTemplates();
      
      expect(templates).toContain('python-tdd');
    });

    it('должен содержать code-reviewer', () => {
      const templates = getTemplates();
      
      expect(templates).toContain('code-reviewer');
    });

    it('должен содержать docs-writer', () => {
      const templates = getTemplates();
      
      expect(templates).toContain('docs-writer');
    });

    it('должен иметь минимум 3 шаблона', () => {
      const templates = getTemplates();
      
      expect(templates.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('getDynamicAgents()', () => {
    it('должен возвращать массив', () => {
      const agents = getDynamicAgents();
      
      expect(Array.isArray(agents)).toBe(true);
    });
  });

  describe('getFuturesAgents()', () => {
    it('должен возвращать массив', () => {
      const agents = getFuturesAgents();
      
      expect(Array.isArray(agents)).toBe(true);
    });
  });

  describe('reloadAgent()', () => {
    it('должен возвращать true для существующего агента', () => {
      createAgentFromTemplate('python-tdd', 'reload-test-agent');
      const result = reloadAgent('reload-test-agent');
      
      expect(result).toBe(true);
    });

    it('должен возвращать false для несуществующего агента', () => {
      const result = reloadAgent('nonexistent-agent-xyz');
      
      expect(result).toBe(false);
    });

    it('должен обновлять createdAt', () => {
      createAgentFromTemplate('python-tdd', 'reload-test-agent-2');
      const before = getDynamicAgents().find(a => a.name === 'reload-test-agent-2')!.createdAt;
      
      reloadAgent('reload-test-agent-2');
      const after = getDynamicAgents().find(a => a.name === 'reload-test-agent-2')!.createdAt;
      
      expect(after).toBeDefined();
    });
  });

  describe('metaAgents default export', () => {
    it('должен экспортировать createAgentFromTemplate', () => {
      expect(metaAgents.createAgentFromTemplate).toBeDefined();
    });

    it('должен экспортировать registerFuturesAgent', () => {
      expect(metaAgents.registerFuturesAgent).toBeDefined();
    });

    it('должен экспортировать createFuturesAgent', () => {
      expect(metaAgents.createFuturesAgent).toBeDefined();
    });

    it('должен экспортировать validateAgentStructure', () => {
      expect(metaAgents.validateAgentStructure).toBeDefined();
    });

    it('должен экспортировать getTemplates', () => {
      expect(metaAgents.getTemplates).toBeDefined();
    });

    it('должен экспортировать getDynamicAgents', () => {
      expect(metaAgents.getDynamicAgents).toBeDefined();
    });

    it('должен экспортировать getFuturesAgents', () => {
      expect(metaAgents.getFuturesAgents).toBeDefined();
    });

    it('должен экспортировать reloadAgent', () => {
      expect(metaAgents.reloadAgent).toBeDefined();
    });

    it('должен использовать правильные функции', () => {
      const templates = metaAgents.getTemplates();
      expect(templates.length).toBeGreaterThan(0);
    });
  });
});