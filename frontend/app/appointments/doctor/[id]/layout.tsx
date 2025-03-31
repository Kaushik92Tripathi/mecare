import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Doctor Profile - Healthcare App',
  description: 'View doctor details, qualifications, and schedule an appointment.',
  keywords: 'doctor profile, medical specialist, book doctor, healthcare provider',
};

export default function DoctorProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 