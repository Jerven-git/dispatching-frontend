'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useFormSubmit } from '@/hooks/useFormSubmit';
import { JOB_PRIORITIES, priorityLabels } from '@/lib/job-constants';
import { FormField, Button, Alert, Select, Textarea } from '@/components/ui';
import type {
  ServiceJobFormData,
  ServiceJob,
  Customer,
  Service,
  User,
  PaginatedResponse,
} from '@/types';

interface JobFormProps {
  initialData?: ServiceJob;
  onSubmit: (data: ServiceJobFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

const emptyForm: ServiceJobFormData = {
  customer_id: '',
  service_id: '',
  technician_id: '',
  priority: 'medium',
  description: '',
  address: '',
  scheduled_date: '',
  scheduled_time: '',
  total_cost: '',
};

function toFormData(job?: ServiceJob): ServiceJobFormData {
  if (!job) return emptyForm;
  return {
    customer_id: String(job.customer?.id ?? ''),
    service_id: String(job.service?.id ?? ''),
    technician_id: job.technician ? String(job.technician.id) : '',
    priority: job.priority,
    description: job.description ?? '',
    address: job.address,
    scheduled_date: job.scheduled_date,
    scheduled_time: job.scheduled_time ?? '',
    total_cost: job.total_cost ?? '',
  };
}

export default function JobForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
}: JobFormProps) {
  const [form, setForm] = useState<ServiceJobFormData>(toFormData(initialData));
  const { errors, generalError, submitting, handleSubmit, clearFieldError } = useFormSubmit();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<PaginatedResponse<Customer>>('/customers', { per_page: '100' }),
      api.get<PaginatedResponse<Service>>('/services', { active_only: '1' }).catch(() => ({ data: [] })),
      api.get<{ users: User[] }>('/users/technicians').catch(() => ({ users: [] })),
    ])
      .then(([customerData, serviceData, techData]) => {
        setCustomers(customerData.data ?? []);
        setServices(serviceData.data ?? []);
        setTechnicians(techData.users ?? []);
      })
      .catch(console.error)
      .finally(() => setLoadingOptions(false));
  }, []);

  // Auto-fill address from selected customer
  const handleCustomerChange = (customerId: string) => {
    setForm((prev) => {
      const customer = customers.find((c) => String(c.id) === customerId);
      return {
        ...prev,
        customer_id: customerId,
        address: customer && !prev.address ? customer.address : prev.address,
      };
    });
  };

  // Auto-fill cost from selected service
  const handleServiceChange = (serviceId: string) => {
    setForm((prev) => {
      const service = services.find((s) => String(s.id) === serviceId);
      return {
        ...prev,
        service_id: serviceId,
        total_cost:
          service && !prev.total_cost ? service.base_price : prev.total_cost,
      };
    });
  };

  const handleChange = (field: keyof ServiceJobFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field);
  };

  if (loadingOptions) {
    return (
      <div className="animate-pulse space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 rounded bg-gray-200" />
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={(e) => handleSubmit(e, () => onSubmit(form))} className="space-y-6">
      {generalError && <Alert variant="error">{generalError}</Alert>}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Customer */}
        <Select
          name="customer_id"
          label="Customer"
          required
          value={form.customer_id}
          onChange={(e) => handleCustomerChange(e.target.value)}
          error={errors['customer_id']?.[0]}
          options={customers.map((c) => ({
            value: c.id,
            label: `${c.name} - ${c.phone}`,
          }))}
          placeholder="Select a customer"
        />

        {/* Service */}
        <Select
          name="service_id"
          label="Service"
          required
          value={form.service_id}
          onChange={(e) => handleServiceChange(e.target.value)}
          error={errors['service_id']?.[0]}
          options={services.map((s) => ({
            value: s.id,
            label: `${s.name} - $${parseFloat(s.base_price).toFixed(2)}`,
          }))}
          placeholder="Select a service"
        />

        {/* Technician (optional) */}
        <Select
          name="technician_id"
          label="Assign Technician"
          value={form.technician_id}
          onChange={(e) => handleChange('technician_id', e.target.value)}
          error={errors['technician_id']?.[0]}
          options={technicians.map((t) => ({
            value: t.id,
            label: t.name,
          }))}
          placeholder="Unassigned"
        />

        {/* Priority */}
        <Select
          name="priority"
          label="Priority"
          value={form.priority}
          onChange={(e) => handleChange('priority', e.target.value)}
          error={errors['priority']?.[0]}
          options={JOB_PRIORITIES.map((p) => ({
            value: p,
            label: priorityLabels[p],
          }))}
        />

        {/* Scheduled Date */}
        <FormField
          name="scheduled_date"
          type="date"
          label="Scheduled Date"
          required
          value={form.scheduled_date}
          onChange={(e) => handleChange('scheduled_date', e.target.value)}
          error={errors['scheduled_date']?.[0]}
        />

        {/* Scheduled Time */}
        <FormField
          name="scheduled_time"
          type="time"
          label="Scheduled Time"
          value={form.scheduled_time}
          onChange={(e) => handleChange('scheduled_time', e.target.value)}
          error={errors['scheduled_time']?.[0]}
        />

        {/* Address */}
        <div className="sm:col-span-2">
          <FormField
            name="address"
            type="text"
            label="Service Address"
            required
            value={form.address}
            onChange={(e) => handleChange('address', e.target.value)}
            error={errors['address']?.[0]}
            helperText="Auto-filled from customer if empty"
          />
        </div>

        {/* Total Cost */}
        <div>
          <label htmlFor="total_cost" className="block text-sm font-medium text-gray-700 mb-1.5">
            Total Cost
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
              $
            </span>
            <input
              id="total_cost"
              type="number"
              step="0.01"
              min="0"
              value={form.total_cost}
              onChange={(e) => handleChange('total_cost', e.target.value)}
              placeholder="Auto-filled from service"
              className="block w-full pl-7 px-3 py-2 rounded-base border border-gray-300 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            />
          </div>
          {errors['total_cost']?.[0] && <p className="mt-1 text-sm text-red-600">{errors['total_cost'][0]}</p>}
        </div>

        {/* Description / Notes */}
        <div className="sm:col-span-2">
          <Textarea
            id="description"
            label="Notes"
            rows={3}
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Additional details about the job..."
            error={errors['description']?.[0]}
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
