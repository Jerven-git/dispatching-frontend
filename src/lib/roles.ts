import type { Role } from '@/types';

export const ROLE_HOME: Record<Role, string> = {
  admin: '/admin',
  dispatcher: '/dispatcher',
  technician: '/technician',
};

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrator',
  dispatcher: 'Dispatcher',
  technician: 'Technician',
};

export function getHomePath(role: Role): string {
  return ROLE_HOME[role];
}
