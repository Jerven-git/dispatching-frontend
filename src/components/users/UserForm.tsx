'use client';

import { useState } from 'react';
import { useFormSubmit } from '@/hooks/useFormSubmit';
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

  const fieldError = (field: string) =>
    errors[field]?.[0] ? (
      <p className="mt-1 text-sm text-red-600">{errors[field][0]}</p>
    ) : null;

  const inputClass = (field: string) =>
    `mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 ${
      errors[field]
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
    }`;

  const roles: { value: Role; label: string }[] = [
    { value: 'admin', label: 'Administrator' },
    { value: 'dispatcher', label: 'Dispatcher' },
    { value: 'technician', label: 'Technician' },
  ];

  return (
    <form onSubmit={(e) => handleSubmit(e, handleFormSubmit)} className="space-y-6">
      {generalError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {generalError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            required
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={inputClass('name')}
          />
          {fieldError('name')}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={inputClass('email')}
          />
          {fieldError('email')}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone
          </label>
          <input
            id="phone"
            type="text"
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={inputClass('phone')}
          />
          {fieldError('phone')}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password {!isEditing && <span className="text-red-500">*</span>}
          </label>
          <input
            id="password"
            type="password"
            required={!isEditing}
            value={form.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder={isEditing ? 'Leave blank to keep current' : ''}
            className={inputClass('password')}
          />
          {fieldError('password')}
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Role <span className="text-red-500">*</span>
          </label>
          <select
            id="role"
            value={form.role}
            onChange={(e) => handleChange('role', e.target.value)}
            className={inputClass('role')}
          >
            {roles.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          {fieldError('role')}
        </div>

        <div className="flex items-center pt-6">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => handleChange('is_active', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Active
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
