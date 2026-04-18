// Принцип минимальных привилегий - матрица разрешений
// Детальная матрица разрешений для каждого типа агента, проверка в хуках

interface Permission {
  tool: string;
  allowed: boolean;
  reason?: string;
}

interface RolePermissions {
  role: string;
  permissions: Permission[];
}

// Матрица разрешений по ролям
const PERMISSIONS_MATRIX: RolePermissions[] = [
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
const permissionAuditLog: Array<{ agent: string; tool: string; allowed: boolean; timestamp: string }> = [];

// Проверка разрешения в хуке
export function checkPermission(
  agentRole: string,
  tool: string
): { allowed: boolean; reason?: string } {
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
function logAudit(agent: string, tool: string, allowed: boolean): void {
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
export function getRolePermissions(role: string): Permission[] {
  const rolePerms = PERMISSIONS_MATRIX.find(r => r.role === role);
  return rolePerms?.permissions ?? [];
}

// Получить все роли
export function getAllRoles(): string[] {
  return PERMISSIONS_MATRIX.map(r => r.role);
}

// Система ролей с наследованием
const ROLE_INHERITANCE: Record<string, string[]> = {
  "python-developer": ["developer"],
  "go-developer": ["developer"],
  "react-developer": ["developer"],
  "python-specialist": ["tester"],
  "go-specialist": ["tester"],
  "ts-specialist": ["tester"]
};

// Проверка с наследованием
export function checkPermissionWithInheritance(
  agentRole: string,
  tool: string
): { allowed: boolean; reason?: string } {
  // Сначала проверяем direct
  let result = checkPermission(agentRole, tool);
  
  if (result.allowed) return result;
  
  // Потом проверяем parent roles
  const parentRoles = ROLE_INHERITANCE[agentRole] || [];
  for (const parent of parentRoles) {
    result = checkPermission(parent, tool);
    if (result.allowed) return result;
  }
  
  return { allowed: false, reason: "Нет разрешения даже в parent roles" };
}

// Получить аудит
export function getPermissionAudit(): Array<{ agent: string; tool: string; allowed: boolean; timestamp: string }> {
  return [...permissionAuditLog];
}

export const permissions = {
  checkPermission,
  checkPermissionWithInheritance,
  getRolePermissions,
  getAllRoles,
  getPermissionAudit
};

export default permissions;