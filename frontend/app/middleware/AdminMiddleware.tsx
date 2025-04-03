"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

interface AdminMiddlewareProps {
  children: React.ReactNode
}

export default function AdminMiddleware({ children }: AdminMiddlewareProps) {
  const router = useRouter()
  const { user, isLoading, checkAuth } = useAuth()

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const userData = await checkAuth();
        
        if (!userData) {
          router.push('/login');
          return;
        }

        if (userData.role !== 'admin') {
          router.push('/appointments');
          return;
        }
      } catch (error) {
        console.error('Error verifying admin:', error);
        router.push('/login');
      }
    };

    verifyAdmin();
  }, [router, checkAuth]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If we have a user and they're an admin, render the children
  if (user && user.role === 'admin') {
    return <>{children}</>;
  }

  // If we have a user but they're not an admin, they'll be redirected in the useEffect
  // If we don't have a user, they'll be redirected in the useEffect
  return null;
} 