"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Tests for review-sessions.ts
const review_sessions_1 = require("../review-sessions");
describe('Review Sessions Module', () => {
    describe('createReviewSession()', () => {
        it('должен создавать сессию рецензирования', () => {
            const session = (0, review_sessions_1.createReviewSession)('src/index.ts', 'code');
            expect(session.id).toBeDefined();
            expect(session.artifact).toBe('src/index.ts');
            expect(session.type).toBe('code');
            expect(session.criteria).toBeDefined();
            expect(session.createdAt).toBeDefined();
        });
        it('должен создавать уникальные id', () => {
            const session1 = (0, review_sessions_1.createReviewSession)('file1.ts', 'code');
            const session2 = (0, review_sessions_1.createReviewSession)('file2.ts', 'code');
            expect(session1.id).not.toBe(session2.id);
        });
        it('должен использовать правильные критерии для code', () => {
            const session = (0, review_sessions_1.createReviewSession)('file.ts', 'code');
            expect(session.criteria.length).toBeGreaterThan(0);
            expect(session.criteria.some(c => c.name === 'syntax')).toBe(true);
            expect(session.criteria.some(c => c.name === 'tests')).toBe(true);
        });
        it('должен использовать правильные критерии для spec', () => {
            const session = (0, review_sessions_1.createReviewSession)('SPEC.md', 'spec');
            expect(session.criteria.some(c => c.name === 'completeness')).toBe(true);
            expect(session.criteria.some(c => c.name === 'consistency')).toBe(true);
        });
        it('должен использовать правильные критерии для task', () => {
            const session = (0, review_sessions_1.createReviewSession)('task.md', 'task');
            expect(session.criteria.some(c => c.name === 'description')).toBe(true);
            expect(session.criteria.some(c => c.name === 'acceptance')).toBe(true);
        });
        it('должен использовать правильные критерии для docs', () => {
            const session = (0, review_sessions_1.createReviewSession)('README.md', 'docs');
            expect(session.criteria.some(c => c.name === 'clarity')).toBe(true);
            expect(session.criteria.some(c => c.name === 'accuracy')).toBe(true);
        });
        it('должен возвращать пустой массив для неизвестного типа', () => {
            const session = (0, review_sessions_1.createReviewSession)('file.txt', 'unknown');
            expect(session.criteria).toHaveLength(0);
        });
    });
    describe('evaluateCriteria()', () => {
        it('должен одобрять когда все required критерии выполнены', () => {
            const session = (0, review_sessions_1.createReviewSession)('file.ts', 'code');
            const results = {
                syntax: true,
                tests: true,
                security: true
            };
            const result = (0, review_sessions_1.evaluateCriteria)(session, results);
            expect(result.approved).toBe(true);
            expect(result.feedback).toContain('одобрен');
        });
        it('должен отклонять когда required критерий не выполнен', () => {
            const session = (0, review_sessions_1.createReviewSession)('file.ts', 'code');
            const results = {
                syntax: true,
                tests: false,
                security: true
            };
            const result = (0, review_sessions_1.evaluateCriteria)(session, results);
            expect(result.approved).toBe(false);
            expect(result.feedback).toContain('требует доработки');
        });
        it('должен добавлять issue для каждого проваленного required критерия', () => {
            const session = (0, review_sessions_1.createReviewSession)('file.ts', 'code');
            const results = {
                syntax: false,
                tests: false,
                security: true
            };
            const result = (0, review_sessions_1.evaluateCriteria)(session, results);
            expect(result.issues.length).toBeGreaterThan(0);
        });
        it('должен включать reviewedAt', () => {
            const session = (0, review_sessions_1.createReviewSession)('file.ts', 'code');
            const results = { syntax: true, tests: true, security: true };
            const result = (0, review_sessions_1.evaluateCriteria)(session, results);
            expect(result.reviewedAt).toBeDefined();
        });
        it('должен игнорировать optional критерии', () => {
            const session = (0, review_sessions_1.createReviewSession)('file.ts', 'code');
            const results = {
                syntax: true,
                tests: true,
                security: true,
                coverage: false,
                docs: false
            };
            const result = (0, review_sessions_1.evaluateCriteria)(session, results);
            expect(result.approved).toBe(true);
        });
    });
    describe('getCriteriaForType()', () => {
        it('должен возвращать критерии для code', () => {
            const criteria = (0, review_sessions_1.getCriteriaForType)('code');
            expect(criteria.length).toBeGreaterThan(0);
            expect(criteria.some(c => c.required)).toBe(true);
        });
        it('должен возвращать критерии для spec', () => {
            const criteria = (0, review_sessions_1.getCriteriaForType)('spec');
            expect(criteria.length).toBeGreaterThan(0);
        });
        it('должен возвращать критерии для task', () => {
            const criteria = (0, review_sessions_1.getCriteriaForType)('task');
            expect(criteria.length).toBeGreaterThan(0);
        });
        it('должен возвращать критерии для docs', () => {
            const criteria = (0, review_sessions_1.getCriteriaForType)('docs');
            expect(criteria.length).toBeGreaterThan(0);
        });
        it('должен возвращать пустой массив для неизвестного типа', () => {
            const criteria = (0, review_sessions_1.getCriteriaForType)('unknown');
            expect(criteria).toHaveLength(0);
        });
    });
    describe('reviewSessions default export', () => {
        it('должен экспортировать createReviewSession', () => {
            expect(review_sessions_1.reviewSessions.createReviewSession).toBeDefined();
        });
        it('должен экспортировать evaluateCriteria', () => {
            expect(review_sessions_1.reviewSessions.evaluateCriteria).toBeDefined();
        });
        it('должен экспортировать getCriteriaForType', () => {
            expect(review_sessions_1.reviewSessions.getCriteriaForType).toBeDefined();
        });
        it('должен использовать правильные функции', () => {
            const session = review_sessions_1.reviewSessions.createReviewSession('test.ts', 'code');
            expect(session.artifact).toBe('test.ts');
        });
    });
    describe('ReviewSession interface', () => {
        it('должен иметь все необходимые поля', () => {
            const session = {
                id: 'test-id',
                artifact: 'file.ts',
                type: 'code',
                criteria: [],
                createdAt: '2024-01-01'
            };
            expect(session.id).toBeDefined();
            expect(session.artifact).toBeDefined();
            expect(session.type).toBeDefined();
            expect(session.criteria).toBeDefined();
            expect(session.createdAt).toBeDefined();
        });
    });
    describe('AcceptanceCriteria interface', () => {
        it('должен иметь все необходимые поля', () => {
            const criteria = {
                name: 'test',
                description: 'Test criteria',
                required: true
            };
            expect(criteria.name).toBeDefined();
            expect(criteria.description).toBeDefined();
            expect(typeof criteria.required).toBe('boolean');
        });
    });
    describe('ReviewResult interface', () => {
        it('должен иметь все необходимые поля', () => {
            const result = {
                approved: true,
                feedback: 'Approved',
                issues: [],
                reviewedAt: '2024-01-01'
            };
            expect(typeof result.approved).toBe('boolean');
            expect(result.feedback).toBeDefined();
            expect(Array.isArray(result.issues)).toBe(true);
            expect(result.reviewedAt).toBeDefined();
        });
    });
});
