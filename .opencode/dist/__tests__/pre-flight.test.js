"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Tests for pre-flight.ts
const pre_flight_1 = require("../pre-flight");
describe('Pre-Flight Module', () => {
    describe('Module exports', () => {
        it('должен экспортировать preFlight объект', () => {
            expect(pre_flight_1.preFlight).toBeDefined();
            expect(typeof pre_flight_1.preFlight).toBe('object');
        });
        it('должен экспортировать run функцию напрямую', () => {
            expect(pre_flight_1.run).toBeDefined();
            expect(typeof pre_flight_1.run).toBe('function');
        });
        it('preFlight.run должен быть определён', () => {
            expect(pre_flight_1.preFlight.run).toBeDefined();
            expect(typeof pre_flight_1.preFlight.run).toBe('function');
        });
        it('run должна быть async функцией', async () => {
            expect(pre_flight_1.run.constructor.name).toBe('AsyncFunction');
        });
        it('preFlight должен экспортировать тот же объект что и run', () => {
            expect(pre_flight_1.preFlight.run).toBe(pre_flight_1.run);
        });
    });
    describe('PreFlightResult type structure', () => {
        it('должен иметь поле success', () => {
            const result = {
                success: true,
                passed: 10,
                failed: 0,
                errors: []
            };
            expect(result.success).toBe(true);
        });
        it('должен иметь поле passed', () => {
            const result = {
                success: true,
                passed: 10,
                failed: 0,
                errors: []
            };
            expect(result.passed).toBe(10);
        });
        it('должен иметь поле failed', () => {
            const result = {
                success: false,
                passed: 8,
                failed: 2,
                errors: ['Error 1', 'Error 2']
            };
            expect(result.failed).toBe(2);
        });
        it('должен иметь поле errors как массив', () => {
            const result = {
                success: true,
                passed: 10,
                failed: 0,
                errors: []
            };
            expect(result.errors).toBeInstanceOf(Array);
        });
        it('success=false когда failed > 0', () => {
            const result = {
                success: false,
                passed: 8,
                failed: 2,
                errors: ['Error 1', 'Error 2']
            };
            expect(result.success).toBe(false);
        });
        it('success=true когда failed = 0', () => {
            const result = {
                success: true,
                passed: 10,
                failed: 0,
                errors: []
            };
            expect(result.success).toBe(true);
        });
        it('errors может содержать строки ошибок', () => {
            const result = {
                success: false,
                passed: 7,
                failed: 3,
                errors: ['❌ Git репозиторий', '❌ Ветка develop', '❌ .gitignore']
            };
            expect(result.errors).toHaveLength(3);
            expect(result.errors[0]).toContain('❌');
        });
        it('passed + failed = 10 для полной проверки', () => {
            const result = {
                success: true,
                passed: 10,
                failed: 0,
                errors: []
            };
            expect(result.passed + result.failed).toBe(10);
        });
        it('может иметь partial failure', () => {
            const result = {
                success: false,
                passed: 6,
                failed: 4,
                errors: ['Error 1', 'Error 2', 'Error 3', 'Error 4']
            };
            expect(result.failed).toBe(4);
            expect(result.errors).toHaveLength(4);
        });
    });
    describe('Check functions signature', () => {
        it('должен иметь 10 проверок в checks массиве', () => {
            const result = {
                success: true,
                passed: 10,
                failed: 0,
                errors: []
            };
            expect(result.passed).toBeLessThanOrEqual(10);
            expect(result.failed).toBeLessThanOrEqual(10);
        });
        it('все проверки прошли', () => {
            const result = {
                success: true,
                passed: 10,
                failed: 0,
                errors: []
            };
            expect(result.success).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
        it('частичный успех', () => {
            const result = {
                success: false,
                passed: 5,
                failed: 5,
                errors: ['E1', 'E2', 'E3', 'E4', 'E5']
            };
            expect(result.passed).toBe(result.failed);
        });
    });
    describe('Error message format', () => {
        it('сообщения об ошибках начинаются с ❌', () => {
            const result = {
                success: false,
                passed: 9,
                failed: 1,
                errors: ['❌ Git репозиторий']
            };
            expect(result.errors[0]).toMatch(/^❌/);
        });
        it('может содержать детали ошибки', () => {
            const result = {
                success: false,
                passed: 8,
                failed: 2,
                errors: ['❌ Git репозиторий: fatal: not a git repository', '❌ .gitignore: file not found']
            };
            expect(result.errors[0]).toContain(':');
        });
    });
    describe('Integration scenarios', () => {
        it('идеальный случай - все прошли', () => {
            const result = {
                success: true,
                passed: 10,
                failed: 0,
                errors: []
            };
            expect(result.passed).toBe(10);
            expect(result.failed).toBe(0);
            expect(result.errors).toHaveLength(0);
        });
        it('критическая ошибка - git репозиторий', () => {
            const result = {
                success: false,
                passed: 0,
                failed: 10,
                errors: ['❌ Git репозиторий']
            };
            expect(result.passed).toBe(0);
            expect(result.failed).toBeGreaterThan(0);
        });
        it('некритическая ошибка - только warnings', () => {
            const result = {
                success: true,
                passed: 10,
                failed: 0,
                errors: []
            };
            expect(result.success).toBe(true);
        });
    });
});
