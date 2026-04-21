// Tests for git-workflow.ts
import {
  isValidCommitMessage,
  gitWorkflow,
  type GitWorkflowOptions
} from '../git-workflow';

describe('Git Workflow Module', () => {
  describe('Module exports', () => {
    it('должен экспортировать isValidCommitMessage', () => {
      expect(isValidCommitMessage).toBeDefined();
      expect(typeof isValidCommitMessage).toBe('function');
    });

    it('должен экспортировать gitWorkflow объект', () => {
      expect(gitWorkflow).toBeDefined();
      expect(typeof gitWorkflow).toBe('object');
    });

    it('gitWorkflow содержит все функции', () => {
      expect(gitWorkflow.createFeatureBranch).toBeDefined();
      expect(gitWorkflow.preCommitCheck).toBeDefined();
      expect(gitWorkflow.validateCommitMessage).toBeDefined();
      expect(gitWorkflow.mergeToDevelop).toBeDefined();
      expect(gitWorkflow.getChangedFiles).toBeDefined();
      expect(gitWorkflow.getChangeStats).toBeDefined();
      expect(gitWorkflow.isMergedToDevelop).toBeDefined();
      expect(gitWorkflow.hasConflicts).toBeDefined();
      expect(gitWorkflow.isValidCommitMessage).toBeDefined();
    });

    it('gitWorkflow.isValidCommitMessage === isValidCommitMessage', () => {
      expect(gitWorkflow.isValidCommitMessage).toBe(isValidCommitMessage);
    });
  });

  describe('isValidCommitMessage()', () => {
    it('должен быть async функцией', () => {
      expect(isValidCommitMessage.constructor.name).toBe('AsyncFunction');
    });

    it('принимает message строку', async () => {
      await expect(isValidCommitMessage('test')).resolves.toBeDefined();
    });

    it('валидирует feat коммит', async () => {
      const result = await isValidCommitMessage('feat: add new feature');
      expect(result).toBe(true);
    });

    it('валидирует fix коммит', async () => {
      const result = await isValidCommitMessage('fix: fix bug');
      expect(result).toBe(true);
    });

    it('валидирует docs коммит', async () => {
      const result = await isValidCommitMessage('docs: update README');
      expect(result).toBe(true);
    });

    it('валидирует test коммит', async () => {
      const result = await isValidCommitMessage('test: add tests');
      expect(result).toBe(true);
    });

    it('валидирует коммит с scope', async () => {
      const result = await isValidCommitMessage('feat(backend): add API');
      expect(result).toBe(true);
    });

    it('валидирует коммит с несколькими scope', async () => {
      const result = await isValidCommitMessage('fix(frontend,backend): critical fix');
      expect(result).toBe(true);
    });

    it('отклоняет невалидное сообщение', async () => {
      const result = await isValidCommitMessage('invalid message');
      expect(result).toBe(false);
    });

    it('отклоняет пустое сообщение', async () => {
      const result = await isValidCommitMessage('');
      expect(result).toBe(false);
    });

    it('отклоняет сообщение без type', async () => {
      const result = await isValidCommitMessage('add feature');
      expect(result).toBe(false);
    });

    it('отклоняет сообщение без описания', async () => {
      const result = await isValidCommitMessage('feat');
      expect(result).toBe(false);
    });

    it('отклоняет сообщение без двоеточия', async () => {
      const result = await isValidCommitMessage('feat add feature');
      expect(result).toBe(false);
    });

    it('валидирует refactor коммит', async () => {
      const result = await isValidCommitMessage('refactor: improve code');
      expect(result).toBe(true);
    });

    it('валидирует chore коммит', async () => {
      const result = await isValidCommitMessage('chore: update deps');
      expect(result).toBe(true);
    });

    it('валидирует perf коммит', async () => {
      const result = await isValidCommitMessage('perf: optimize performance');
      expect(result).toBe(true);
    });

    it('валидирует ci коммит', async () => {
      const result = await isValidCommitMessage('ci: update pipeline');
      expect(result).toBe(true);
    });

    it('валидирует build коммит', async () => {
      const result = await isValidCommitMessage('build: update build');
      expect(result).toBe(true);
    });

    it('валидирует revert коммит', async () => {
      const result = await isValidCommitMessage('revert: revert commit');
      expect(result).toBe(true);
    });

    it('валидирует style коммит', async () => {
      const result = await isValidCommitMessage('style: format code');
      expect(result).toBe(true);
    });
  });

  describe('GitWorkflowOptions interface', () => {
    it('должен иметь обязательное поле directory', () => {
      const options: GitWorkflowOptions = { directory: '/test' };
      expect(options.directory).toBe('/test');
    });

    it('должен иметь необязательное поле branchPrefix', () => {
      const options: GitWorkflowOptions = { directory: '/test', branchPrefix: 'feature' };
      expect(options.branchPrefix).toBe('feature');
    });

    it('branchPrefix может быть пустым', () => {
      const options: GitWorkflowOptions = { directory: '/test', branchPrefix: '' };
      expect(options.branchPrefix).toBe('');
    });
  });

  describe('Function signatures', () => {
    it('createFeatureBranch является функцией', () => {
      expect(typeof gitWorkflow.createFeatureBranch).toBe('function');
    });

    it('preCommitCheck является функцией', () => {
      expect(typeof gitWorkflow.preCommitCheck).toBe('function');
    });

    it('validateCommitMessage является функцией', () => {
      expect(typeof gitWorkflow.validateCommitMessage).toBe('function');
    });

    it('mergeToDevelop является функцией', () => {
      expect(typeof gitWorkflow.mergeToDevelop).toBe('function');
    });

    it('getChangedFiles является функцией', () => {
      expect(typeof gitWorkflow.getChangedFiles).toBe('function');
    });

    it('getChangeStats является функцией', () => {
      expect(typeof gitWorkflow.getChangeStats).toBe('function');
    });

    it('isMergedToDevelop является функцией', () => {
      expect(typeof gitWorkflow.isMergedToDevelop).toBe('function');
    });

    it('hasConflicts является функцией', () => {
      expect(typeof gitWorkflow.hasConflicts).toBe('function');
    });
  });

  describe('Integration scenarios', () => {
    it('валидное сообщение feat с(scope)', async () => {
      expect(await isValidCommitMessage('feat(auth): add login')).toBe(true);
    });

    it('валидное сообщение fix с несколькими scope', async () => {
      expect(await isValidCommitMessage('fix(api,ui): fix both')).toBe(true);
    });

    it('валидное сообщение с кириллицей', async () => {
      expect(await isValidCommitMessage('feat: добавить функцию')).toBe(true);
    });

    it('валидное сообщение с несколькими словами', async () => {
      expect(await isValidCommitMessage('feat: add new amazing feature')).toBe(true);
    });

    it('валидное сообщение с длинным описанием', async () => {
      expect(await isValidCommitMessage('feat: add very long description about what was added')).toBe(true);
    });

    it('валидное сообщение build с scope', async () => {
      expect(await isValidCommitMessage('build(deps): upgrade dependencies')).toBe(true);
    });

    it('валидное сообщение refactor с scope', async () => {
      expect(await isValidCommitMessage('refactor(auth): simplify login flow')).toBe(true);
    });
  });
});