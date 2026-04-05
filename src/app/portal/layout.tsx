import { PortalAuthProvider } from '@/contexts/PortalAuthContext';

export const metadata = {
  title: 'Customer Portal - Dispatching System',
  description: 'View your jobs, invoices, and request services',
};

export default function PortalRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalAuthProvider>{children}</PortalAuthProvider>;
}
