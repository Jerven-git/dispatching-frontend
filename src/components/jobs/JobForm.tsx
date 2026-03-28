'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useFormSubmit } from '@/hooks/useFormSubmit';
import { JOB_PRIORITIES, priorityLabels } from '@/lib/job-constants';
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
      api.get<PaginatedResponse<Service>>('/services', { active_only: '1' }),
      api.get<{ users: User[] }>('/users/technicians'),
    ])
      .then(([customerData, serviceData, techData]) => {
        setCustomers(customerData.data);
        setServices(serviceData.data);
        setTechnicians(techData.users);
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
      {generalError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {generalError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Customer */}
        <div>
          <label htmlFor="customer_id" className="block text-sm font-medium text-gray-700">
            Customer <span className="text-red-500">*</span>
          </label>
          <select
            id="customer_id"
            required
            value={form.customer_id}
            onChange={(e) => handleCustomerChange(e.target.value)}
            className={inputClass('customer_id')}
          >
            <option value="">Select a customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} - {c.phone}
              </option>
            ))}
          </select>
          {fieldError('customer_id')}
        </div>

        {/* Service */}
        <div>
          <label htmlFor="service_id" className="block text-sm font-medium text-gray-700">
            Service <span className="text-red-500">*</span>
          </label>
          <select
            id="service_id"
            required
            value={form.service_id}
            onChange={(e) => handleServiceChange(e.target.value)}
            className={inputClass('service_id')}
          >
            <option value="">Select a service</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} - ${parseFloat(s.base_price).toFixed(2)}
              </option>
            ))}
          </select>
          {fieldError('service_id')}
        </div>

        {/* Technician (optional) */}
        <div>
          <label htmlFor="technician_id" className="block text-sm font-medium text-gray-700">
            Assign Technician
          </label>
          <select
            id="technician_id"
            value={form.technician_id}
            onChange={(e) => handleChange('technician_id', e.target.value)}
            className={inputClass('technician_id')}
          >
            <option value="">Unassigned</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          {fieldError('technician_id')}
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
            Priority
          </label>
          <select
            id="priority"
            value={form.priority}
            onChange={(e) => handleChange('priority', e.target.value)}
            className={inputClass('priority')}
          >
            {JOB_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {priorityLabels[p]}
              </option>
            ))}
          </select>
          {fieldError('priority')}
        </div>

        {/* Scheduled Date */}
        <div>
          <label htmlFor="scheduled_date" className="block text-sm font-medium text-gray-700">
            Scheduled Date <span className="text-red-500">*</span>
          </label>
          <input
            id="scheduled_date"
            type="date"
            required
            value={form.scheduled_date}
            onChange={(e) => handleChange('scheduled_date', e.target.value)}
            className={inputClass('scheduled_date')}
          />
          {fieldError('scheduled_date')}
        </div>

        {/* Scheduled Time */}
        <div>
          <label htmlFor="scheduled_time" className="block text-sm font-medium text-gray-700">
            Scheduled Time
          </label>
          <input
            id="scheduled_time"
            type="time"
            value={form.scheduled_time}
            onChange={(e) => handleChange('scheduled_time', e.target.value)}
            className={inputClass('scheduled_time')}
          />
          {fieldError('scheduled_time')}
        </div>

        {/* Address */}
        <div className="sm:col-span-2">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Service Address <span className="text-red-500">*</span>
          </label>
          <input
            id="address"
            type="text"
            required
            value={form.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Auto-filled from customer if empty"
            className={inputClass('address')}
          />
          {fieldError('address')}
        </div>

        {/* Total Cost */}
        <div>
          <label htmlFor="total_cost" className="block text-sm font-medium text-gray-700">
            Total Cost
          </label>
          <div className="relative mt-1">
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
              className={`pl-7 ${inputClass('total_cost')}`}
            />
          </div>
          {fieldError('total_cost')}
        </div>

        {/* Description / Notes */}
        <div className="sm:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            id="description"
            rows={3}
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Additional details about the job..."
            className={inputClass('description')}
          />
          {fieldError('description')}
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
