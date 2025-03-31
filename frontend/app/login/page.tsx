"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { useRouter } from 'next/navigation'
import { getAuthUrl } from '@/config'
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import LoadingSkeleton from "./loading"
import { useAuth } from "@/context/AuthContext"

const ALLOWED_DOMAINS = ['gmail.com', 'tothenew.com'];

export default function Login() {
  const router = useRouter()
  const { setUser } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [emailError, setEmailError] = useState("")

  // Reset function
  const handleReset = () => {
    setEmail("")
    setPassword("")
    setError("")
    setEmailError("")
    toast.success('Form has been reset')
  }

  const validateEmail = (email: string): boolean => {
    if (!email) return false;
    
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return false;
    
    if (!ALLOWED_DOMAINS.includes(domain)) {
      setEmailError(`Only ${ALLOWED_DOMAINS.join(' and ')} domains are allowed`)
      toast.error(`Only ${ALLOWED_DOMAINS.join(' and ')} domains are allowed`)
      return false;
    }
    
    setEmailError("")
    return true;
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (newEmail) validateEmail(newEmail);
    else setEmailError("");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setEmailError("")

    // Validate email domain before submission
    if (!validateEmail(email)) {
      return;
    }

    setLoading(true)

    try {
      const res = await fetch(getAuthUrl('login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      // Handle non-JSON responses first
      if (res.status === 401) {
        throw new Error('Email is not registered. Please sign up first.')
      }

      let data;
      try {
        data = await res.json()
      } catch (parseError) {
        throw new Error('Invalid credentials. Please try again.')
      }

      if (!res.ok) {
        throw new Error(data.error || 'Invalid email or password')
      }

      // Store the token in localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      // Update the user state in AuthContext
      setUser(data.user)
      
      toast.success('Login successful!')

      // Redirect based on user role
      if (data.user.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/appointments')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred during login"
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = getAuthUrl('google');
  }

  if (loading) {
    return <LoadingSkeleton />
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative flex items-center justify-center min-h-screen"
    >
      {/* Background Image */}
      <Image
        src="/login.svg"
        alt="Login Background"
        layout="fill"
        objectFit="cover"
        className="absolute inset-0"
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 w-full max-w-md p-6 border border-white/40 rounded-xl shadow-lg backdrop-blur-lg bg-white/10"
      >
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6 text-2xl font-bold text-center"
        >
          Login
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-6 text-sm text-center text-gray-500"
        >
          Don't have an account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Sign up
          </Link>
          .
        </motion.p>

        <AnimatePresence>
          {error && (
            <motion.p 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-red-500 text-center mb-4"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.form 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-4" 
          onSubmit={handleSubmit}
        >
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium text-gray-500">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter your email address"
                className={`w-full h-10 pl-10 pr-4 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary transition-colors ${
                  emailError ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
            </div>
            <AnimatePresence>
              {emailError && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-red-500"
                >
                  {emailError}
                </motion.p>
              )}
            </AnimatePresence>
            <p className="text-xs text-gray-500">Only Gmail and ToTheNew email domains are allowed</p>
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium text-gray-500">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                className="w-full h-10 pl-10 pr-10 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                required
              />
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute transform -translate-y-1/2 right-3 top-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400" />
                )}
              </motion.button>
            </div>
          </div>

          <motion.button 
            type="submit" 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-2 text-white rounded-md bg-primary hover:bg-primary/90 transition-colors"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </motion.button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-gray-500 bg-white">Or continue with</span>
            </div>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleLogin}
            className="flex items-center justify-center w-full gap-2 py-2 text-gray-700 transition-colors bg-white border rounded-md hover:bg-gray-50"
          >
            <Image src="/google.svg" alt="Google" width={20} height={20} />
            Google
          </motion.button>
        </motion.form>
      </motion.div>
    </motion.div>
  )
}
