"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// Tests for index.ts (OrchestratorKit plugin entry point)
const index = __importStar(require("../index"));
describe('OrchestratorKit Plugin Entry Point', () => {
    describe('Module exports', () => {
        it('OrchestratorKit экспортирован', () => {
            expect(index.OrchestratorKit).toBeDefined();
        });
        it('default экспортирован', () => {
            expect(index.default).toBeDefined();
        });
        it('default === OrchestratorKit', () => {
            expect(index.default).toBe(index.OrchestratorKit);
        });
    });
    describe('OrchestratorKit function type', () => {
        it('является функцией', () => {
            expect(typeof index.OrchestratorKit).toBe('function');
        });
        it('имеет длину 1', () => {
            expect(index.OrchestratorKit.length).toBeGreaterThanOrEqual(1);
        });
        it('имя определено', () => {
            expect(index.OrchestratorKit.name).toBeDefined();
            expect(index.OrchestratorKit.name.length).toBeGreaterThan(0);
        });
    });
});
