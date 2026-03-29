'use client';

import { useState } from 'react';
import { useFormSubmit } from '@/hooks/useFormSubmit';
import { FormField, Button, Alert, Select } from '@/components/ui';
import type { UserFormData, User, Role } from '@/types';

interface UserFormProps {
  initialData?: User;
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

const emptyForm: UserFormData = {
  name: '',
  email: '',
  phone: '',
  password: '',
  role: 'technician',
  is_active: true,
};

function toFormData(user?: User): UserFormData {
  if (!user) return emptyForm;
  return {
    name: user.name,
    email: user.email,
    phone: user.phone ?? '',
    password: '',
    role: user.role,
    is_active: user.is_active,
  };
}

export default function UserForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
}: UserFormProps) {
  const [form, setForm] = useState<UserFormData>(toFormData(initialData));
  const { errors, generalError, submitting, handleSubmit, clearFieldError } = useFormSubmit();
  const isEditing = !!initialData;

  const handleChange = (field: keyof UserFormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field);
  };

  const handleFormSubmit = async () => {
    const data = { ...form };
    // Don't send empty password on edit
    if (isEditing && !data.password) {
      const { password, ...rest } = data;
      await onSubmit(rest as UserFormData);
    } else {
      await onSubmit(data);
    }
  };

  const roles = [
    { value: 'admin', label: 'Administrator' },
    { value: 'dispatcher', label: 'Dispatcher' },
    { value: 'technician', label: 'Technician' },
  ];

  return (
    <form onSubmit={(e) => handleSubmit(e, handleFormSubmit)} className="space-y-6">
      {generalError && <Alert variant="error">{generalError}</Alert>}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <FormField
          name="name"
          type="text"
          label="Name"
          required
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors['name']?.[0]}
        />

        <FormField
          name="email"
          type="email"
          label="Email"
          required
          value={form.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors['email']?.[0]}
        />

        <FormField
          name="phone"
          type="text"
          label="Phone"
          value={form.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          error={errors['phone']?.[0]}
        />

        <FormField
          name="password"
          type="password"
          label={`Password ${!isEditing ? '*' : ''}`}
          required={!isEditing}
          value={form.password}
          onChange={(e) => handleChange('password', e.target.value)}
          helperText={isEditing ? 'Leave blank to keep current password' : undefined}
          error={errors['password']?.[0]}
        />

        <Select
          name="role"
          label="Role"
          required
          options={roles}
          value={form.role}
          onChange={(e) => handleChange('role', e.target.value)}
          error={errors['role']?.[0]}
        />

        <div className="flex items-center pt-6">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => handleChange('is_active', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            Active
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
