'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { portalApi } from '@/lib/portal-api';
import type { PortalCustomer } from '@/types/portal';

interface PortalAuthContextType {
  customer: PortalCustomer | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const PortalAuthContext = createContext<PortalAuthContextType | undefined>(undefined);

export function PortalAuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<PortalCustomer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    portalApi.get<{ customer: PortalCustomer }>('/me', undefined, { cacheTtl: 60_000 })
      .then((data) => { if (!cancelled) setCustomer(data.customer); })
      .catch(() => { if (!cancelled) setCustomer(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await portalApi.getCsrfCookie();
    portalApi.clearCache();
    const data = await portalApi.post<{ customer: PortalCustomer }>('/login', { email, password });
    setCustomer(data.customer);
  }, []);

  const logout = useCallback(async () => {
    try {
      await portalApi.post('/logout');
    } catch {
      // Ignore logout errors
    }
    portalApi.clearCache();
    setCustomer(null);
  }, []);

  const value = useMemo(() => ({ customer, loading, login, logout }), [customer, loading, login, logout]);

  return (
    <PortalAuthContext.Provider value={value}>
      {children}
    </PortalAuthContext.Provider>
  );
}

export function usePortalAuth() {
  const context = useContext(PortalAuthContext);
  if (context === undefined) {
    throw new Error('usePortalAuth must be used within a PortalAuthProvider');
  }
  return context;
}
