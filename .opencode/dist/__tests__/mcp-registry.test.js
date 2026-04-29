"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Tests for mcp-registry.ts
const mcp_registry_1 = require("../mcp-registry");
describe('MCP Registry', () => {
    describe('MCP_REGISTRY array', () => {
        it('должен содержать минимум 20 серверов', () => {
            expect(mcp_registry_1.MCP_REGISTRY.length).toBeGreaterThanOrEqual(20);
        });
        it('каждый сервер должен иметь обязательные поля', () => {
            mcp_registry_1.MCP_REGISTRY.forEach(server => {
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
            const ids = mcp_registry_1.MCP_REGISTRY.map(s => s.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(ids.length);
        });
    });
    describe('MCP_CATEGORIES', () => {
        it('должен содержать все категории', () => {
            const expectedCategories = [
                'database', 'search', 'filesystem', 'git', 'browser',
                'devops', 'memory', 'communication', 'project-management',
                'code-intelligence', 'language-server'
            ];
            expectedCategories.forEach(cat => {
                expect(mcp_registry_1.MCP_CATEGORIES[cat]).toBeDefined();
                expect(typeof mcp_registry_1.MCP_CATEGORIES[cat]).toBe('string');
            });
        });
    });
    describe('findMCPServersByTechnology()', () => {
        it('должен находить Python серверы', () => {
            const servers = (0, mcp_registry_1.findMCPServersByTechnology)('python');
            expect(servers.length).toBeGreaterThan(0);
            servers.forEach(s => {
                expect(s.language).toMatch(/python|typescript/);
            });
        });
        it('должен находить TypeScript серверы', () => {
            const servers = (0, mcp_registry_1.findMCPServersByTechnology)('typescript');
            expect(servers.length).toBeGreaterThan(0);
        });
        it('должен находить database серверы', () => {
            const servers = (0, mcp_registry_1.findMCPServersByTechnology)('database');
            expect(servers.length).toBeGreaterThan(0);
            servers.forEach(s => {
                expect(s.category).toBe('database');
            });
        });
        it('должен находить git серверы', () => {
            const servers = (0, mcp_registry_1.findMCPServersByTechnology)('git');
            expect(servers.length).toBeGreaterThan(0);
        });
        it('должен находить память серверы', () => {
            const servers = (0, mcp_registry_1.findMCPServersByTechnology)('memory');
            expect(servers.length).toBeGreaterThan(0);
        });
        it('должен возвращать пустой массив для неизвестной технологии', () => {
            const servers = (0, mcp_registry_1.findMCPServersByTechnology)('unknown_tech_xyz');
            expect(servers).toHaveLength(0);
        });
        it('должен быть case-insensitive', () => {
            const servers1 = (0, mcp_registry_1.findMCPServersByTechnology)('PYTHON');
            const servers2 = (0, mcp_registry_1.findMCPServersByTechnology)('python');
            expect(servers1.length).toBe(servers2.length);
        });
    });
    describe('findMCPServersByCategory()', () => {
        it('должен находить database серверы', () => {
            const servers = (0, mcp_registry_1.findMCPServersByCategory)('database');
            expect(servers.length).toBeGreaterThan(0);
            servers.forEach(s => {
                expect(s.category).toBe('database');
            });
        });
        it('должен находить memory серверы', () => {
            const servers = (0, mcp_registry_1.findMCPServersByCategory)('memory');
            expect(servers.length).toBeGreaterThan(0);
        });
        it('должен находить filesystem серверы', () => {
            const servers = (0, mcp_registry_1.findMCPServersByCategory)('filesystem');
            expect(servers.length).toBeGreaterThan(0);
        });
        it('должен находить git серверы', () => {
            const servers = (0, mcp_registry_1.findMCPServersByCategory)('git');
            expect(servers.length).toBeGreaterThan(0);
        });
    });
    describe('findMCPServersByTag()', () => {
        it('должен искать по тегу база данных', () => {
            const servers = (0, mcp_registry_1.findMCPServersByTag)('база данных');
            expect(servers.length).toBeGreaterThan(0);
        });
        it('должен искать по тегу vcs', () => {
            const servers = (0, mcp_registry_1.findMCPServersByTag)('vcs');
            expect(servers.length).toBeGreaterThan(0);
        });
        it('должен быть case-insensitive', () => {
            const servers1 = (0, mcp_registry_1.findMCPServersByTag)('DATABASE');
            const servers2 = (0, mcp_registry_1.findMCPServersByTag)('database');
            expect(servers1.length).toBe(servers2.length);
        });
        it('должен возвращать пустой массив для неизвестного тега', () => {
            const servers = (0, mcp_registry_1.findMCPServersByTag)('nonexistent_tag_xyz');
            expect(servers).toHaveLength(0);
        });
    });
    describe('getMCPServer()', () => {
        it('должен находить существующий сервер', () => {
            const server = (0, mcp_registry_1.getMCPServer)('filesystem');
            expect(server).toBeDefined();
            expect(server.id).toBe('filesystem');
            expect(server.name).toBe('Filesystem');
        });
        it('должен находить postgres сервер', () => {
            const server = (0, mcp_registry_1.getMCPServer)('postgres');
            expect(server).toBeDefined();
            expect(server.category).toBe('database');
        });
        it('должен возвращать undefined для неизвестного сервера', () => {
            const server = (0, mcp_registry_1.getMCPServer)('nonexistent_server_xyz');
            expect(server).toBeUndefined();
        });
    });
    describe('getAllMCPServers()', () => {
        it('должен возвращать все серверы', () => {
            const servers = (0, mcp_registry_1.getAllMCPServers)();
            expect(servers.length).toBe(mcp_registry_1.MCP_REGISTRY.length);
        });
        it('должен возвращать копию массива', () => {
            const servers = (0, mcp_registry_1.getAllMCPServers)();
            servers.push({});
            expect((0, mcp_registry_1.getAllMCPServers)().length).toBe(mcp_registry_1.MCP_REGISTRY.length);
        });
    });
    describe('getMCPServersGroupedByCategory()', () => {
        it('должен группировать серверы по категориям', () => {
            const grouped = (0, mcp_registry_1.getMCPServersGroupedByCategory)();
            expect(grouped['database']).toBeDefined();
            expect(grouped['memory']).toBeDefined();
            expect(grouped['filesystem']).toBeDefined();
            expect(grouped['git']).toBeDefined();
        });
        it('каждая группа должна содержать серверы с правильной категорией', () => {
            const grouped = (0, mcp_registry_1.getMCPServersGroupedByCategory)();
            Object.entries(grouped).forEach(([category, servers]) => {
                servers.forEach(server => {
                    expect(server.category).toBe(category);
                });
            });
        });
        it('сумма серверов по группам должна равняться общему числу', () => {
            const grouped = (0, mcp_registry_1.getMCPServersGroupedByCategory)();
            let total = 0;
            Object.values(grouped).forEach(servers => {
                total += servers.length;
            });
            expect(total).toBe(mcp_registry_1.MCP_REGISTRY.length);
        });
    });
    describe('mcpRegistry default export', () => {
        it('должен экспортировать все функции', () => {
            expect(mcp_registry_1.mcpRegistry.getAll).toBeDefined();
            expect(mcp_registry_1.mcpRegistry.getById).toBeDefined();
            expect(mcp_registry_1.mcpRegistry.getByCategory).toBeDefined();
            expect(mcp_registry_1.mcpRegistry.getByTag).toBeDefined();
            expect(mcp_registry_1.mcpRegistry.getByTech).toBeDefined();
            expect(mcp_registry_1.mcpRegistry.getGroupedByCategory).toBeDefined();
            expect(mcp_registry_1.mcpRegistry.categories).toBeDefined();
        });
        it('должен использовать правильные функции', () => {
            expect(mcp_registry_1.mcpRegistry.getAll()).toHaveLength(mcp_registry_1.MCP_REGISTRY.length);
            expect(mcp_registry_1.mcpRegistry.getById('postgres')).toBeDefined();
            expect(mcp_registry_1.mcpRegistry.getByCategory('database').length).toBeGreaterThan(0);
        });
    });
    describe('Known servers', () => {
        it('filesystem сервер должен иметь правильную конфигурацию', () => {
            const server = (0, mcp_registry_1.getMCPServer)('filesystem');
            expect(server).toBeDefined();
            expect(server.type).toBe('local');
            expect(server.installCommand).toContain('modelcontextprotocol');
        });
        it('postgres сервер должен иметь правильную конфигурацию', () => {
            const server = (0, mcp_registry_1.getMCPServer)('postgres');
            expect(server).toBeDefined();
            expect(server.type).toBe('local');
            expect(server.category).toBe('database');
        });
        it('github сервер должен иметь auth', () => {
            const server = (0, mcp_registry_1.getMCPServer)('github');
            expect(server).toBeDefined();
            expect(server.auth).toBe('env');
        });
    });
});
