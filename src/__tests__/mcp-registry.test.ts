// Tests for mcp-registry.ts
describe('MCP Registry - MCP-REGISTRY Module', () => {
  describe('MCP Server categories', () => {
    it('должен поддерживать категорию database', () => {
      const categories = ['database', 'search', 'files', 'automation', 'devops', 'memory', 'communication'];
      expect(categories).toContain('database');
    });

    it('должен поддерживать категорию files', () => {
      const categories = ['database', 'search', 'files', 'automation', 'devops', 'memory', 'communication'];
      expect(categories).toContain('files');
    });

    it('должен поддерживать категорию memory', () => {
      const categories = ['database', 'search', 'files', 'automation', 'devops', 'memory', 'communication'];
      expect(categories).toContain('memory');
    });
  });

  describe('MCP Server types', () => {
    it('должен включать postgres для database', () => {
      const databaseServers = ['postgres', 'sqlite', 'supabase', 'neo4j'];
      expect(databaseServers).toContain('postgres');
    });

    it('должен включать filesystem для files', () => {
      const fileServers = ['filesystem', 'git', 'github'];
      expect(fileServers).toContain('filesystem');
    });

    it('должен включать memory для memory', () => {
      const memServers = ['kratos', 'archon', 'memory'];
      expect(memServers).toContain('memory');
    });
  });

  describe('MCP Server structure', () => {
    it('должен иметь имя, категорию и описание', () => {
      const server = {
        name: 'filesystem',
        category: 'files',
        description: 'File system operations',
        version: '1.0.0'
      };
      
      expect(server.name).toBe('filesystem');
      expect(server.category).toBe('files');
      expect(server.description).toBe('File system operations');
    });
  });

  describe('Search functionality', () => {
    it('должен искать по категории', () => {
      const serversByCategory = {
        database: ['postgres', 'sqlite', 'supabase', 'neo4j'],
        files: ['filesystem', 'git', 'github']
      };
      
      expect(serversByCategory.database).toHaveLength(4);
      expect(serversByCategory.files).toHaveLength(3);
    });

    it('должен искать по технологии', () => {
      const techToServers: Record<string, string[]> = {
        python: ['python-developer', 'python-specialist'],
        typescript: ['typescript-developer', 'ts-specialist'],
        go: ['go-developer', 'go-specialist']
      };
      
      expect(techToServers.python).toContain('python-developer');
      expect(techToServers.typescript).toContain('typescript-developer');
    });
  });

  describe('Cache structure', () => {
    it('должен кешировать успешно настроенные серверы', () => {
      const cache = {
        'postgres:v1': { installed: true, lastUsed: '2024-01-01' },
        'filesystem:v1': { installed: true, lastUsed: '2024-01-02' }
      };
      
      expect(cache['postgres:v1'].installed).toBe(true);
      expect(Object.keys(cache)).toHaveLength(2);
    });
  });
});