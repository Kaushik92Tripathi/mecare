"use client"

import Link from "next/link"
import { Star, MapPin, Calendar, Clock, ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import DoctorReviews from '@/components/DoctorReviews'
import { DoctorProfileSkeleton } from '../../../components/ui/Shimmer'
import { getDoctorById, getDoctorAppointments, getDoctorReviews } from "@/lib/api"

interface DoctorData {
  id: number;
  user_id: number;
  name: string;
  degree: string;
  experience_years: number;
  bio: string;
  location_id: number | null;
  consultation_fee: number | null;
  is_available: boolean;
  avg_rating: number;
  review_count: number;
  profile_picture: string | null;
  specialty_id: number | null;
  specialty_name: string;
  location_name: string;
  address: string;
  city: string;
  state: string;
  availability: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
}

export default function DoctorProfile() {
  const params = useParams();
  const id = params?.id as string;
  const [doctorData, setDoctorData] = useState<DoctorData | null>(null);
  const [availability, setAvailability] = useState<DoctorData['availability']>([]);
  const [canReview, setCanReview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctorDetails = async () => {
    try {
      if (!id) {
        throw new Error('Doctor ID is required');
      }

      setIsLoading(true);
      const { doctor, availability } = await getDoctorById(id);
      console.log(doctor, availability)
      
      // Transform the doctor data to match DoctorData interface
      const transformedDoctor: DoctorData = {
        id: doctor.id,
        user_id: doctor.userId,
        name: doctor.user.name,
        degree: doctor.degree,
        experience_years: doctor.experienceYears,
        bio: doctor.bio || '',
        location_id: doctor.locationId || null,
        consultation_fee: doctor.consultationFee || null,
        is_available: doctor.isAvailable,
        avg_rating: typeof doctor.avgRating === 'string' ? parseFloat(doctor.avgRating) : doctor.avgRating,
        review_count: doctor.reviewCount || 0,
        profile_picture: doctor.user.profilePicture,
        specialty_id: doctor.specialtyId || null,
        specialty_name: doctor.specialty?.name || '',
        location_name: doctor.location?.name || '',
        address: doctor.location?.address || '',
        city: doctor.location?.city || '',
        state: doctor.location?.state || '',
        availability: availability
      };

      setDoctorData(transformedDoctor);
      setAvailability(availability);

      // Check if user can review
      try {
        // Get completed appointments
        const { appointments } = await getDoctorAppointments(id, 'completed');
        
        // Get existing reviews
        const { reviews } = await getDoctorReviews(id);
        
        // User can review if they have completed appointments and haven't reviewed yet
        const hasCompletedAppointment = appointments.length > 0;
        const hasReviewed = reviews.some(review => review.patient.id === doctor.userId);
        
        setCanReview(hasCompletedAppointment && !hasReviewed);
      } catch (error) {
        console.error('Error checking review eligibility:', error);
        setCanReview(false);
      }
    } catch (error) {
      console.error('Error fetching doctor details:', error);
      setError(error instanceof Error ? error.message : 'Failed to load doctor details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDoctorDetails();
    }
  }, [id]);

  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container px-4 py-8 mx-auto md:px-6">
          <Link 
            href="/appointments" 
            className="inline-flex items-center mb-6 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Appointments
          </Link>
          <DoctorProfileSkeleton />
        </div>
      </div>
    )
  }

  if (error || !doctorData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container px-4 py-8 mx-auto md:px-6">
          <Link 
            href="/appointments" 
            className="inline-flex items-center mb-6 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Appointments
          </Link>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="flex flex-col items-center justify-center min-h-[200px]">
              <div className="text-lg font-medium text-red-600 mb-2">
                {error || "Failed to load doctor details"}
              </div>
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Convert availability array to days array without duplicates
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const availableDaySet = new Set(availability.map(a => days[a.dayOfWeek]))
  const availableDays = days.filter(day => availableDaySet.has(day))

  // Format hours safely
  const formatTimeDisplay = (timeString: string): string => {
    if (!timeString) return "";
    
    // Ensure the time is in the correct format (HH:MM)
    let formattedTime = timeString;
    if (timeString.length < 5) {
      // If it's just hours (e.g., "9"), make it "09:00"
      if (timeString.length === 1) {
        formattedTime = `0${timeString}:00`;
      } 
      // If it's hours and partial minutes (e.g., "9:3"), make it "09:30"
      else if (timeString.length === 3 && timeString.includes(':')) {
        const [hours, minutes] = timeString.split(':');
        formattedTime = `0${hours}:${minutes}0`;
      }
      // If it's just hours and minutes with single digit hour (e.g., "9:30"), make it "09:30"
      else if (timeString.length === 4 && timeString.includes(':')) {
        formattedTime = `0${timeString}`;
      }
    }
    
    try {
      // Use a safer parsing approach
      const [hours, minutes] = formattedTime.split(':').map(num => parseInt(num, 10));
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch (e) {
      return timeString; // Fallback to original string if parsing fails
    }
  };

  // Get the first time slot's hours for display
  const hours = availability.length > 0
    ? `${formatTimeDisplay(availability[0].startTime)} - ${formatTimeDisplay(availability[0].endTime)}`
    : "Not available";

  // Format location
  const location = [doctorData.location_name, doctorData.address, doctorData.city, doctorData.state]
    .filter(Boolean)
    .join(", ")

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-6 sm:py-8 mx-auto md:px-6">
        <Link 
          href="/appointments" 
          className="inline-flex items-center mb-4 sm:mb-6 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Appointments
        </Link>
        <div className="grid gap-6 lg:gap-8 md:grid-cols-3">
          {/* Doctor Profile Card */}
          <div className="md:col-span-1">
            <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 sm:w-32 sm:h-32 mb-4 overflow-hidden rounded-full">
                  <img
                    src={"/default-avatar.png"}
                    alt={doctorData.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <h1 className="mb-1 text-lg sm:text-xl font-bold text-center">{doctorData.name}</h1>
                <p className="mb-2 text-sm text-gray-500 text-center">{doctorData.degree}</p>
                <div className="flex items-center mb-4 flex-wrap justify-center">
                  <div className="flex mr-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.floor(doctorData.avg_rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {doctorData.avg_rating.toFixed(1)} ({doctorData.review_count} reviews)
                  </span>
                </div>

                <Link
                  href={`/appointments/book/doctor?id=${doctorData.id}`}
                  className="w-full py-2.5 mb-4 text-center text-white rounded-md bg-primary hover:bg-primary/90 text-sm sm:text-base font-medium"
                >
                  Book Appointment
                </Link>

                <div className="w-full pt-4 mt-4 border-t space-y-4">
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 mr-3 text-gray-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600">{location}</p>
                  </div>
                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 mr-3 text-gray-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600">{availableDays.join(", ")}</p>
                  </div>
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 mr-3 text-gray-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600">{hours}</p>
                  </div>
                </div>

                {doctorData.bio && (
                  <div className="w-full pt-4 mt-4 border-t">
                    <h3 className="mb-2 text-sm font-medium">About</h3>
                    <p className="text-sm text-gray-600">{doctorData.bio}</p>
                  </div>
                )}

                {doctorData.consultation_fee && (
                  <div className="w-full pt-4 mt-4 border-t">
                    <h3 className="mb-2 text-sm font-medium">Consultation Fee</h3>
                    <p className="text-2xl font-bold text-primary">₹{doctorData.consultation_fee}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Reviews */}
          <div className="md:col-span-2">
            <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm">
              {doctorData && (
                <DoctorReviews 
                  doctorId={doctorData.id} 
                  canReview={canReview} 
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

} 