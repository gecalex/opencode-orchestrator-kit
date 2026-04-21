// Tests for mcp-registry.ts
import {
  MCP_REGISTRY,
  MCP_CATEGORIES,
  MCPCategory,
  findMCPServersByTechnology,
  findMCPServersByCategory,
  findMCPServersByTag,
  getMCPServer,
  getAllMCPServers,
  getMCPServersGroupedByCategory,
  mcpRegistry
} from '../mcp-registry';

describe('MCP Registry', () => {
  describe('MCP_REGISTRY array', () => {
    it('должен содержать минимум 20 серверов', () => {
      expect(MCP_REGISTRY.length).toBeGreaterThanOrEqual(20);
    });

    it('каждый сервер должен иметь обязательные поля', () => {
      MCP_REGISTRY.forEach(server => {
        expect(server.id).toBeDefined();
        expect(server.name).toBeDefined();
        expect(server.description).toBeDefined();
        expect(server.category).toBeDefined();
        expect(server.type).toMatch(/^(local|remote)$/);
        expect(server.tags).toBeDefined();
        expect(Array.isArray(server.tags)).toBe(true);
      });
    });

    it('не должен содержать дубликаты по id', () => {
      const ids = MCP_REGISTRY.map(s => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('MCP_CATEGORIES', () => {
    it('должен содержать все категории', () => {
      const expectedCategories: MCPCategory[] = [
        'database', 'search', 'filesystem', 'git', 'browser',
        'devops', 'memory', 'communication', 'project-management',
        'code-intelligence', 'language-server'
      ];
      
      expectedCategories.forEach(cat => {
        expect(MCP_CATEGORIES[cat]).toBeDefined();
        expect(typeof MCP_CATEGORIES[cat]).toBe('string');
      });
    });
  });

  describe('findMCPServersByTechnology()', () => {
    it('должен находить Python серверы', () => {
      const servers = findMCPServersByTechnology('python');
      expect(servers.length).toBeGreaterThan(0);
      servers.forEach(s => {
        expect(s.language).toMatch(/python|typescript/);
      });
    });

    it('должен находить TypeScript серверы', () => {
      const servers = findMCPServersByTechnology('typescript');
      expect(servers.length).toBeGreaterThan(0);
    });

    it('должен находить database серверы', () => {
      const servers = findMCPServersByTechnology('database');
      expect(servers.length).toBeGreaterThan(0);
      servers.forEach(s => {
        expect(s.category).toBe('database');
      });
    });

    it('должен находить git серверы', () => {
      const servers = findMCPServersByTechnology('git');
      expect(servers.length).toBeGreaterThan(0);
    });

    it('должен находить память серверы', () => {
      const servers = findMCPServersByTechnology('memory');
      expect(servers.length).toBeGreaterThan(0);
    });

    it('должен возвращать пустой массив для неизвестной технологии', () => {
      const servers = findMCPServersByTechnology('unknown_tech_xyz');
      expect(servers).toHaveLength(0);
    });

    it('должен быть case-insensitive', () => {
      const servers1 = findMCPServersByTechnology('PYTHON');
      const servers2 = findMCPServersByTechnology('python');
      expect(servers1.length).toBe(servers2.length);
    });
  });

  describe('findMCPServersByCategory()', () => {
    it('должен находить database серверы', () => {
      const servers = findMCPServersByCategory('database');
      expect(servers.length).toBeGreaterThan(0);
      servers.forEach(s => {
        expect(s.category).toBe('database');
      });
    });

    it('должен находить memory серверы', () => {
      const servers = findMCPServersByCategory('memory');
      expect(servers.length).toBeGreaterThan(0);
    });

    it('должен находить filesystem серверы', () => {
      const servers = findMCPServersByCategory('filesystem');
      expect(servers.length).toBeGreaterThan(0);
    });

    it('должен находить git серверы', () => {
      const servers = findMCPServersByCategory('git');
      expect(servers.length).toBeGreaterThan(0);
    });
  });

  describe('findMCPServersByTag()', () => {
    it('должен искать по тегу база данных', () => {
      const servers = findMCPServersByTag('база данных');
      expect(servers.length).toBeGreaterThan(0);
    });

    it('должен искать по тегу vcs', () => {
      const servers = findMCPServersByTag('vcs');
      expect(servers.length).toBeGreaterThan(0);
    });

    it('должен быть case-insensitive', () => {
      const servers1 = findMCPServersByTag('DATABASE');
      const servers2 = findMCPServersByTag('database');
      expect(servers1.length).toBe(servers2.length);
    });

    it('должен возвращать пустой массив для неизвестного тега', () => {
      const servers = findMCPServersByTag('nonexistent_tag_xyz');
      expect(servers).toHaveLength(0);
    });
  });

  describe('getMCPServer()', () => {
    it('должен находить существующий сервер', () => {
      const server = getMCPServer('filesystem');
      expect(server).toBeDefined();
      expect(server!.id).toBe('filesystem');
      expect(server!.name).toBe('Filesystem');
    });

    it('должен находить postgres сервер', () => {
      const server = getMCPServer('postgres');
      expect(server).toBeDefined();
      expect(server!.category).toBe('database');
    });

    it('должен возвращать undefined для неизвестного сервера', () => {
      const server = getMCPServer('nonexistent_server_xyz');
      expect(server).toBeUndefined();
    });
  });

  describe('getAllMCPServers()', () => {
    it('должен возвращать все серверы', () => {
      const servers = getAllMCPServers();
      expect(servers.length).toBe(MCP_REGISTRY.length);
    });

    it('должен возвращать копию массива', () => {
      const servers = getAllMCPServers();
      servers.push({} as any);
      expect(getAllMCPServers().length).toBe(MCP_REGISTRY.length);
    });
  });

  describe('getMCPServersGroupedByCategory()', () => {
    it('должен группировать серверы по категориям', () => {
      const grouped = getMCPServersGroupedByCategory();
      
      expect(grouped['database']).toBeDefined();
      expect(grouped['memory']).toBeDefined();
      expect(grouped['filesystem']).toBeDefined();
      expect(grouped['git']).toBeDefined();
    });

    it('каждая группа должна содержать серверы с правильной категорией', () => {
      const grouped = getMCPServersGroupedByCategory();
      
      Object.entries(grouped).forEach(([category, servers]) => {
        servers.forEach(server => {
          expect(server.category).toBe(category);
        });
      });
    });

    it('сумма серверов по группам должна равняться общему числу', () => {
      const grouped = getMCPServersGroupedByCategory();
      let total = 0;
      
      Object.values(grouped).forEach(servers => {
        total += servers.length;
      });
      
      expect(total).toBe(MCP_REGISTRY.length);
    });
  });

  describe('mcpRegistry default export', () => {
    it('должен экспортировать все функции', () => {
      expect(mcpRegistry.getAll).toBeDefined();
      expect(mcpRegistry.getById).toBeDefined();
      expect(mcpRegistry.getByCategory).toBeDefined();
      expect(mcpRegistry.getByTag).toBeDefined();
      expect(mcpRegistry.getByTech).toBeDefined();
      expect(mcpRegistry.getGroupedByCategory).toBeDefined();
      expect(mcpRegistry.categories).toBeDefined();
    });

    it('должен использовать правильные функции', () => {
      expect(mcpRegistry.getAll()).toHaveLength(MCP_REGISTRY.length);
      expect(mcpRegistry.getById('postgres')).toBeDefined();
      expect(mcpRegistry.getByCategory('database').length).toBeGreaterThan(0);
    });
  });

  describe('Known servers', () => {
    it('filesystem сервер должен иметь правильную конфигурацию', () => {
      const server = getMCPServer('filesystem');
      expect(server).toBeDefined();
      expect(server!.type).toBe('local');
      expect(server!.installCommand).toContain('modelcontextprotocol');
    });

    it('postgres сервер должен иметь правильную конфигурацию', () => {
      const server = getMCPServer('postgres');
      expect(server).toBeDefined();
      expect(server!.type).toBe('local');
      expect(server!.category).toBe('database');
    });

    it('github сервер должен иметь auth', () => {
      const server = getMCPServer('github');
      expect(server).toBeDefined();
      expect(server!.auth).toBe('env');
    });
  });
});