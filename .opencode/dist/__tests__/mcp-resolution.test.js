"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Tests for mcp-resolution.ts
const mcp_resolution_1 = require("../mcp-resolution");
describe('MCP Resolution Module', () => {
    describe('loadCache()', () => {
        it('должен быть функцией', () => {
            expect(mcp_resolution_1.loadCache).toBeDefined();
            expect(typeof mcp_resolution_1.loadCache).toBe('function');
        });
        it('должен принимать directory', () => {
            expect(() => (0, mcp_resolution_1.loadCache)('/nonexistent/path')).not.toThrow();
        });
    });
    describe('saveCache()', () => {
        it('должен быть функцией', () => {
            expect(mcp_resolution_1.saveCache).toBeDefined();
            expect(typeof mcp_resolution_1.saveCache).toBe('function');
        });
        it('должен принимать directory', () => {
            expect(() => (0, mcp_resolution_1.saveCache)('/test')).not.toThrow();
        });
    });
    describe('detectTechnologies()', () => {
        it('должен быть функцией', () => {
            expect(mcp_resolution_1.detectTechnologies).toBeDefined();
            expect(typeof mcp_resolution_1.detectTechnologies).toBe('function');
        });
        it('должен принимать $ и directory', () => {
            expect(() => (0, mcp_resolution_1.detectTechnologies)({}, '/nonexistent')).not.toThrow();
        });
        it('должен возвращать массив', () => {
            const result = (0, mcp_resolution_1.detectTechnologies)({}, '/nonexistent');
            expect(Array.isArray(result)).toBe(true);
        });
    });
    describe('searchMCPServers()', () => {
        it('должен быть функцией', () => {
            expect(mcp_resolution_1.searchMCPServers).toBeDefined();
            expect(typeof mcp_resolution_1.searchMCPServers).toBe('function');
        });
        it('должен искать по технологии python', () => {
            const result = (0, mcp_resolution_1.searchMCPServers)('python');
            expect(result.length).toBeGreaterThan(0);
        });
        it('должен искать по технологии typescript', () => {
            const result = (0, mcp_resolution_1.searchMCPServers)('typescript');
            expect(result.length).toBeGreaterThan(0);
        });
        it('должен искать по технологии database', () => {
            const result = (0, mcp_resolution_1.searchMCPServers)('database');
            expect(result.length).toBeGreaterThan(0);
        });
    });
    describe('installMCPServer()', () => {
        it('должен быть async функцией', () => {
            expect(mcp_resolution_1.installMCPServer.constructor.name).toBe('AsyncFunction');
        });
    });
    describe('configureMcpServer()', () => {
        it('должен быть функцией', () => {
            expect(mcp_resolution_1.configureMcpServer).toBeDefined();
            expect(typeof mcp_resolution_1.configureMcpServer).toBe('function');
        });
        it('должен принимать serverName и config', () => {
            expect(() => (0, mcp_resolution_1.configureMcpServer)('test-server', {})).not.toThrow();
        });
    });
    describe('getMCPStatus()', () => {
        it('должен быть функцией', () => {
            expect(mcp_resolution_1.getMCPStatus).toBeDefined();
            expect(typeof mcp_resolution_1.getMCPStatus).toBe('function');
        });
        it('должен возвращать undefined для несуществующего сервера', () => {
            const result = (0, mcp_resolution_1.getMCPStatus)('nonexistent-server-xyz');
            expect(result).toBeUndefined();
        });
    });
    describe('getInstalledMCPs()', () => {
        it('должен быть функцией', () => {
            expect(mcp_resolution_1.getInstalledMCPs).toBeDefined();
            expect(typeof mcp_resolution_1.getInstalledMCPs).toBe('function');
        });
        it('должен возвращать массив', () => {
            const result = (0, mcp_resolution_1.getInstalledMCPs)();
            expect(Array.isArray(result)).toBe(true);
        });
    });
    describe('validateMCP()', () => {
        it('должен быть async функцией', () => {
            expect(mcp_resolution_1.validateMCP.constructor.name).toBe('AsyncFunction');
        });
    });
    describe('getAllMCPRegistry()', () => {
        it('должен быть функцией', () => {
            expect(mcp_resolution_1.getAllMCPRegistry).toBeDefined();
            expect(typeof mcp_resolution_1.getAllMCPRegistry).toBe('function');
        });
        it('должен возвращать массив', () => {
            const result = (0, mcp_resolution_1.getAllMCPRegistry)();
            expect(Array.isArray(result)).toBe(true);
        });
        it('должен содержать минимум 20 серверов', () => {
            const result = (0, mcp_resolution_1.getAllMCPRegistry)();
            expect(result.length).toBeGreaterThanOrEqual(20);
        });
    });
    describe('searchByCategory()', () => {
        it('должен быть функцией', () => {
            expect(mcp_resolution_1.searchByCategory).toBeDefined();
            expect(typeof mcp_resolution_1.searchByCategory).toBe('function');
        });
        it('должен искать по категории database', () => {
            const result = (0, mcp_resolution_1.searchByCategory)('database');
            expect(result.length).toBeGreaterThan(0);
        });
        it('должен искать по категории memory', () => {
            const result = (0, mcp_resolution_1.searchByCategory)('memory');
            expect(result.length).toBeGreaterThan(0);
        });
    });
    describe('searchByTag()', () => {
        it('должен быть функцией', () => {
            expect(mcp_resolution_1.searchByTag).toBeDefined();
            expect(typeof mcp_resolution_1.searchByTag).toBe('function');
        });
        it('должен искать по тегу', () => {
            const result = (0, mcp_resolution_1.searchByTag)('база данных');
            expect(Array.isArray(result)).toBe(true);
        });
    });
    describe('getCategories()', () => {
        it('должен быть функцией', () => {
            expect(mcp_resolution_1.getCategories).toBeDefined();
            expect(typeof mcp_resolution_1.getCategories).toBe('function');
        });
        it('должен возвращать объект', () => {
            const result = (0, mcp_resolution_1.getCategories)();
            expect(typeof result).toBe('object');
        });
        it('должен содержать категорию database', () => {
            const result = (0, mcp_resolution_1.getCategories)();
            expect(result.database).toBeDefined();
        });
    });
    describe('mcpResolution default export', () => {
        it('должен экспортировать loadCache', () => {
            expect(mcp_resolution_1.mcpResolution.loadCache).toBeDefined();
        });
        it('должен экспортировать saveCache', () => {
            expect(mcp_resolution_1.mcpResolution.saveCache).toBeDefined();
        });
        it('должен экспортировать detectTechnologies', () => {
            expect(mcp_resolution_1.mcpResolution.detectTechnologies).toBeDefined();
        });
        it('должен экспортировать searchMCPServers', () => {
            expect(mcp_resolution_1.mcpResolution.searchMCPServers).toBeDefined();
        });
        it('должен экспортировать installMCPServer', () => {
            expect(mcp_resolution_1.mcpResolution.installMCPServer).toBeDefined();
        });
        it('должен экспортировать getAllMCPRegistry', () => {
            expect(mcp_resolution_1.mcpResolution.getAllMCPRegistry).toBeDefined();
        });
        it('должен использовать правильные функции', () => {
            const servers = mcp_resolution_1.mcpResolution.searchMCPServers('python');
            expect(servers.length).toBeGreaterThan(0);
        });
    });
});
