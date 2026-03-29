'use client';

import { useState } from 'react';
import { useFormSubmit } from '@/hooks/useFormSubmit';
import { FormField, Button, Alert, Textarea } from '@/components/ui';
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

  return (
    <form onSubmit={(e) => handleSubmit(e, () => onSubmit(form))} className="space-y-6">
      {generalError && <Alert variant="error">{generalError}</Alert>}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormField
            name="name"
            type="text"
            label="Service Name"
            required
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors['name']?.[0]}
            placeholder="e.g. Aircon General Cleaning"
          />
        </div>

        <div>
          <label htmlFor="base_price" className="block text-sm font-medium text-gray-700 mb-1.5">
            Base Price
          </label>
          <div className="relative">
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
              className="block w-full pl-7 px-3 py-2 rounded-base border border-gray-300 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            />
          </div>
          {errors['base_price']?.[0] && <p className="mt-1 text-sm text-red-600">{errors['base_price'][0]}</p>}
        </div>

        <FormField
          name="estimated_duration_minutes"
          type="number"
          label="Estimated Duration (minutes)"
          min="1"
          value={form.estimated_duration_minutes}
          onChange={(e) => handleChange('estimated_duration_minutes', e.target.value)}
          error={errors['estimated_duration_minutes']?.[0]}
          placeholder="e.g. 60"
        />

        <div className="sm:col-span-2">
          <Textarea
            id="description"
            label="Description"
            rows={3}
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Brief description of the service..."
            error={errors['description']?.[0]}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => handleChange('is_active', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700">Active</span>
          </label>
          <p className="mt-1 text-xs text-gray-500">
            Inactive services won&apos;t appear when creating jobs.
          </p>
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
