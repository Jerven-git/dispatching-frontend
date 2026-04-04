'use client';

import { useEffect, useState, useCallback } from 'react';
import { api, ApiError } from '@/lib/api';
import {
  Card,
  PageHeader,
  Button,
  Input,
  Badge,
  Dialog,
  Alert,
  Textarea,
} from '@/components/ui';
import type { AppRole, Permission } from '@/types';

interface RoleFormData {
  name: string;
  slug: string;
  description: string;
}

const EMPTY_FORM: RoleFormData = {
  name: '',
  slug: '',
  description: '',
};

export default function RolesPage() {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  // Create / Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AppRole | null>(null);
  const [form, setForm] = useState<RoleFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  // Permission editor
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set());
  const [savingPermissions, setSavingPermissions] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get<{ data: AppRole[] }>('/roles', undefined, { skipCache: true }),
      api.get<{ data: Permission[] }>('/permissions', undefined, { skipCache: true }),
    ])
      .then(([rolesRes, permsRes]) => {
        setRoles(rolesRes.data);
        setPermissions(permsRes.data);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Group permissions by their group field
  const permissionGroups = permissions.reduce<Record<string, Permission[]>>((acc, perm) => {
    const group = perm.group || 'other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(perm);
    return acc;
  }, {});

  const groupOrder = Object.keys(permissionGroups).sort();

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setForm({ ...form, name, slug });
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setDialogOpen(true);
  };

  const openEdit = (role: AppRole) => {
    setEditing(role);
    setForm({
      name: role.name,
      slug: role.slug,
      description: role.description || '',
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setFormErrors({});
    try {
      if (editing) {
        await api.put(`/roles/${editing.id}`, form);
      } else {
        await api.post('/roles', form);
      }
      setDialogOpen(false);
      fetchData();
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.errors).length > 0) {
        setFormErrors(err.errors);
      } else {
        setError(err instanceof ApiError ? err.message : 'Failed to save role');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    setDeleting(id);
    try {
      await api.delete(`/roles/${id}`);
      if (selectedRole?.id === id) {
        setSelectedRole(null);
        setSelectedPermissions(new Set());
      }
      fetchData();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete role');
    } finally {
      setDeleting(null);
    }
  };

  const selectRole = (role: AppRole) => {
    setSelectedRole(role);
    setSelectedPermissions(new Set(role.permissions.map((p) => p.id)));
    setSuccess('');
  };

  const togglePermission = (permId: number) => {
    if (!selectedRole || selectedRole.is_system) return;
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) {
        next.delete(permId);
      } else {
        next.add(permId);
      }
      return next;
    });
  };

  const toggleGroup = (group: string) => {
    if (!selectedRole || selectedRole.is_system) return;
    const groupPerms = permissionGroups[group];
    const allSelected = groupPerms.every((p) => selectedPermissions.has(p.id));
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      groupPerms.forEach((p) => {
        if (allSelected) {
          next.delete(p.id);
        } else {
          next.add(p.id);
        }
      });
      return next;
    });
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    setSavingPermissions(true);
    setError('');
    try {
      await api.put(`/roles/${selectedRole.id}`, {
        name: selectedRole.name,
        slug: selectedRole.slug,
        description: selectedRole.description,
        permissions: Array.from(selectedPermissions),
      });
      setSuccess('Permissions updated successfully.');
      fetchData();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update permissions');
    } finally {
      setSavingPermissions(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        subtitle="Manage roles and assign permissions"
        actions={
          <Button variant="primary" onClick={openCreate}>
            Create Role
          </Button>
        }
      />

      {error && (
        <Alert variant="error" className="mb-4" onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="mb-4" onDismiss={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 rounded-lg bg-gray-200 animate-pulse" />
              ))}
            </div>
          </Card>
          <div className="lg:col-span-2">
            <Card>
              <div className="h-64 rounded-lg bg-gray-200 animate-pulse" />
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Roles List */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Roles</h2>
            <div className="space-y-2">
              {roles.map((role) => (
                <div
                  key={role.id}
                  onClick={() => selectRole(role)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedRole?.id === role.id
                      ? 'bg-indigo-50 border border-indigo-200'
                      : 'bg-gray-50 border border-transparent hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {role.is_system && (
                      <svg
                        className="h-4 w-4 text-gray-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{role.name}</p>
                      <p className="text-xs text-gray-500">
                        {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {role.is_system ? (
                      <Badge variant="neutral">System</Badge>
                    ) : (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(role);
                          }}
                          className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                          title="Edit role"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(role.id);
                          }}
                          disabled={deleting === role.id}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Delete role"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Permission Editor */}
          <div className="lg:col-span-2">
            <Card>
              {selectedRole ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Permissions for {selectedRole.name}
                      </h2>
                      {selectedRole.is_system && (
                        <p className="text-sm text-amber-600 mt-1">
                          System roles are read-only and cannot be modified.
                        </p>
                      )}
                    </div>
                    {!selectedRole.is_system && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSavePermissions}
                        loading={savingPermissions}
                      >
                        Save Permissions
                      </Button>
                    )}
                  </div>

                  <div className="space-y-6">
                    {groupOrder.map((group) => {
                      const groupPerms = permissionGroups[group];
                      const allSelected = groupPerms.every((p) => selectedPermissions.has(p.id));
                      const someSelected =
                        !allSelected && groupPerms.some((p) => selectedPermissions.has(p.id));

                      return (
                        <div key={group}>
                          <div className="flex items-center gap-3 mb-3 pb-2 border-b border-gray-200">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={allSelected}
                                ref={(el) => {
                                  if (el) el.indeterminate = someSelected;
                                }}
                                onChange={() => toggleGroup(group)}
                                disabled={selectedRole.is_system}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                              />
                              <span className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                                {group}
                              </span>
                            </label>
                            <Badge variant="neutral">
                              {groupPerms.filter((p) => selectedPermissions.has(p.id)).length}/{groupPerms.length}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {groupPerms.map((perm) => (
                              <label
                                key={perm.id}
                                className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${
                                  selectedRole.is_system
                                    ? 'opacity-60'
                                    : 'cursor-pointer hover:bg-gray-50'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedPermissions.has(perm.id)}
                                  onChange={() => togglePermission(perm.id)}
                                  disabled={selectedRole.is_system}
                                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                                />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{perm.name}</p>
                                  {perm.description && (
                                    <p className="text-xs text-gray-500">{perm.description}</p>
                                  )}
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <p className="mt-4 text-gray-500">Select a role to manage its permissions</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Create / Edit Role Dialog */}
      <Dialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editing ? 'Edit Role' : 'Create Role'}
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>
              {editing ? 'Update Role' : 'Create Role'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Role Name"
            required
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            error={formErrors.name?.[0]}
            placeholder="e.g. Office Manager"
          />
          <Input
            label="Slug"
            required
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            error={formErrors.slug?.[0]}
            placeholder="office-manager"
            helperText="URL-friendly identifier (auto-generated from name)"
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            error={formErrors.description?.[0]}
            placeholder="What can this role do?"
            rows={3}
          />
        </div>
      </Dialog>
    </div>
  );
}
