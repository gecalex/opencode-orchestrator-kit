"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Tests for git-workflow.ts
const git_workflow_1 = require("../git-workflow");
describe('Git Workflow Module', () => {
    describe('Module exports', () => {
        it('должен экспортировать isValidCommitMessage', () => {
            expect(git_workflow_1.isValidCommitMessage).toBeDefined();
            expect(typeof git_workflow_1.isValidCommitMessage).toBe('function');
        });
        it('должен экспортировать gitWorkflow объект', () => {
            expect(git_workflow_1.gitWorkflow).toBeDefined();
            expect(typeof git_workflow_1.gitWorkflow).toBe('object');
        });
        it('gitWorkflow содержит все функции', () => {
            expect(git_workflow_1.gitWorkflow.createFeatureBranch).toBeDefined();
            expect(git_workflow_1.gitWorkflow.preCommitCheck).toBeDefined();
            expect(git_workflow_1.gitWorkflow.validateCommitMessage).toBeDefined();
            expect(git_workflow_1.gitWorkflow.mergeToDevelop).toBeDefined();
            expect(git_workflow_1.gitWorkflow.getChangedFiles).toBeDefined();
            expect(git_workflow_1.gitWorkflow.getChangeStats).toBeDefined();
            expect(git_workflow_1.gitWorkflow.isMergedToDevelop).toBeDefined();
            expect(git_workflow_1.gitWorkflow.hasConflicts).toBeDefined();
            expect(git_workflow_1.gitWorkflow.isValidCommitMessage).toBeDefined();
        });
        it('gitWorkflow.isValidCommitMessage === isValidCommitMessage', () => {
            expect(git_workflow_1.gitWorkflow.isValidCommitMessage).toBe(git_workflow_1.isValidCommitMessage);
        });
    });
    describe('isValidCommitMessage()', () => {
        it('должен быть async функцией', () => {
            expect(git_workflow_1.isValidCommitMessage.constructor.name).toBe('AsyncFunction');
        });
        it('принимает message строку', async () => {
            await expect((0, git_workflow_1.isValidCommitMessage)('test')).resolves.toBeDefined();
        });
        it('валидирует feat коммит', async () => {
            const result = await (0, git_workflow_1.isValidCommitMessage)('feat: add new feature');
            expect(result).toBe(true);
        });
        it('валидирует fix коммит', async () => {
            const result = await (0, git_workflow_1.isValidCommitMessage)('fix: fix bug');
            expect(result).toBe(true);
        });
        it('валидирует docs коммит', async () => {
            const result = await (0, git_workflow_1.isValidCommitMessage)('docs: update README');
            expect(result).toBe(true);
        });
        it('валидирует test коммит', async () => {
            const result = await (0, git_workflow_1.isValidCommitMessage)('test: add tests');
            expect(result).toBe(true);
        });
        it('валидирует коммит с scope', async () => {
            const result = await (0, git_workflow_1.isValidCommitMessage)('feat(backend): add API');
            expect(result).toBe(true);
        });
        it('валидирует коммит с несколькими scope', async () => {
            const result = await (0, git_workflow_1.isValidCommitMessage)('fix(frontend,backend): critical fix');
            expect(result).toBe(true);
        });
        it('отклоняет невалидное сообщение', async () => {
            const result = await (0, git_workflow_1.isValidCommitMessage)('invalid message');
            expect(result).toBe(false);
        });
        it('отклоняет пустое сообщение', async () => {
            const result = await (0, git_workflow_1.isValidCommitMessage)('');
            expect(result).toBe(false);
        });
        it('отклоняет сообщение без type', async () => {
            const result = await (0, git_workflow_1.isValidCommitMessage)('add feature');
            expect(result).toBe(false);
        });
        it('отклоняет сообщение без описания', async () => {
            const result = await (0, git_workflow_1.isValidCommitMessage)('feat');
            expect(result).toBe(false);
        });
        it('отклоняет сообщение без двоеточия', async () => {
            const result = await (0, git_workflow_1.isValidCommitMessage)('feat add feature');
            expect(result).toBe(false);
        });
        it('валидирует refactor коммит', async () => {
            const result = await (0, git_workflow_1.isValidCommitMessage)('refactor: improve code');
            expect(result).toBe(true);
        });
        it('валидирует chore коммит', async () => {
            const result = await (0, git_workflow_1.isValidCommitMessage)('chore: update deps');
            expect(result).toBe(true);
        });
        it('валидирует perf коммит', async () => {
            const result = await (0, git_workflow_1.isValidCommitMessage)('perf: optimize performance');
            expect(result).toBe(true);
        });
        it('валидирует ci коммит', async () => {
            const result = await (0, git_workflow_1.isValidCommitMessage)('ci: update pipeline');
            expect(result).toBe(true);
        });
        it('валидирует build коммит', async () => {
            const result = await (0, git_workflow_1.isValidCommitMessage)('build: update build');
            expect(result).toBe(true);
        });
        it('валидирует revert коммит', async () => {
            const result = await (0, git_workflow_1.isValidCommitMessage)('revert: revert commit');
            expect(result).toBe(true);
        });
        it('валидирует style коммит', async () => {
            const result = await (0, git_workflow_1.isValidCommitMessage)('style: format code');
            expect(result).toBe(true);
        });
    });
    describe('GitWorkflowOptions interface', () => {
        it('должен иметь обязательное поле directory', () => {
            const options = { directory: '/test' };
            expect(options.directory).toBe('/test');
        });
        it('должен иметь необязательное поле branchPrefix', () => {
            const options = { directory: '/test', branchPrefix: 'feature' };
            expect(options.branchPrefix).toBe('feature');
        });
        it('branchPrefix может быть пустым', () => {
            const options = { directory: '/test', branchPrefix: '' };
            expect(options.branchPrefix).toBe('');
        });
    });
    describe('Function signatures', () => {
        it('createFeatureBranch является функцией', () => {
            expect(typeof git_workflow_1.gitWorkflow.createFeatureBranch).toBe('function');
        });
        it('preCommitCheck является функцией', () => {
            expect(typeof git_workflow_1.gitWorkflow.preCommitCheck).toBe('function');
        });
        it('validateCommitMessage является функцией', () => {
            expect(typeof git_workflow_1.gitWorkflow.validateCommitMessage).toBe('function');
        });
        it('mergeToDevelop является функцией', () => {
            expect(typeof git_workflow_1.gitWorkflow.mergeToDevelop).toBe('function');
        });
        it('getChangedFiles является функцией', () => {
            expect(typeof git_workflow_1.gitWorkflow.getChangedFiles).toBe('function');
        });
        it('getChangeStats является функцией', () => {
            expect(typeof git_workflow_1.gitWorkflow.getChangeStats).toBe('function');
        });
        it('isMergedToDevelop является функцией', () => {
            expect(typeof git_workflow_1.gitWorkflow.isMergedToDevelop).toBe('function');
        });
        it('hasConflicts является функцией', () => {
            expect(typeof git_workflow_1.gitWorkflow.hasConflicts).toBe('function');
        });
    });
    describe('Integration scenarios', () => {
        it('валидное сообщение feat с(scope)', async () => {
            expect(await (0, git_workflow_1.isValidCommitMessage)('feat(auth): add login')).toBe(true);
        });
        it('валидное сообщение fix с несколькими scope', async () => {
            expect(await (0, git_workflow_1.isValidCommitMessage)('fix(api,ui): fix both')).toBe(true);
        });
        it('валидное сообщение с кириллицей', async () => {
            expect(await (0, git_workflow_1.isValidCommitMessage)('feat: добавить функцию')).toBe(true);
        });
        it('валидное сообщение с несколькими словами', async () => {
            expect(await (0, git_workflow_1.isValidCommitMessage)('feat: add new amazing feature')).toBe(true);
        });
        it('валидное сообщение с длинным описанием', async () => {
            expect(await (0, git_workflow_1.isValidCommitMessage)('feat: add very long description about what was added')).toBe(true);
        });
        it('валидное сообщение build с scope', async () => {
            expect(await (0, git_workflow_1.isValidCommitMessage)('build(deps): upgrade dependencies')).toBe(true);
        });
        it('валидное сообщение refactor с scope', async () => {
            expect(await (0, git_workflow_1.isValidCommitMessage)('refactor(auth): simplify login flow')).toBe(true);
        });
    });
});
