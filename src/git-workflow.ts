// Git Workflow модуль
// Выполнение Git операций: создание веток, pre-commit проверки, merge

export interface GitWorkflowOptions {
  directory: string;
  branchPrefix?: string;
}

// ПроверкаConventional Commits формата
const conventionalCommitsRegex = /^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .+/;

export async function isValidCommitMessage(message: string): Promise<boolean> {
  return conventionalCommitsRegex.test(message);
}

// Создание feature-ветки
export async function createFeatureBranch($: any, options: GitWorkflowOptions, taskName: string): Promise<string> {
  const branchName = `${options.branchPrefix || 'feature'}/${taskName.toLowerCase().replace(/\s+/g, '-')}`;
  
  // Проверяем текущую ветку
  const currentBranch = await $.command`git branch --show-current`.text();
  
  if (currentBranch === 'main' || currentBranch === 'develop') {
    // Создаём новую ветку от develop
    await $.command`cd ${options.directory} && git checkout -b ${branchName} develop`;
  } else {
    // Уже на feature-ветке
    await $.command`cd ${options.directory} && git checkout -b ${branchName}`;
  }
  
  return branchName;
}

// Pre-commit проверки
export async function preCommitCheck($: any, directory: string): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];
  
  // Проверка: есть ли изменения
  const status = await $.command`cd ${directory} && git status --porcelain`.text();
  if (!status.trim()) {
    errors.push("Нет изменений для коммита");
    return { valid: false, errors };
  }
  
  // Проверка: находимся ли мы на feature-ветке
  const branch = await $.command`cd ${directory} && git branch --show-current`.text();
  if (!branch.includes('feature/') && !branch.includes('bugfix/') && !branch.includes('hotfix/')) {
    errors.push("Коммит должен быть из feature/bugfix/hotfix ветки");
  }
  
  return { valid: errors.length === 0, errors };
}

// Валидация сообщения коммита
export async function validateCommitMessage($: any, directory: string, message: string): Promise<{ valid: boolean; error?: string }> {
  if (!conventionalCommitsRegex.test(message)) {
    return {
      valid: false,
      error: `Сообщение коммита не соответствует Conventional Commits. Используйте формат: type(scope): description
Примеры:
- feat(backend): добавить API
- fix(frontend): исправить баг
- docs: обновить README`
    };
  }
  return { valid: true };
}

// Merge в develop
export async function mergeToDevelop($: any, directory: string, branchName: string): Promise<void> {
  // Переключиться на develop
  await $.command`cd ${directory} && git checkout develop`;
  
  // Получить latest
  await $.command`cd ${directory} && git pull origin develop`;
  
  // Merge с no-ff
  await $.command`cd ${directory} && git merge --no-ff ${branchName}`;
  
  // Push
  await $.command`cd ${directory} && git push origin develop`;
  
  // Удалить feature-ветку
  await $.command`cd ${directory} && git branch -d ${branchName}`;
}

// Получение списка изменённых файлов
export async function getChangedFiles($: any, directory: string): Promise<string[]> {
  const result = await $.command`cd ${directory} && git diff --name-only`.text();
  return result.split('\n').filter((f: string) => f.trim());
}

// Получение статистики изменений
export async function getChangeStats($: any, directory: string): Promise<{ files: number; insertions: number; deletions: number }> {
  const stat = await $.command`cd ${directory} && git diff --stat`.text();
  
  // Парсимstat вывод
  const filesMatch = stat.match(/(\d+) file/);
  const insMatch = stat.match(/(\d+) insertion/);
  const delMatch = stat.match(/(\d+) deletion/);
  
  return {
    files: filesMatch ? parseInt(filesMatch[1]) : 0,
    insertions: insMatch ? parseInt(insMatch[1]) : 0,
    deletions: delMatch ? parseInt(delMatch[1]) : 0
  };
}

// Проверка: ветка влита в develop
export async function isMergedToDevelop($: any, directory: string, branchName: string): Promise<boolean> {
  const merged = await $.command`cd ${directory} && git branch --merged develop`.text();
  return merged.includes(branchName);
}

// Проверка: есть ли конфликты
export async function hasConflicts($: any, directory: string): Promise<boolean> {
  const status = await $.command`cd ${directory} && git status --porcelain`.text();
  return status.includes('UU') || status.includes('AA') || status.includes('DD');
}

export const gitWorkflow = {
  createFeatureBranch,
  preCommitCheck,
  validateCommitMessage,
  mergeToDevelop,
  getChangedFiles,
  getChangeStats,
  isMergedToDevelop,
  hasConflicts,
  isValidCommitMessage
};

export default gitWorkflow;