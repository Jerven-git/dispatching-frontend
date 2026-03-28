'use client';

import { useState } from 'react';
import { useFormSubmit } from '@/hooks/useFormSubmit';
import type { ServiceFormData, Service } from '@/types';

interface ServiceFormProps {
  initialData?: Service;
  onSubmit: (data: ServiceFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

const emptyForm: ServiceFormData = {
  name: '',
  description: '',
  base_price: '',
  estimated_duration_minutes: '',
  is_active: true,
};

function toFormData(service?: Service): ServiceFormData {
  if (!service) return emptyForm;
  return {
    name: service.name,
    description: service.description ?? '',
    base_price: service.base_price,
    estimated_duration_minutes: service.estimated_duration_minutes?.toString() ?? '',
    is_active: service.is_active,
  };
}

export default function ServiceForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
}: ServiceFormProps) {
  const [form, setForm] = useState<ServiceFormData>(toFormData(initialData));
  const { errors, generalError, submitting, handleSubmit, clearFieldError } = useFormSubmit();

  const handleChange = (field: keyof ServiceFormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field);
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

  return (
    <form onSubmit={(e) => handleSubmit(e, () => onSubmit(form))} className="space-y-6">
      {generalError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {generalError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Service Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            required
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g. Aircon General Cleaning"
            className={inputClass('name')}
          />
          {fieldError('name')}
        </div>

        <div>
          <label htmlFor="base_price" className="block text-sm font-medium text-gray-700">
            Base Price
          </label>
          <div className="relative mt-1">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
              $
            </span>
            <input
              id="base_price"
              type="number"
              step="0.01"
              min="0"
              value={form.base_price}
              onChange={(e) => handleChange('base_price', e.target.value)}
              placeholder="0.00"
              className={`pl-7 ${inputClass('base_price')}`}
            />
          </div>
          {fieldError('base_price')}
        </div>

        <div>
          <label htmlFor="estimated_duration_minutes" className="block text-sm font-medium text-gray-700">
            Estimated Duration (minutes)
          </label>
          <input
            id="estimated_duration_minutes"
            type="number"
            min="1"
            value={form.estimated_duration_minutes}
            onChange={(e) => handleChange('estimated_duration_minutes', e.target.value)}
            placeholder="e.g. 60"
            className={inputClass('estimated_duration_minutes')}
          />
          {fieldError('estimated_duration_minutes')}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Brief description of the service..."
            className={inputClass('description')}
          />
          {fieldError('description')}
        </div>

        <div className="sm:col-span-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => handleChange('is_active', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Active</span>
          </label>
          <p className="mt-1 text-xs text-gray-500">
            Inactive services won&apos;t appear when creating jobs.
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
