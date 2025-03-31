import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Confirm Appointment - Healthcare App',
  description: 'Review and confirm your medical appointment details.',
  keywords: 'confirm appointment, appointment details, medical consultation confirmation',
};

export default function AppointmentConfirmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 