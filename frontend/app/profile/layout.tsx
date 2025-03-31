import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Profile - Healthcare App',
  description: 'View and manage your healthcare profile, personal information, and appointment history.',
  keywords: 'user profile, medical history, healthcare profile, appointment history',
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 