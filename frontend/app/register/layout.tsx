import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register - Healthcare App',
  description: 'Create your healthcare account to book appointments and access personalized medical services.',
  keywords: 'register, sign up, create account, healthcare registration',
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 