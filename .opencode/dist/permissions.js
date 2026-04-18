"use strict";
// Принцип минимальных привилегий - матрица разрешений
// Детальная матрица разрешений для каждого типа агента, проверка в хуках
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissions = void 0;
exports.checkPermission = checkPermission;
exports.getRolePermissions = getRolePermissions;
exports.getAllRoles = getAllRoles;
exports.checkPermissionWithInheritance = checkPermissionWithInheritance;
exports.getPermissionAudit = getPermissionAudit;
// Матрица разрешений по ролям
const PERMISSIONS_MATRIX = [
    {
        role: "project-initializer",
        permissions: [
            { tool: "run_shell_command", allowed: true },
            { tool: "read_file", allowed: true },
            { tool: "write_file", allowed: true },
            { tool: "glob", allowed: true },
            { tool: "grep_search", allowed: true }
        ]
    },
    {
        role: "constitution-agent",
        permissions: [
            { tool: "run_shell_command", allowed: true },
            { tool: "read_file", allowed: true },
            { tool: "write_file", allowed: true },
            { tool: "glob", allowed: true },
            { tool: "grep_search", allowed: true },
            { tool: "edit", allowed: true },
            { tool: "skill", allowed: true }
        ]
    },
    {
        role: "specify-agent",
        permissions: [
            { tool: "read_file", allowed: true },
            { tool: "write_file", allowed: true },
            { tool: "glob", allowed: true },
            { tool: "grep_search", allowed: true }
        ]
    },
    {
        role: "plan-agent",
        permissions: [
            { tool: "read_file", allowed: true },
            { tool: "write_file", allowed: true },
            { tool: "glob", allowed: true },
            { tool: "grep_search", allowed: true },
            { tool: "task", allowed: true }
        ]
    },
    {
        role: "python-developer",
        permissions: [
            { tool: "write", allowed: true },
            { tool: "edit", allowed: true },
            { tool: "bash", allowed: true, reason: "Только для тестов и сборки" },
            { tool: "read", allowed: true },
            { tool: "glob", allowed: true },
            { tool: "grep", allowed: true },
            { tool: "skill", allowed: true },
            { tool: "todowrite", allowed: true },
            { tool: "task", allowed: false }
        ]
    },
    {
        role: "go-developer",
        permissions: [
            { tool: "write", allowed: true },
            { tool: "edit", allowed: true },
            { tool: "bash", allowed: true, reason: "Только для go test/build" },
            { tool: "read", allowed: true },
            { tool: "glob", allowed: true },
            { tool: "grep", allowed: true },
            { tool: "skill", allowed: true },
            { tool: "todowrite", allowed: true },
            { tool: "task", allowed: false }
        ]
    },
    {
        role: "react-developer",
        permissions: [
            { tool: "write", allowed: true },
            { tool: "edit", allowed: true },
            { tool: "bash", allowed: true, reason: "Только для npm test/build" },
            { tool: "read", allowed: true },
            { tool: "glob", allowed: true },
            { tool: "grep", allowed: true },
            { tool: "skill", allowed: true },
            { tool: "todowrite", allowed: true },
            { tool: "task", allowed: false }
        ]
    },
    {
        role: "python-specialist",
        permissions: [
            { tool: "write", allowed: true, reason: "Тесты" },
            { tool: "edit", allowed: true },
            { tool: "bash", allowed: true, reason: "pytest" },
            { tool: "read", allowed: true },
            { tool: "glob", allowed: true },
            { tool: "grep", allowed: true },
            { tool: "task", allowed: false }
        ]
    },
    {
        role: "code-reviewer",
        permissions: [
            { tool: "read", allowed: true },
            { tool: "glob", allowed: true },
            { tool: "grep", allowed: true },
            { tool: "bash", allowed: true, reason: "Линтеры" },
            { tool: "write", allowed: false },
            { tool: "edit", allowed: false }
        ]
    },
    {
        role: "security-auditor",
        permissions: [
            { tool: "read", allowed: true },
            { tool: "glob", allowed: true },
            { tool: "grep", allowed: true },
            { tool: "bash", allowed: true, reason: "Security scans" },
            { tool: "write", allowed: false },
            { tool: "edit", allowed: false }
        ]
    }
];
// Журнал использования разрешений
const permissionAuditLog = [];
// Проверка разрешения в хуке
function checkPermission(agentRole, tool) {
    const rolePerms = PERMISSIONS_MATRIX.find(r => r.role === agentRole);
    if (!rolePerms) {
        logAudit(agentRole, tool, false);
        return { allowed: false, reason: "Роль не найдена" };
    }
    const perm = rolePerms.permissions.find(p => p.tool === tool);
    if (!perm) {
        logAudit(agentRole, tool, false);
        return { allowed: false, reason: "Инструмент не указан в разрешениях" };
    }
    logAudit(agentRole, tool, perm.allowed);
    return { allowed: perm.allowed, reason: perm.reason };
}
// Логирование в аудит
function logAudit(agent, tool, allowed) {
    permissionAuditLog.push({
        agent,
        tool,
        allowed,
        timestamp: new Date().toISOString()
    });
    // Ограничиваем 1000 записей
    if (permissionAuditLog.length > 1000) {
        permissionAuditLog.shift();
    }
}
// Получить разрешения для роли
function getRolePermissions(role) {
    const rolePerms = PERMISSIONS_MATRIX.find(r => r.role === role);
    return rolePerms?.permissions ?? [];
}
// Получить все роли
function getAllRoles() {
    return PERMISSIONS_MATRIX.map(r => r.role);
}
// Система ролей с наследованием
const ROLE_INHERITANCE = {
    "python-developer": ["developer"],
    "go-developer": ["developer"],
    "react-developer": ["developer"],
    "python-specialist": ["tester"],
    "go-specialist": ["tester"],
    "ts-specialist": ["tester"]
};
// Проверка с наследованием
function checkPermissionWithInheritance(agentRole, tool) {
    // Сначала проверяем direct
    let result = checkPermission(agentRole, tool);
    if (result.allowed)
        return result;
    // Потом проверяем parent roles
    const parentRoles = ROLE_INHERITANCE[agentRole] || [];
    for (const parent of parentRoles) {
        result = checkPermission(parent, tool);
        if (result.allowed)
            return result;
    }
    return { allowed: false, reason: "Нет разрешения даже в parent roles" };
}
// Получить аудит
function getPermissionAudit() {
    return [...permissionAuditLog];
}
exports.permissions = {
    checkPermission,
    checkPermissionWithInheritance,
    getRolePermissions,
    getAllRoles,
    getPermissionAudit
};
exports.default = exports.permissions;
