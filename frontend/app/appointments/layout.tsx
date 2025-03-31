import { Metadata } from 'next';
import { Montserrat } from 'next/font/google';

export const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Book Appointments - Healthcare App',
  description: 'Browse and book appointments with our expert doctors. Filter by specialty, location, and availability.',
  keywords: 'doctor appointments, medical consultation, book doctor, healthcare scheduling',
};

export default function AppointmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={montserrat.variable}>{children}</div>;
} 