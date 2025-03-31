import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Healthcare App',
  description: 'Manage appointments, doctors, and view healthcare system statistics.',
  keywords: 'admin dashboard, healthcare management, appointment management, doctor management',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 