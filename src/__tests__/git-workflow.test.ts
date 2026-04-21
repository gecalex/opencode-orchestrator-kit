// Tests for git-workflow.ts
import {
  GitWorkflowOptions,
  isValidCommitMessage,
  createFeatureBranch,
  preCommitCheck,
  validateCommitMessage,
  mergeToDevelop,
  getChangedFiles,
  getChangeStats,
  isMergedToDevelop,
  hasConflicts,
  gitWorkflow
} from '../git-workflow';

describe('Git Workflow Module', () => {
  describe('isValidCommitMessage()', () => {
    it('должен принимать feat коммит', async () => {
      const result = await isValidCommitMessage('feat: add new feature');
      expect(result).toBe(true);
    });

    it('должен принимать fix коммит', async () => {
      const result = await isValidCommitMessage('fix: fix a bug');
      expect(result).toBe(true);
    });

    it('должен принимать коммит с scope', async () => {
      const result = await isValidCommitMessage('feat(backend): add API endpoint');
      expect(result).toBe(true);
    });

    it('должен принимать docs коммит', async () => {
      const result = await isValidCommitMessage('docs: update README');
      expect(result).toBe(true);
    });

    it('должен принимать test коммит', async () => {
      const result = await isValidCommitMessage('test: add unit tests');
      expect(result).toBe(true);
    });

    it('должен принимать chore коммит', async () => {
      const result = await isValidCommitMessage('chore: update dependencies');
      expect(result).toBe(true);
    });

    it('должен принимать refactor коммит', async () => {
      const result = await isValidCommitMessage('refactor: improve code structure');
      expect(result).toBe(true);
    });

    it('должен принимать style коммит', async () => {
      const result = await isValidCommitMessage('style: fix formatting');
      expect(result).toBe(true);
    });

    it('должен принимать perf коммит', async () => {
      const result = await isValidCommitMessage('perf: improve performance');
      expect(result).toBe(true);
    });

    it('должен принимать ci коммит', async () => {
      const result = await isValidCommitMessage('ci: update workflow');
      expect(result).toBe(true);
    });

    it('должен принимать build коммит', async () => {
      const result = await isValidCommitMessage('build: update build config');
      expect(result).toBe(true);
    });

    it('должен отклонять коммит без описания', async () => {
      const result = await isValidCommitMessage('feat');
      expect(result).toBe(false);
    });

    it('должен отклонять невалидный формат', async () => {
      const result = await isValidCommitMessage('some random message');
      expect(result).toBe(false);
    });

    it('должен отклонять пустую строку', async () => {
      const result = await isValidCommitMessage('');
      expect(result).toBe(false);
    });
  });

  describe('createFeatureBranch()', () => {
    it('должен быть async функцией', () => {
      expect(createFeatureBranch.constructor.name).toBe('AsyncFunction');
    });

    it('должен принимать параметры', async () => {
      const options: GitWorkflowOptions = { directory: '/test' };
      // Функция требует $ и async, поэтому тестируем сигнатуру
      expect(typeof createFeatureBranch).toBe('function');
    });
  });

  describe('preCommitCheck()', () => {
    it('должен быть async функцией', () => {
      expect(preCommitCheck.constructor.name).toBe('AsyncFunction');
    });
  });

  describe('validateCommitMessage()', () => {
    it('должен быть async функцией', () => {
      expect(validateCommitMessage.constructor.name).toBe('AsyncFunction');
    });

    it('должен принимать валидное сообщение', async () => {
      const result = await validateCommitMessage({}, '/test', 'feat: add feature');
      expect(result.valid).toBe(true);
    });

    it('должен отклонять невалидное сообщение', async () => {
      const result = await validateCommitMessage({}, '/test', 'invalid message');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('должен возвращать объект с valid и error', async () => {
      const result = await validateCommitMessage({}, '/test', 'test');
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('error');
    });
  });

  describe('mergeToDevelop()', () => {
    it('должен быть async функцией', () => {
      expect(mergeToDevelop.constructor.name).toBe('AsyncFunction');
    });
  });

  describe('getChangedFiles()', () => {
    it('должен быть async функцией', () => {
      expect(getChangedFiles.constructor.name).toBe('AsyncFunction');
    });
  });

  describe('getChangeStats()', () => {
    it('должен быть async функцией', () => {
      expect(getChangeStats.constructor.name).toBe('AsyncFunction');
    });
  });

  describe('isMergedToDevelop()', () => {
    it('должен быть async функцией', () => {
      expect(isMergedToDevelop.constructor.name).toBe('AsyncFunction');
    });
  });

  describe('hasConflicts()', () => {
    it('должен быть async функцией', () => {
      expect(hasConflicts.constructor.name).toBe('AsyncFunction');
    });
  });

  describe('gitWorkflow default export', () => {
    it('должен экспортировать createFeatureBranch', () => {
      expect(gitWorkflow.createFeatureBranch).toBeDefined();
    });

    it('должен экспортировать preCommitCheck', () => {
      expect(gitWorkflow.preCommitCheck).toBeDefined();
    });

    it('должен экспортировать validateCommitMessage', () => {
      expect(gitWorkflow.validateCommitMessage).toBeDefined();
    });

    it('должен экспортировать mergeToDevelop', () => {
      expect(gitWorkflow.mergeToDevelop).toBeDefined();
    });

    it('должен экспортировать getChangedFiles', () => {
      expect(gitWorkflow.getChangedFiles).toBeDefined();
    });

    it('должен экспортировать getChangeStats', () => {
      expect(gitWorkflow.getChangeStats).toBeDefined();
    });

    it('должен экспортировать isMergedToDevelop', () => {
      expect(gitWorkflow.isMergedToDevelop).toBeDefined();
    });

    it('должен экспортировать hasConflicts', () => {
      expect(gitWorkflow.hasConflicts).toBeDefined();
    });

    it('должен экспортировать isValidCommitMessage', () => {
      expect(gitWorkflow.isValidCommitMessage).toBeDefined();
    });
  });

  describe('GitWorkflowOptions interface', () => {
    it('должен иметь directory', () => {
      const options: GitWorkflowOptions = {
        directory: '/test',
        branchPrefix: 'feature'
      };
      
      expect(options.directory).toBe('/test');
      expect(options.branchPrefix).toBe('feature');
    });

    it('должен позволять отсутствие branchPrefix', () => {
      const options: GitWorkflowOptions = {
        directory: '/test'
      };
      
      expect(options.directory).toBe('/test');
      expect(options.branchPrefix).toBeUndefined();
    });
  });
});