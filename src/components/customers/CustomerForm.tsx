'use client';

import { useState } from 'react';
import { useFormSubmit } from '@/hooks/useFormSubmit';
import type { CustomerFormData, Customer } from '@/types';

interface CustomerFormProps {
  initialData?: Customer;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

const emptyForm: CustomerFormData = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zip_code: '',
  notes: '',
};

function toFormData(customer?: Customer): CustomerFormData {
  if (!customer) return emptyForm;
  return {
    name: customer.name,
    email: customer.email ?? '',
    phone: customer.phone,
    address: customer.address,
    city: customer.city ?? '',
    state: customer.state ?? '',
    zip_code: customer.zip_code ?? '',
    notes: customer.notes ?? '',
  };
}

export default function CustomerForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
}: CustomerFormProps) {
  const [form, setForm] = useState<CustomerFormData>(toFormData(initialData));
  const { errors, generalError, submitting, handleSubmit, clearFieldError } = useFormSubmit();

  const handleChange = (field: keyof CustomerFormData, value: string) => {
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
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            type="text"
            required
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={inputClass('phone')}
          />
          {fieldError('phone')}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={inputClass('email')}
          />
          {fieldError('email')}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Address <span className="text-red-500">*</span>
          </label>
          <input
            id="address"
            type="text"
            required
            value={form.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className={inputClass('address')}
          />
          {fieldError('address')}
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
          <input id="city" type="text" value={form.city} onChange={(e) => handleChange('city', e.target.value)} className={inputClass('city')} />
          {fieldError('city')}
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
          <input id="state" type="text" value={form.state} onChange={(e) => handleChange('state', e.target.value)} className={inputClass('state')} />
          {fieldError('state')}
        </div>

        <div>
          <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700">Zip Code</label>
          <input id="zip_code" type="text" value={form.zip_code} onChange={(e) => handleChange('zip_code', e.target.value)} className={inputClass('zip_code')} />
          {fieldError('zip_code')}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea id="notes" rows={3} value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} className={inputClass('notes')} />
          {fieldError('notes')}
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
