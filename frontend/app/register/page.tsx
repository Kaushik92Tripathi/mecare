"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, User, Phone, Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { getAuthUrl } from '@/config';
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSkeleton from "./loading";
import { useAuth } from "@/context/AuthContext";

const ALLOWED_DOMAINS = ['gmail.com', 'tothenew.com'];

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function Register() {
  const { setUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
        if (!value.trim()) return "Name is required";
        if (value.trim().length < 2) return "Name must be at least 2 characters";
        if (!/^[a-zA-Z\s]*$/.test(value)) return "Name can only contain letters and spaces";
        return "";

      case 'email':
        if (!value.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email address";
        
        const domain = value.split('@')[1]?.toLowerCase();
        if (!domain || !ALLOWED_DOMAINS.includes(domain)) {
          return `Only ${ALLOWED_DOMAINS.join(' and ')} domains are allowed`;
        }
        return "";

      case 'password':
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        if (!/(?=.*[a-z])/.test(value)) return "Password must contain at least one lowercase letter";
        if (!/(?=.*[A-Z])/.test(value)) return "Password must contain at least one uppercase letter";
        if (!/(?=.*\d)/.test(value)) return "Password must contain at least one number";
        if (!/(?=.*[!@#$%^&*])/.test(value)) return "Password must contain at least one special character";
        return "";

      case 'confirmPassword':
        if (!value) return "Please confirm your password";
        if (value !== formData.password) return "Passwords do not match";
        return "";

      default:
        return "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));

    // Validate the field
    const error = validateField(id, value);
    setValidationErrors(prev => ({
      ...prev,
      [id]: error
    }));

    // Special case for confirmPassword - validate it when password changes
    if (id === 'password') {
      const confirmError = validateField('confirmPassword', formData.confirmPassword);
      setValidationErrors(prev => ({
        ...prev,
        confirmPassword: confirmError
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;

    // Validate all fields
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) {
        errors[key as keyof ValidationErrors] = error;
        isValid = false;
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      setError("Please fix all validation errors before submitting");
      toast.error("Please fix all validation errors before submitting");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(getAuthUrl('register'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || "Registration failed");
      
      setUser(data.user);
      
      toast.success("Registration successful!");
      router.push("/appointments");
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred during registration";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    });
    setValidationErrors({});
    setError("");
    toast.success("Form has been reset");
  };

  const handleGoogleSignUp = () => {
    window.location.href = getAuthUrl('google');
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative flex items-center justify-center min-h-screen"
    >
      <Image
        src="/signup.svg"
        alt="Register Background"
        layout="fill"
        objectFit="cover"
        className="absolute inset-0"
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 w-full max-w-md p-4 border border-white/40 rounded-xl shadow-lg backdrop-blur-lg bg-white/10"
      >
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-4 text-2xl font-bold text-center"
        >
          Sign Up
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-4 text-sm text-center text-gray-500"
        >
          Already a member? {" "}
          <Link href="/login" className="text-primary hover:underline">Login</Link>.
        </motion.p>

        <AnimatePresence>
          {error && (
            <motion.p 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-red-500 text-center mb-3"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.form 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-3" 
          onSubmit={handleSubmit}
        >
          <div className="space-y-0.5">
            <label htmlFor="name" className="text-sm font-medium text-gray-500">
              Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                className={`w-full h-10 pl-10 pr-4 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary transition-colors ${
                  validationErrors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <AnimatePresence>
              {validationErrors.name && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-red-500"
                >
                  {validationErrors.name}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-0.5">
            <label htmlFor="email" className="text-sm font-medium text-gray-500">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                className={`w-full h-10 pl-10 pr-4 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary transition-colors ${
                  validationErrors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <AnimatePresence>
              {validationErrors.email && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-red-500"
                >
                  {validationErrors.email}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-0.5">
            <label htmlFor="password" className="text-sm font-medium text-gray-500">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`w-full h-10 pl-10 pr-10 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary transition-colors ${
                  validationErrors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.password}
                onChange={handleChange}
              />
              <motion.button
                type="button"
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
            <AnimatePresence>
              {validationErrors.password && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-red-500"
                >
                  {validationErrors.password}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-0.5">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-500">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`w-full h-10 pl-10 pr-4 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary transition-colors ${
                  validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
            <AnimatePresence>
              {validationErrors.confirmPassword && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-red-500"
                >
                  {validationErrors.confirmPassword}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="flex gap-2">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-2 text-white transition-colors rounded-md bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleReset}
              className="px-4 py-2 text-gray-600 transition-colors bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Reset
            </motion.button>
          </div>

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
            onClick={handleGoogleSignUp}
            className="flex items-center justify-center w-full gap-2 py-2 text-gray-700 transition-colors bg-white border rounded-md hover:bg-gray-50"
          >
            <Image src="/google.svg" alt="Google" width={20} height={20} />
            Google
          </motion.button>
        </motion.form>
      </motion.div>
    </motion.div>
  );
}
