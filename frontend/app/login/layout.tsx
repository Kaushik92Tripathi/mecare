import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Healthcare App',
  description: 'Sign in to your healthcare account to manage appointments and access medical services.',
  keywords: 'login, sign in, healthcare account, medical portal access',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 