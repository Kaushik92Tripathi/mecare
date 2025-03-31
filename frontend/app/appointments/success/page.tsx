"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle, Calendar, Clock, MapPin, Video } from "lucide-react"
import { getAppointmentDetails, AppointmentDetails } from "@/lib/api"

export default function AppointmentSuccess() {
  const searchParams = useSearchParams()
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      try {
        const appointmentId = searchParams.get('id')
        console.log('Appointment ID:', appointmentId)
        if (!appointmentId) {
          setError('No appointment ID provided')
          setLoading(false)
          return
        }

        const { appointment } = await getAppointmentDetails(appointmentId)
        console.log("appointment",appointment)
        setAppointment(appointment)
      } catch (err) {
        setError('Failed to load appointment details')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointmentDetails()
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appointment details...</p>
        </div>
      </div>
    )
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error || 'Appointment not found'}</p>
          <Link href="/appointments/my" className="mt-4 text-primary hover:underline">
            View My Appointments
          </Link>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const formatTime = (timeString: string) => {
    const date = new Date(`2000-01-01T${timeString}`)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8 mx-auto">
        <div className="max-w-md p-6 mx-auto bg-white rounded-lg shadow-sm">
          <div className="flex flex-col items-center mb-6">
            <CheckCircle className="w-16 h-16 mb-4 text-green-500" />
            <h1 className="text-2xl font-bold text-center">Appointment Confirmed!</h1>
            <p className="text-center text-gray-500">Your appointment has been successfully booked.</p>
          </div>

          <div className="p-4 mb-6 bg-gray-50 rounded-md">
            <h2 className="mb-4 text-lg font-medium">Appointment Details</h2>

            <div className="space-y-3">
              <div className="flex">
                <Calendar className="w-5 h-5 mr-3 text-primary" />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{formatDate(appointment.appointment_date)}</p>
                </div>
              </div>

              <div className="flex">
                <Clock className="w-5 h-5 mr-3 text-primary" />
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium">{formatTime(appointment.time_slot.start_time)}</p>
                </div>
              </div>

              <div className="flex">
                <Video className="w-5 h-5 mr-3 text-primary" />
                <div>
                  <p className="text-sm text-gray-500">Appointment Type</p>
                  <p className="font-medium capitalize">
                    {appointment.appointment_type === "video" ? "Video Consultation" : "Hospital Visit"}
                  </p>
                </div>
              </div>

              <div className="flex">
                <MapPin className="w-5 h-5 mr-3 text-primary" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{appointment.doctor.location.name}</p>
                  <p className="text-sm text-gray-500">{appointment.doctor.location.address}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 mb-6 border rounded-md">
            <h2 className="mb-2 text-lg font-medium">{appointment.doctor.name} {appointment.doctor.degree}</h2>
            <p className="mb-4 text-sm text-gray-500">
              {appointment.doctor.specialty.name} 
              {/* • {appointment.doctor.experienceYears} Years Experience */}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 mr-3 overflow-hidden rounded-full">
                  <img
                    src="/placeholder.svg?height=48&width=48"
                    alt={` ${appointment.doctor.name}`}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">Patient</p>
                  <p className="text-sm text-gray-500">{appointment.patient.name}</p>
                </div>
              </div>
              <Link 
                href={`/appointments/doctor/${appointment.doctor.id}`} 
                className="text-sm text-primary hover:underline"
              >
                View Profile
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href="/profile"
              className="block w-full py-2 text-center text-white rounded-md bg-primary hover:bg-primary/90"
            >
              View My Appointments
            </Link>

            <Link
              href="/"
              className="block w-full py-2 text-center text-primary bg-white border border-primary rounded-md hover:bg-primary/5"
            >
              Back to Home
            </Link>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              A confirmation email has been sent to {appointment.patient.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

