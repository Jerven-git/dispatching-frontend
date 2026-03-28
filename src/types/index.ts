export type Role = 'admin' | 'dispatcher' | 'technician';

export type JobStatus = 'pending' | 'assigned' | 'on_the_way' | 'in_progress' | 'completed' | 'cancelled';

export type JobPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  is_active: boolean;
  created_at: string;
}

export interface UserFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
  is_active: boolean;
}

export interface Customer {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  address: string;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  notes: string | null;
  created_at: string;
}

export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  notes: string;
}

export interface Service {
  id: number;
  name: string;
  description: string | null;
  base_price: string;
  estimated_duration_minutes: number | null;
  is_active: boolean;
  created_at: string;
}

export interface ServiceFormData {
  name: string;
  description: string;
  base_price: string;
  estimated_duration_minutes: string;
  is_active: boolean;
}

export interface ServiceJob {
  id: number;
  reference_number: string;
  customer: Customer;
  service: Service;
  technician: User | null;
  creator: User;
  status: JobStatus;
  priority: JobPriority;
  description: string | null;
  address: string;
  scheduled_date: string;
  scheduled_time: string | null;
  started_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  technician_notes: string | null;
  total_cost: string | null;
  created_at: string;
  updated_at: string;
  status_logs?: JobStatusLog[];
}

export interface ServiceJobFormData {
  customer_id: string;
  service_id: string;
  technician_id: string;
  priority: JobPriority;
  description: string;
  address: string;
  scheduled_date: string;
  scheduled_time: string;
  total_cost: string;
}

export interface JobStatusLog {
  id: number;
  old_status: JobStatus | null;
  new_status: JobStatus;
  changed_by: User;
  remarks: string | null;
  created_at: string;
}

export interface TechnicianWorkload {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  active_jobs: number;
  today_jobs: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

export interface ReportSummary {
  total_jobs: number;
  pending_jobs: number;
  assigned_jobs: number;
  in_progress_jobs: number;
  completed_jobs: number;
  cancelled_jobs: number;
  total_revenue: number;
}

export interface JobsByStatusItem {
  status: JobStatus;
  count: number;
  revenue: number;
}

export interface JobsByDateItem {
  date: string;
  total: number;
  completed: number;
  cancelled: number;
}

export interface TechnicianPerformanceItem {
  technician: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
  };
  completed_jobs: number;
  total_revenue: number;
  avg_duration_minutes: number | null;
}

export interface DashboardStats {
  total_jobs: number;
  pending_jobs: number;
  assigned_jobs: number;
  in_progress_jobs: number;
  completed_jobs: number;
  cancelled_jobs: number;
  total_customers?: number;
  total_technicians?: number;
  todays_jobs: number;
}
