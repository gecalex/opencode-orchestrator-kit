// Tests for mcp-resolution.ts
import {
  loadCache,
  saveCache,
  detectTechnologies,
  searchMCPServers,
  installMCPServer,
  configureMcpServer,
  getMCPStatus,
  getInstalledMCPs,
  validateMCP,
  getAllMCPRegistry,
  searchByCategory,
  searchByTag,
  getCategories,
  mcpResolution
} from '../mcp-resolution';

describe('MCP Resolution Module', () => {
  describe('loadCache()', () => {
    it('должен быть функцией', () => {
      expect(loadCache).toBeDefined();
      expect(typeof loadCache).toBe('function');
    });

    it('должен принимать directory', () => {
      expect(() => loadCache('/nonexistent/path')).not.toThrow();
    });
  });

  describe('saveCache()', () => {
    it('должен быть функцией', () => {
      expect(saveCache).toBeDefined();
      expect(typeof saveCache).toBe('function');
    });

    it('должен принимать directory', () => {
      expect(() => saveCache('/test')).not.toThrow();
    });
  });

  describe('detectTechnologies()', () => {
    it('должен быть функцией', () => {
      expect(detectTechnologies).toBeDefined();
      expect(typeof detectTechnologies).toBe('function');
    });

    it('должен принимать $ и directory', () => {
      expect(() => detectTechnologies({}, '/nonexistent')).not.toThrow();
    });

    it('должен возвращать массив', () => {
      const result = detectTechnologies({}, '/nonexistent');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('searchMCPServers()', () => {
    it('должен быть функцией', () => {
      expect(searchMCPServers).toBeDefined();
      expect(typeof searchMCPServers).toBe('function');
    });

    it('должен искать по технологии python', () => {
      const result = searchMCPServers('python');
      expect(result.length).toBeGreaterThan(0);
    });

    it('должен искать по технологии typescript', () => {
      const result = searchMCPServers('typescript');
      expect(result.length).toBeGreaterThan(0);
    });

    it('должен искать по технологии database', () => {
      const result = searchMCPServers('database');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('installMCPServer()', () => {
    it('должен быть async функцией', () => {
      expect(installMCPServer.constructor.name).toBe('AsyncFunction');
    });
  });

  describe('configureMcpServer()', () => {
    it('должен быть функцией', () => {
      expect(configureMcpServer).toBeDefined();
      expect(typeof configureMcpServer).toBe('function');
    });

    it('должен принимать serverName и config', () => {
      expect(() => configureMcpServer('test-server', {})).not.toThrow();
    });
  });

  describe('getMCPStatus()', () => {
    it('должен быть функцией', () => {
      expect(getMCPStatus).toBeDefined();
      expect(typeof getMCPStatus).toBe('function');
    });

    it('должен возвращать undefined для несуществующего сервера', () => {
      const result = getMCPStatus('nonexistent-server-xyz');
      expect(result).toBeUndefined();
    });
  });

  describe('getInstalledMCPs()', () => {
    it('должен быть функцией', () => {
      expect(getInstalledMCPs).toBeDefined();
      expect(typeof getInstalledMCPs).toBe('function');
    });

    it('должен возвращать массив', () => {
      const result = getInstalledMCPs();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('validateMCP()', () => {
    it('должен быть async функцией', () => {
      expect(validateMCP.constructor.name).toBe('AsyncFunction');
    });
  });

  describe('getAllMCPRegistry()', () => {
    it('должен быть функцией', () => {
      expect(getAllMCPRegistry).toBeDefined();
      expect(typeof getAllMCPRegistry).toBe('function');
    });

    it('должен возвращать массив', () => {
      const result = getAllMCPRegistry();
      expect(Array.isArray(result)).toBe(true);
    });

    it('должен содержать минимум 20 серверов', () => {
      const result = getAllMCPRegistry();
      expect(result.length).toBeGreaterThanOrEqual(20);
    });
  });

  describe('searchByCategory()', () => {
    it('должен быть функцией', () => {
      expect(searchByCategory).toBeDefined();
      expect(typeof searchByCategory).toBe('function');
    });

    it('должен искать по категории database', () => {
      const result = searchByCategory('database');
      expect(result.length).toBeGreaterThan(0);
    });

    it('должен искать по категории memory', () => {
      const result = searchByCategory('memory');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('searchByTag()', () => {
    it('должен быть функцией', () => {
      expect(searchByTag).toBeDefined();
      expect(typeof searchByTag).toBe('function');
    });

    it('должен искать по тегу', () => {
      const result = searchByTag('база данных');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getCategories()', () => {
    it('должен быть функцией', () => {
      expect(getCategories).toBeDefined();
      expect(typeof getCategories).toBe('function');
    });

    it('должен возвращать объект', () => {
      const result = getCategories();
      expect(typeof result).toBe('object');
    });

    it('должен содержать категорию database', () => {
      const result = getCategories();
      expect(result.database).toBeDefined();
    });
  });

  describe('mcpResolution default export', () => {
    it('должен экспортировать loadCache', () => {
      expect(mcpResolution.loadCache).toBeDefined();
    });

    it('должен экспортировать saveCache', () => {
      expect(mcpResolution.saveCache).toBeDefined();
    });

    it('должен экспортировать detectTechnologies', () => {
      expect(mcpResolution.detectTechnologies).toBeDefined();
    });

    it('должен экспортировать searchMCPServers', () => {
      expect(mcpResolution.searchMCPServers).toBeDefined();
    });

    it('должен экспортировать installMCPServer', () => {
      expect(mcpResolution.installMCPServer).toBeDefined();
    });

    it('должен экспортировать getAllMCPRegistry', () => {
      expect(mcpResolution.getAllMCPRegistry).toBeDefined();
    });

    it('должен использовать правильные функции', () => {
      const servers = mcpResolution.searchMCPServers('python');
      expect(servers.length).toBeGreaterThan(0);
    });
  });
});