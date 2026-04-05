import type { JobStatus, JobPriority, InvoiceStatus } from './index';

export interface PortalCustomer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string | null;
  state: string | null;
  zip_code: string | null;
}

export interface PortalService {
  id: number;
  name: string;
  description: string | null;
  base_price: string;
  estimated_duration_minutes: number | null;
}

export interface PortalTechnician {
  id: number;
  name: string;
  phone: string | null;
}

export interface PortalJob {
  id: number;
  reference_number: string;
  service: PortalService;
  technician: PortalTechnician | null;
  status: JobStatus;
  priority: JobPriority;
  description: string | null;
  address: string;
  scheduled_date: string;
  scheduled_time: string | null;
  started_at: string | null;
  completed_at: string | null;
  total_cost: string | null;
  created_at: string;
  status_logs?: PortalStatusLog[];
}

export interface PortalStatusLog {
  id: number;
  old_status: JobStatus | null;
  new_status: JobStatus;
  remarks: string | null;
  created_at: string;
}

export interface PortalInvoice {
  id: number;
  invoice_number: string;
  service_job: PortalJob;
  subtotal: string;
  tax_rate: string;
  tax_amount: string;
  total: string;
  status: InvoiceStatus;
  notes: string | null;
  issued_date: string;
  due_date: string;
  paid_at: string | null;
  created_at: string;
}

export interface PortalEta {
  eta: string | null;
  distance_km: number | null;
  travel_minutes: number | null;
  technician_status: string;
  message: string;
}

export interface PortalServiceRequest {
  id: number;
  service: PortalService;
  description: string;
  preferred_date: string;
  preferred_time: string | null;
  address: string;
  status: 'pending' | 'approved' | 'declined';
  admin_notes: string | null;
  created_at: string;
}

export interface PortalReview {
  id: number;
  service_job: PortalJob;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface ServiceRequestFormData {
  service_id: string;
  description: string;
  preferred_date: string;
  preferred_time: string;
  address: string;
}

export interface ReviewFormData {
  rating: number;
  comment: string;
}
