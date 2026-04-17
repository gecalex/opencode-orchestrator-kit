"use strict";
// Git Workflow модуль
// Выполнение Git операций: создание веток, pre-commit проверки, merge
Object.defineProperty(exports, "__esModule", { value: true });
exports.gitWorkflow = void 0;
exports.isValidCommitMessage = isValidCommitMessage;
exports.createFeatureBranch = createFeatureBranch;
exports.preCommitCheck = preCommitCheck;
exports.validateCommitMessage = validateCommitMessage;
exports.mergeToDevelop = mergeToDevelop;
exports.getChangedFiles = getChangedFiles;
exports.getChangeStats = getChangeStats;
exports.isMergedToDevelop = isMergedToDevelop;
exports.hasConflicts = hasConflicts;
// ПроверкаConventional Commits формата
const conventionalCommitsRegex = /^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .+/;
async function isValidCommitMessage(message) {
    return conventionalCommitsRegex.test(message);
}
// Создание feature-ветки
async function createFeatureBranch($, options, taskName) {
    const branchName = `${options.branchPrefix || 'feature'}/${taskName.toLowerCase().replace(/\s+/g, '-')}`;
    // Проверяем текущую ветку
    const currentBranch = await $.command `git branch --show-current`.text();
    if (currentBranch === 'main' || currentBranch === 'develop') {
        // Создаём новую ветку от develop
        await $.command `cd ${options.directory} && git checkout -b ${branchName} develop`;
    }
    else {
        // Уже на feature-ветке
        await $.command `cd ${options.directory} && git checkout -b ${branchName}`;
    }
    return branchName;
}
// Pre-commit проверки
async function preCommitCheck($, directory) {
    const errors = [];
    // Проверка: есть ли изменения
    const status = await $.command `cd ${directory} && git status --porcelain`.text();
    if (!status.trim()) {
        errors.push("Нет изменений для коммита");
        return { valid: false, errors };
    }
    // Проверка: находимся ли мы на feature-ветке
    const branch = await $.command `cd ${directory} && git branch --show-current`.text();
    if (!branch.includes('feature/') && !branch.includes('bugfix/') && !branch.includes('hotfix/')) {
        errors.push("Коммит должен быть из feature/bugfix/hotfix ветки");
    }
    return { valid: errors.length === 0, errors };
}
// Валидация сообщения коммита
async function validateCommitMessage($, directory, message) {
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
async function mergeToDevelop($, directory, branchName) {
    // Переключиться на develop
    await $.command `cd ${directory} && git checkout develop`;
    // Получить latest
    await $.command `cd ${directory} && git pull origin develop`;
    // Merge с no-ff
    await $.command `cd ${directory} && git merge --no-ff ${branchName}`;
    // Push
    await $.command `cd ${directory} && git push origin develop`;
    // Удалить feature-ветку
    await $.command `cd ${directory} && git branch -d ${branchName}`;
}
// Получение списка изменённых файлов
async function getChangedFiles($, directory) {
    const result = await $.command `cd ${directory} && git diff --name-only`.text();
    return result.split('\n').filter((f) => f.trim());
}
// Получение статистики изменений
async function getChangeStats($, directory) {
    const stat = await $.command `cd ${directory} && git diff --stat`.text();
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
async function isMergedToDevelop($, directory, branchName) {
    const merged = await $.command `cd ${directory} && git branch --merged develop`.text();
    return merged.includes(branchName);
}
// Проверка: есть ли конфликты
async function hasConflicts($, directory) {
    const status = await $.command `cd ${directory} && git status --porcelain`.text();
    return status.includes('UU') || status.includes('AA') || status.includes('DD');
}
exports.gitWorkflow = {
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
exports.default = exports.gitWorkflow;
