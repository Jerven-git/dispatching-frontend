'use client';

import { useState } from 'react';
import { useFormSubmit } from '@/hooks/useFormSubmit';
import { FormField, Button, Alert, Textarea } from '@/components/ui';
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

  return (
    <form onSubmit={(e) => handleSubmit(e, () => onSubmit(form))} className="space-y-6">
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
          name="phone"
          type="text"
          label="Phone"
          required
          value={form.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          error={errors['phone']?.[0]}
        />

        <div className="sm:col-span-2">
          <FormField
            name="email"
            type="email"
            label="Email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={errors['email']?.[0]}
          />
        </div>

        <div className="sm:col-span-2">
          <FormField
            name="address"
            type="text"
            label="Address"
            required
            value={form.address}
            onChange={(e) => handleChange('address', e.target.value)}
            error={errors['address']?.[0]}
          />
        </div>

        <FormField
          name="city"
          type="text"
          label="City"
          value={form.city}
          onChange={(e) => handleChange('city', e.target.value)}
          error={errors['city']?.[0]}
        />

        <FormField
          name="state"
          type="text"
          label="State"
          value={form.state}
          onChange={(e) => handleChange('state', e.target.value)}
          error={errors['state']?.[0]}
        />

        <FormField
          name="zip_code"
          type="text"
          label="Zip Code"
          value={form.zip_code}
          onChange={(e) => handleChange('zip_code', e.target.value)}
          error={errors['zip_code']?.[0]}
        />

        <div className="sm:col-span-2">
          <Textarea
            id="notes"
            label="Notes"
            rows={3}
            value={form.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            error={errors['notes']?.[0]}
          />
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
