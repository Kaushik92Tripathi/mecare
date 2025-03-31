import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Book an Appointment - Healthcare App',
  description: 'Choose your preferred doctor and schedule a medical consultation.',
  keywords: 'book appointment, schedule consultation, doctor visit, medical appointment',
};

export default function AppointmentBookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 