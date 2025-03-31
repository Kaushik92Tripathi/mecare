"use client"

import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import { usePathname } from 'next/navigation'
import { AuthProvider } from "@/context/AuthContext"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="description" content="Book appointments with top doctors, manage your health records, and get expert medical care from the comfort of your home." />
        <meta name="keywords" content="healthcare, doctor appointments, online booking, medical care, health records" />
        <meta name="author" content="HealthCare App" />
        <link rel="icon" href="/logo.png" />

      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <AuthProvider>
          {!isAdminRoute && <Navbar />}
          <main className="flex-1">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}


