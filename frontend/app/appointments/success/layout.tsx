import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Appointment Booked - Healthcare App',
  description: 'Your medical appointment has been successfully scheduled.',
  keywords: 'appointment confirmation, booking success, medical appointment scheduled',
};

export default function AppointmentSuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 