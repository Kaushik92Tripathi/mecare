"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AdminMiddlewareProps {
  children: React.ReactNode
}

export default function AdminMiddleware({ children }: AdminMiddlewareProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')

      if (!token || !user) {
        router.push('/login')
        return
      }

      try {
        const userData = JSON.parse(user)
        if (userData.role !== 'admin') {
          router.push('/appointments')
          return
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
        router.push('/login')
        return
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <>{children}</>
} 