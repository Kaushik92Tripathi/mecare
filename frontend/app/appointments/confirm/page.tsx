"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, User, Phone, Mail, FileText, Calendar, Clock, MapPin, AlertCircle } from "lucide-react"
import { createAppointment } from "@/lib/api"
import Image from "next/image"

interface ValidationErrors {
  name?: string;
  age?: string;
  gender?: string;
  phone?: string;
  email?: string;
  problem?: string;
}

export default function ConfirmAppointment() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [appointmentDetails, setAppointmentDetails] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    email: "",
    problem: "",
  })

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [submitError, setSubmitError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get appointment parameters from URL
  const [appointmentParams, setAppointmentParams] = useState({
    doctorId: "",
    doctorName: "",
    specialty: "",
    date: "",
    time: "",
    timeSlotId: "",
    appointmentType: "",
    locationId: "",
    locationName: "",
    locationAddress: ""
  })

  useEffect(() => {
    if (searchParams) {
      setAppointmentParams({
        doctorId: searchParams.get("doctorId") || "",
        doctorName: searchParams.get("doctorName") || "",
        specialty: searchParams.get("specialty") || "",
        date: searchParams.get("date") || "",
        time: searchParams.get("time") || "",
        timeSlotId: searchParams.get("timeSlotId") || "",
        appointmentType: searchParams.get("appointmentType") || "",
        locationId: searchParams.get("locationId") || "",
        locationName: searchParams.get("locationName") || "",
        locationAddress: searchParams.get("locationAddress") || ""
      })
    }
  }, [searchParams])

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
        if (!value.trim()) return "Name is required"
        if (value.trim().length < 2) return "Name must be at least 2 characters"
        if (!/^[a-zA-Z\s]*$/.test(value)) return "Name can only contain letters and spaces"
        return ""
      
      case 'age':
        if (!value) return "Age is required"
        const age = parseInt(value)
        if (isNaN(age)) return "Age must be a number"
        if (age < 0) return "Age cannot be negative"
        if (age > 120) return "Please enter a valid age"
        return ""
      
      case 'gender':
        if (!value) return "Gender is required"
        return ""
      
      case 'phone':
        if (!value.trim()) return "Phone number is required"
        if (!/^\+?[\d\s-]{10,}$/.test(value)) return "Please enter a valid phone number"
        return ""
      
      case 'email':
        if (!value.trim()) return "Email is required"
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email address"
        return ""
      
      case 'problem':
        if (value.trim().length > 500) return "Problem description cannot exceed 500 characters"
        return ""
      
      default:
        return ""
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setAppointmentDetails((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear validation error when user starts typing
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ""
      }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const error = validateField(name, value)
    if (error) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: error
      }))
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  }

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}
    let isValid = true

    // Validate all fields
    Object.keys(appointmentDetails).forEach(key => {
      const error = validateField(key, appointmentDetails[key as keyof typeof appointmentDetails])
      if (error) {
        errors[key as keyof ValidationErrors] = error
        isValid = false
      }
    })

    setValidationErrors(errors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError("")

    if (!validateForm()) {
      setSubmitError("Please fix the errors in the form before submitting")
      return
    }

    setIsSubmitting(true)

    try {
      // Create the complete appointment data
      const appointmentData = {
        doctorId: parseInt(appointmentParams.doctorId),
        date: appointmentParams.date,
        timeSlotId: parseInt(appointmentParams.timeSlotId),
        appointmentType: appointmentParams.appointmentType,
        patientProblem: appointmentDetails.problem,
        patientAge: parseInt(appointmentDetails.age),
        patientGender: appointmentDetails.gender,
        patientName: appointmentDetails.name,
        patientEmail: appointmentDetails.email,
        patientPhone: appointmentDetails.phone
      }

      // Make the API call to create the appointment
      const { appointment } = await createAppointment(appointmentData)

      // Redirect to success page
      router.push(`/appointments/success?id=${appointment.id}`)
    } catch (error) {
      console.error("Error booking appointment:", error)
      setSubmitError(error instanceof Error ? error.message : "Failed to book appointment. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8 mx-auto">
        <div className="max-w-2xl mx-auto">
          <Link href={`/appointments/book/doctor?id=${appointmentParams.doctorId}`} className="flex items-center mb-6 text-primary hover:underline">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Appointment Booking
          </Link>

          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h1 className="mb-6 text-2xl font-bold">Confirm Appointment Details</h1>

            {submitError && (
              <div className="p-4 mb-6 text-red-700 bg-red-50 rounded-md flex items-start">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <p>{submitError}</p>
              </div>
            )}

            <div className="p-4 mb-6 bg-gray-50 rounded-md">
              <h2 className="mb-2 text-lg font-medium">Appointment Summary</h2>
              <div className="grid gap-2 md:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">Doctor</p>
                  <p className="font-medium">{appointmentParams.doctorName}</p>
                  <p className="text-sm text-gray-500">{appointmentParams.specialty}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date & Time</p>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                    <p className="font-medium">{formatDate(appointmentParams.date)}</p>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1 text-gray-400" />
                    <p className="font-medium">{appointmentParams.time}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Appointment Type</p>
                  <p className="font-medium capitalize">{appointmentParams.appointmentType === "video" ? "Video Consultation" : "Hospital Visit"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <div className="flex items-start">
                    <MapPin className="w-4 h-4 mr-1 mt-1 text-gray-400" />
                    <div>
                      <p className="font-medium">{appointmentParams.locationName}</p>
                      <p className="text-sm text-gray-500">{appointmentParams.locationAddress}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-lg font-medium">Patient Information</h2>

              <div className="space-y-1">
                <label htmlFor="name" className="text-sm font-medium">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={appointmentDetails.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter patient's full name"
                    className={`w-full h-10 pl-10 pr-4 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary ${
                      validationErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {validationErrors.name && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.name}</p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="age" className="text-sm font-medium">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    value={appointmentDetails.age}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter age"
                    className={`w-full h-10 px-4 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary ${
                      validationErrors.age ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.age && (
                    <p className="text-sm text-red-500">{validationErrors.age}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="gender" className="text-sm font-medium">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={appointmentDetails.gender}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full h-10 px-4 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary ${
                      validationErrors.gender ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {validationErrors.gender && (
                    <p className="text-sm text-red-500">{validationErrors.gender}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={appointmentDetails.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter phone number"
                    className={`w-full h-10 pl-10 pr-4 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary ${
                      validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {validationErrors.phone && (
                  <p className="text-sm text-red-500">{validationErrors.phone}</p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={appointmentDetails.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter email address"
                    className={`w-full h-10 pl-10 pr-4 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary ${
                      validationErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {validationErrors.email && (
                  <p className="text-sm text-red-500">{validationErrors.email}</p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="problem" className="text-sm font-medium">
                  Health Problem (Optional)
                </label>
                <div className="relative">
                  <FileText className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
                  <textarea
                    id="problem"
                    name="problem"
                    value={appointmentDetails.problem}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Briefly describe your health problem"
                    className={`w-full h-24 pl-10 pr-4 pt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary ${
                      validationErrors.problem ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {validationErrors.problem && (
                  <p className="text-sm text-red-500">{validationErrors.problem}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Maximum 500 characters</p>
              </div>

              <div className="pt-4 mt-4 border-t">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`w-full py-3 text-white rounded-md transition-colors ${
                    isSubmitting 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-primary hover:bg-primary/90"
                  }`}
                >
                  {isSubmitting ? "Confirming..." : "Confirm Appointment"}
                </button>
                <p className="mt-2 text-xs text-center text-gray-500">
                  By confirming this appointment, you agree to our{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

