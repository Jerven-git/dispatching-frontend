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

export interface AppNotification {
  id: string;
  type: string;
  data: {
    title: string;
    message: string;
    job_id?: number;
    reference_number?: string;
    type: string;
    old_status?: string;
    new_status?: string;
  };
  read_at: string | null;
  created_at: string;
}

// ── Phase 3: Job Enhancements ──────────────────────────────────

export type AttachmentCategory = 'before' | 'after' | 'document' | 'other';

export interface JobAttachment {
  id: number;
  service_job_id: number;
  uploaded_by: number;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  category: AttachmentCategory;
  created_at: string;
}

export interface ChecklistItem {
  id: number;
  service_id: number;
  label: string;
  sort_order: number;
  is_required: boolean;
}

export interface JobChecklistEntry {
  id: number;
  checklist_item_id: number;
  is_completed: boolean;
  completed_by: number | null;
  completed_at: string | null;
  checklist_item: ChecklistItem;
}

export interface JobComment {
  id: number;
  service_job_id: number;
  user_id: number;
  user?: User;
  body: string;
  is_internal: boolean;
  created_at: string;
}

// ── Phase 4: Invoicing ─────────────────────────────────────────

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'cancelled';

export interface Invoice {
  id: number;
  invoice_number: string;
  service_job: ServiceJob;
  customer: Customer;
  creator: User;
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

// ── Phase 7: Inventory & Parts ─────────────────────────────────

export interface Part {
  id: number;
  name: string;
  description: string | null;
  sku: string;
  unit_price: string;
  stock_quantity: number;
  minimum_stock: number;
  unit: string;
  is_active: boolean;
  is_low_stock: boolean;
  created_at: string;
}

export interface PartFormData {
  name: string;
  description: string;
  sku: string;
  unit_price: string;
  stock_quantity: string;
  minimum_stock: string;
  unit: string;
  is_active: boolean;
}

export interface JobPart {
  id: number;
  part: Part;
  quantity: number;
  unit_price: string;
  total_price: string;
  added_by: User;
  notes: string | null;
  created_at: string;
}

// ── Phase 8: Analytics ─────────────────────────────────────────

export interface RevenueTrendItem {
  month: string;
  jobs_completed: number;
  revenue: number;
}

export interface JobTrendItem {
  week: string;
  week_start: string;
  total: number;
  completed: number;
  cancelled: number;
  active: number;
}

export interface ServicePopularityItem {
  service: { id: number; name: string; base_price: string };
  total_jobs: number;
  completed_jobs: number;
  revenue: number;
}

export interface CustomerLifetimeValueItem {
  id: number;
  name: string;
  email: string;
  customer_since: string;
  total_jobs: number;
  completed_jobs: number;
  total_spent: number;
  total_paid: number;
  avg_job_value: number;
}

export interface JobProfitabilityItem {
  id: number;
  reference_number: string;
  customer: string;
  service: string;
  scheduled_date: string;
  total_revenue: number;
  parts_cost: number;
  labor_revenue: number;
  profit_margin: number;
}

export interface ProfitabilitySummary {
  total_jobs: number;
  total_revenue: number;
  total_parts_cost: number;
  total_labor_revenue: number;
  avg_profit_margin: number;
}

export interface ScheduledReport {
  id: number;
  name: string;
  report_type: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  parameters: Record<string, string> | null;
  is_active: boolean;
  last_sent_at: string | null;
  creator?: User;
  created_at: string;
}

// ── Phase 9: Multi-Tenancy ─────────────────────────────────────

export type TenantPlan = 'free' | 'basic' | 'pro' | 'enterprise';

export interface Tenant {
  id: number;
  name: string;
  slug: string;
  domain: string | null;
  plan: TenantPlan;
  max_users: number;
  settings: Record<string, unknown> | null;
  is_active: boolean;
  users_count?: number;
  created_at: string;
}

export interface Permission {
  id: number;
  name: string;
  slug: string;
  group: string;
  description: string | null;
}

export interface AppRole {
  id: number;
  tenant_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  is_system: boolean;
  permissions: Permission[];
  users?: User[];
}

export interface AuditLog {
  id: number;
  user: User | null;
  action: string;
  auditable_type: string | null;
  auditable_id: number | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}
