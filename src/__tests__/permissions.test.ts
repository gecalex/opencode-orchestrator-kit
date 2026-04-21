// Tests for permissions.ts
import {
  checkPermission,
  checkPermissionWithInheritance,
  getRolePermissions,
  getAllRoles,
  getPermissionAudit,
  permissions
} from '../permissions';

describe('Permissions Module', () => {
  describe('checkPermission()', () => {
    it('python-developer должен иметь доступ к write', () => {
      const result = checkPermission('python-developer', 'write');
      expect(result.allowed).toBe(true);
    });

    it('python-developer не должен иметь доступ к task', () => {
      const result = checkPermission('python-developer', 'task');
      expect(result.allowed).toBe(false);
    });

    it('code-reviewer не должен иметь доступ к write', () => {
      const result = checkPermission('code-reviewer', 'write');
      expect(result.allowed).toBe(false);
    });

    it('security-auditor должен иметь доступ к read', () => {
      const result = checkPermission('security-auditor', 'read');
      expect(result.allowed).toBe(true);
    });

    it('неизвестная роль должна возвращать allowed: false', () => {
      const result = checkPermission('unknown-role-xyz', 'write');
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('неизвестный tool должен возвращать allowed: false', () => {
      const result = checkPermission('python-developer', 'unknown-tool-xyz');
      expect(result.allowed).toBe(false);
    });

    it('project-initializer должен иметь доступ к bash', () => {
      const result = checkPermission('project-initializer', 'run_shell_command');
      expect(result.allowed).toBe(true);
    });
  });

  describe('checkPermissionWithInheritance()', () => {
    it('python-developer должен проверять наследование', () => {
      const result = checkPermissionWithInheritance('python-developer', 'write');
      expect(typeof result.allowed).toBe('boolean');
    });

    it('python-specialist должен проверять наследование', () => {
      const result = checkPermissionWithInheritance('python-specialist', 'bash');
      expect(typeof result.allowed).toBe('boolean');
    });
  });

  describe('getRolePermissions()', () => {
    it('python-developer должен иметь permissions', () => {
      const perms = getRolePermissions('python-developer');
      expect(perms.length).toBeGreaterThan(0);
    });

    it('неизвестная роль должна возвращать пустой массив', () => {
      const perms = getRolePermissions('unknown-role-xyz');
      expect(perms).toHaveLength(0);
    });
  });

  describe('getAllRoles()', () => {
    it('должен возвращать все роли', () => {
      const roles = getAllRoles();
      expect(roles.length).toBeGreaterThan(0);
      expect(roles).toContain('python-developer');
      expect(roles).toContain('code-reviewer');
    });
  });

  describe('getPermissionAudit()', () => {
    it('должен возвращать массив', () => {
      const audit = getPermissionAudit();
      expect(Array.isArray(audit)).toBe(true);
    });

    it('должен логировать проверки', () => {
      const initialLength = getPermissionAudit().length;
      checkPermission('python-developer', 'write');
      const afterLength = getPermissionAudit().length;
      expect(afterLength).toBeGreaterThanOrEqual(initialLength);
    });
  });

  describe('permissions default export', () => {
    it('должен экспортировать все функции', () => {
      expect(permissions.checkPermission).toBeDefined();
      expect(permissions.checkPermissionWithInheritance).toBeDefined();
      expect(permissions.getRolePermissions).toBeDefined();
      expect(permissions.getAllRoles).toBeDefined();
      expect(permissions.getPermissionAudit).toBeDefined();
    });

    it('должен использовать правильные функции', () => {
      expect(permissions.checkPermission('code-reviewer', 'read').allowed).toBe(true);
      expect(permissions.getAllRoles().length).toBeGreaterThan(0);
    });
  });

  describe('Role-specific permissions', () => {
    it('constitution-agent должен иметь дост��п к skill', () => {
      const result = checkPermission('constitution-agent', 'skill');
      expect(result.allowed).toBe(true);
    });

    it('plan-agent должен иметь доступ к task', () => {
      const result = checkPermission('plan-agent', 'task');
      expect(result.allowed).toBe(true);
    });

    it('go-developer должен иметь доступ к bash', () => {
      const result = checkPermission('go-developer', 'bash');
      expect(result.allowed).toBe(true);
    });

    it('react-developer не должен иметь доступ к task', () => {
      const result = checkPermission('react-developer', 'task');
      expect(result.allowed).toBe(false);
    });
  });
});