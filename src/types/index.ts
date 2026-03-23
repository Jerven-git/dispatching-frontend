export type Role = 'admin' | 'dispatcher' | 'technician';

export type JobStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

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

export interface Service {
  id: number;
  name: string;
  description: string | null;
  base_price: string;
  estimated_duration_minutes: number | null;
  is_active: boolean;
  created_at: string;
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
  technician_notes: string | null;
  total_cost: string | null;
  created_at: string;
  updated_at: string;
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
