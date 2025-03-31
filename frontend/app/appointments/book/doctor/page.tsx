"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sun,
  Sunrise,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { 
  getDoctorById, 
  getDoctorAvailability, 
  getDoctorLocations, 
  createAppointment,
  TimeSlot,
  DateSlot,
  Location,
  DoctorDetails
} from "@/lib/api";

// Add this function before the BookAppointment component
function formatTime(time24: string): string {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

export default function BookAppointment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<number | null>(null);
  const [appointmentType, setAppointmentType] = useState("video");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dates, setDates] = useState<DateSlot[]>([]);
  const [doctorDetails, setDoctorDetails] = useState<DoctorDetails | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  
  const dateSliderRef = useRef(null);
  const [validationErrors, setValidationErrors] = useState<{
    appointmentType?: string;
    location?: string;
    date?: string;
    timeSlot?: string;
  }>({});

  // Define all possible time slots in 12-hour format to match backend
  const allMorningSlots = [
    { time: "9:00 AM" },
    { time: "9:30 AM" },
    { time: "10:00 AM" },
    { time: "10:30 AM" },
    { time: "11:00 AM" },
    { time: "11:30 AM" },
    { time: "12:00 PM" },
    { time: "12:30 PM" },
  ];

  const allAfternoonSlots = [
    { time: "1:00 PM" },
    { time: "1:30 PM" },
    { time: "2:00 PM" },
    { time: "2:30 PM" },
    { time: "3:00 PM" },
    { time: "3:30 PM" },
    { time: "4:00 PM" },
    { time: "4:30 PM" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError("Doctor ID is required");
        setLoading(false);
        return;
      }

      try {
        // Fetch doctor details
        const { doctor } = await getDoctorById(id);
        setDoctorDetails(doctor);

        // Fetch doctor's locations
        const { locations } = await getDoctorLocations(id);
        setLocations(locations);
        if (locations.length > 0) {
          setSelectedLocation(locations[0]);
        }

        // Fetch availability
        const today = new Date();
        const { dates } = await getDoctorAvailability(id, format(today, 'yyyy-MM-dd'));
        console.log('API Response - dates:', dates);
        console.log('First date time slots:', dates[0]?.timeSlots);
        setDates(dates);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    // Reset selected time slot when date changes
    setSelectedTimeSlot(null);
  }, [selectedDate]);

  const scrollRight = () => {
    if (dateSliderRef.current) {
      (dateSliderRef.current as HTMLElement).scrollBy({
        left: 200,
        behavior: "smooth",
      });
    }
  };

  const selectLocation = (location: Location) => {
    setSelectedLocation(location);
    setShowDropdown(false);
  };

  // Get current selected date's time slots
  const currentTimeSlots = dates[selectedDate]?.timeSlots || [];
  console.log('Current time slots:', currentTimeSlots);

  // Map the available slots to our fixed slot UI format
  const morningSlots = allMorningSlots.map(slot => {
    const matchingSlot = currentTimeSlots.find(ts => ts.startTime === slot.time);
    console.log(`Matching slot for ${slot.time}:`, matchingSlot);
    return {
      id: matchingSlot?.id || -1,
      startTime: slot.time,
      endTime: matchingSlot?.endTime || slot.time,
      isAvailable: matchingSlot ? matchingSlot.isAvailable : false
    };
  });

  const afternoonSlots = allAfternoonSlots.map(slot => {
    const matchingSlot = currentTimeSlots.find(ts => ts.startTime === slot.time);
    console.log(`Matching slot for ${slot.time}:`, matchingSlot);
    return {
      id: matchingSlot?.id || -1,
      startTime: slot.time,
      endTime: matchingSlot?.endTime || slot.time,
      isAvailable: matchingSlot ? matchingSlot.isAvailable : false
    };
  });

  // Add validation function
  const validateForm = () => {
    const errors: {
      appointmentType?: string;
      location?: string;
      date?: string;
      timeSlot?: string;
    } = {};

    if (!appointmentType) {
      errors.appointmentType = "Please select an appointment type";
    }

    if (appointmentType === "hospital" && !selectedLocation) {
      errors.location = "Please select a location for hospital visit";
    }

    if (selectedDate === null) {
      errors.date = "Please select a date";
    }

    if (!selectedTimeSlot) {
      errors.timeSlot = "Please select a time slot";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinue = async () => {
    if (!validateForm()) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      console.log("doctorDetails",doctorDetails)
     

      // Navigate to confirmation page with query params
      const appointmentParams = new URLSearchParams({
        doctorId: doctorDetails.id.toString(),
        doctorName: doctorDetails.user.name,
        specialty: doctorDetails.specialty.name,
        date: dates[selectedDate].fullDate,
        time: currentTimeSlots.find(slot => slot.id === selectedTimeSlot)?.startTime || "",
        timeSlotId: selectedTimeSlot.toString(),
        appointmentType,
        locationId: selectedLocation.id.toString(),
        locationName: selectedLocation.name,
        locationAddress: selectedLocation.fullAddress
      });

      router.push(`/appointments/confirm?${appointmentParams.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book appointment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="grid md:grid-cols-2 min-h-screen">
        {/* Left Column */}
        <div className="relative flex flex-col justify-center p-6 sm:p-8 md:p-12 lg:p-16 bg-primary text-white">
          <div className="max-w-md mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              Book Your Next Doctor Visit in Seconds.
            </h1>
            <p className="text-base sm:text-lg mb-6">
              CareMate helps you find the best healthcare provider by specialty,
              location, and more, ensuring you get the care you need.
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="relative flex items-center justify-center p-4 sm:p-6 md:p-8">
          <div className="absolute inset-0 hidden md:block">
            <Image
              src="/book.png"
              alt="Doctor Consultation"
              layout="fill"
              objectFit="cover"
              quality={90}
              priority
            />
          </div>
          <div className="w-full max-w-xl z-10 p-4 sm:p-6 bg-white rounded-lg shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 sm:gap-0">
              <h2 className="text-lg sm:text-xl text-gray-500">Schedule Appointment</h2>
              {doctorDetails && (
                <div className="text-sm text-gray-500">
                  {doctorDetails.name} - {doctorDetails.specialty_name}
                </div>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Appointment Type Buttons */}
            <div className="space-y-2 mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Appointment Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  className={`py-2 px-4 rounded-md text-sm sm:text-base transition-colors ${
                    appointmentType === "video"
                      ? "text-white bg-primary"
                      : "text-primary bg-white border border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    setAppointmentType("video");
                    setValidationErrors({ ...validationErrors, appointmentType: undefined });
                  }}
                >
                  Book Video Consult
                </button>
                <button
                  className={`py-2 px-4 rounded-md text-sm sm:text-base transition-colors ${
                    appointmentType === "hospital"
                      ? "text-white bg-primary"
                      : "text-primary bg-white border border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    setAppointmentType("hospital");
                    setValidationErrors({ ...validationErrors, appointmentType: undefined });
                  }}
                >
                  Book Hospital Visit
                </button>
              </div>
              {validationErrors.appointmentType && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.appointmentType}</p>
              )}
            </div>

            {/* Location Dropdown */}
            {appointmentType === "hospital" && locations.length > 0 && (
              <div className="mb-4 relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location <span className="text-red-500">*</span>
                </label>
                <div
                  className={`flex items-center justify-between p-2 sm:p-3 border rounded-md cursor-pointer text-sm sm:text-base ${
                    validationErrors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <span className="truncate">{selectedLocation?.fullAddress || "Select a location"}</span>
                  <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ml-2" />
                </div>
                {validationErrors.location && (
                  <p className="text-xs text-red-500 mt-1">{validationErrors.location}</p>
                )}
                {showDropdown && (
                  <div className="absolute z-20 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {locations.map((location) => (
                      <div
                        key={location.id}
                        className="p-2 sm:p-3 hover:bg-gray-100 cursor-pointer text-sm sm:text-base"
                        onClick={() => {
                          selectLocation(location);
                          setValidationErrors({ ...validationErrors, location: undefined });
                        }}
                      >
                        {location.fullAddress}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Date Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button className="p-1 hover:bg-gray-100 rounded-full">
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <span className="font-medium text-sm sm:text-base">
                {dates[selectedDate]?.month} {new Date().getFullYear()}
              </span>
              <button className="p-1 hover:bg-gray-100 rounded-full">
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Date Picker */}
            <div className="relative mb-6">
              <div
                ref={dateSliderRef}
                className="flex overflow-x-auto pb-1 hide-scrollbar -mx-2 px-2"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                <div className="flex space-x-2">
                  {dates.map((item, index) => (
                    <button
                      key={index}
                      className={`flex-shrink-0 flex flex-col items-center justify-center p-1 sm:p-2 w-14 sm:w-16 h-16 sm:h-20 text-xs sm:text-sm rounded-md ${
                        selectedDate === index
                          ? "bg-primary text-white"
                          : "border hover:border-primary"
                      }`}
                      onClick={() => setSelectedDate(index)}
                    >
                      <span>{item.day}</span>
                      <span className="text-base sm:text-lg font-bold">{item.date}</span>
                      <span>{item.month}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full shadow-md p-1 hover:bg-gray-50"
                onClick={scrollRight}
              >
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </button>
            </div>

            {/* Morning Slots */}
            {morningSlots.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-medium text-sm sm:text-base">Morning</span>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500">
                    {morningSlots.filter(slot => slot.isAvailable).length} Slots Available
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
                  {morningSlots.map((slot) => (
                    <button
                      key={`morning-${slot.startTime}`}
                      className={`py-2 text-xs sm:text-sm rounded-md ${
                        selectedTimeSlot === slot.id
                          ? "bg-primary text-white"
                          : slot.isAvailable
                          ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                      onClick={() => slot.isAvailable && setSelectedTimeSlot(slot.id)}
                      disabled={!slot.isAvailable}
                    >
                      {slot.startTime}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Afternoon Slots */}
            {afternoonSlots.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sunrise className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-medium text-sm sm:text-base">Afternoon</span>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500">
                    {afternoonSlots.filter(slot => slot.isAvailable).length} Slots Available
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {afternoonSlots.map((slot) => (
                    <button
                      key={`afternoon-${slot.startTime}`}
                      className={`py-2 text-xs sm:text-sm rounded-md ${
                        selectedTimeSlot === slot.id
                          ? "bg-primary text-white"
                          : slot.isAvailable
                          ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                      onClick={() => slot.isAvailable && setSelectedTimeSlot(slot.id)}
                      disabled={!slot.isAvailable}
                    >
                      {slot.startTime}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              className={`w-full py-2 sm:py-3 text-sm sm:text-base rounded-md transition-colors ${
                selectedTimeSlot
                  ? "text-white bg-primary hover:bg-primary/90"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              {selectedTimeSlot ? "Continue to Book Appointment" : "Select a Time Slot to Continue"}
            </button>

            {/* Required Fields Note */}
            <p className="text-xs text-gray-500 mt-2 text-center">
              <span className="text-red-500">*</span> Required fields
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}