"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  MoreHorizontal,
  Star,
  ChevronDown,
  ChevronUp,
  Filter,
  Edit,
  Trash,
  Ban,
  Eye,
  Check,
  X,
} from "lucide-react";
import { format } from "date-fns";
import AdminMiddleware from "@/app/middleware/AdminMiddleware";
import api, { searchAppointments, AppointmentSearchParams } from '@/lib/api';
import { Metadata } from 'next';

interface TimeSlot {
  id: number;
  startTime: string;
  endTime: string;
}

interface Doctor {
  id: number;
  userId: number;
  specialtyId: number | null;
  degree: string;
  experienceYears: number;
  bio: string | null;
  locationId: number | null;
  consultationFee: number | null;
  isAvailable: boolean;
  avgRating: number;
  reviewCount: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  location: {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string | null;
    country: string;
  } | null;
  specialty: {
    id: number;
    name: string;
  } | null;
  availability: {
    id: number;
    dayOfWeek: number;
    isAvailable: boolean;
    timeSlot: TimeSlot;
  }[];
}

interface Patient {
  id: number;
  name: string;
  email: string;
}

interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  timeSlotId: number;
  appointmentType: string;
  status: string;
  patientProblem: string;
  patientAge: number;
  patientGender: string;
  doctor: Doctor;
  patient: Patient;
  timeSlot: TimeSlot;
}

interface Stats {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  completed: number;
}

interface Education {
  id: number;
  degree: string;
  institution: string;
  year: number;
}

interface Experience {
  id: number;
  position: string;
  hospital: string;
  startYear: number;
  endYear: number | null;
}

interface DoctorWithStats extends Doctor {
  totalPatients: number;
  averageRating: number;
}

type SortField = "name" | "specialty" | "experience" | "patients" | "rating";
type SortOrder = "asc" | "desc";

type AppointmentSortField = "id" | "patient" | "doctor" | "date" | "type";
type AppointmentStatus = "all" | "confirmed" | "pending" | "cancelled" | "completed";

// Add this helper function at the top level
function formatTimeDisplay(time: string | null): string {
  if (!time) return 'N/A';
  return time;
}

function AdminDashboardContent() {
  const [activeTab, setActiveTab] = useState("appointments");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<DoctorWithStats[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    completed: 0,
  });


  // New state variables
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [activeActionId, setActiveActionId] = useState<number | null>(null);

  // Update appointment-related state
  const [appointmentSearchTerm, setAppointmentSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus>("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [appointmentSortField, setAppointmentSortField] = useState<AppointmentSortField>("date");
  const [appointmentSortOrder, setAppointmentSortOrder] = useState<SortOrder>("desc");
  const [appointmentPage, setAppointmentPage] = useState(1);
  const [appointmentsPerPage] = useState(10);
  const [activeAppointmentId, setActiveAppointmentId] = useState<number | null>(null);

  // Derived values
  const specialties = useMemo(() => {
    const uniqueSpecialties = new Set(
      doctors.map((d) => d.specialty?.name).filter(Boolean)
    );
    return Array.from(uniqueSpecialties);
  }, [doctors]);

  const locations = useMemo(() => {
    const uniqueLocations = new Set(
      doctors.map((d) => d.location?.city).filter(Boolean)
    );
    return Array.from(uniqueLocations);
  }, [doctors]);

  // Filter and sort doctors
  const filteredDoctors = useMemo(() => {
    return doctors
      .filter((doctor) => {
        const matchesSearch =
          doctor.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.specialty?.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          doctor.degree.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesSpecialty =
          !selectedSpecialty || doctor.specialty?.name === selectedSpecialty;
        const matchesLocation =
          !selectedLocation || doctor.location?.city === selectedLocation;

        return matchesSearch && matchesSpecialty && matchesLocation;
      })
      .sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
          case "name":
            comparison = a.user.name.localeCompare(b.user.name);
            break;
          case "specialty":
            comparison = (a.specialty?.name || "").localeCompare(
              b.specialty?.name || ""
            );
            break;
          case "experience":
            comparison = a.experienceYears - b.experienceYears;
            break;
          case "patients":
            comparison = a.totalPatients - b.totalPatients;
            break;
          case "rating":
            comparison = a.avgRating - b.avgRating;
            break;
        }
        return sortOrder === "asc" ? comparison : -comparison;
      });
  }, [
    doctors,
    searchTerm,
    selectedSpecialty,
    selectedLocation,
    sortField,
    sortOrder,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
  const paginatedDoctors = filteredDoctors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Handle doctor actions
  const handleAction = async (action: string, doctorId: number) => {
    try {
      switch (action) {
        case "edit":
          window.location.href = `/admin/doctors/${doctorId}/edit`;
          break;
        case "delete":
          if (confirm("Are you sure you want to delete this doctor?")) {
            await api.delete(`/admin/doctors/${doctorId}`);
            setDoctors(doctors.filter(d => d.id !== doctorId));
          }
          break;  
        case "toggle-availability":
          const doctor = doctors.find(d => d.id === doctorId);
          if (!doctor) return;

          console.log(doctor)

          const response = await api.patch(`/admin/doctors/${doctorId}/availability`, {
            is_available: !doctor.isAvailable
          });

          if (response.data.error) {
            throw new Error(response.data.error);
          }

          // Update local state
          setDoctors(doctors.map(d => 
            d.id === doctorId ? { ...d, isAvailable: !d.isAvailable } : d
          ));
          break;
      }
    } catch (error: any) {
      console.error('Error handling doctor action:', error);
      alert(error.response?.data?.error || 'Failed to perform action. Please try again.');
    }
    setActiveActionId(null);
  };

  // Filter and sort appointments
  const filteredAppointments = useMemo(() => {
    return appointments
      .filter((appointment) => {
        const matchesSearch =
          appointment.patient.name.toLowerCase().includes(appointmentSearchTerm.toLowerCase()) ||
          appointment.doctor.user.name.toLowerCase().includes(appointmentSearchTerm.toLowerCase()) ||
          appointment.appointmentType.toLowerCase().includes(appointmentSearchTerm.toLowerCase());

        const matchesStatus =
          selectedStatus === "all" || appointment.status === selectedStatus;

        const matchesDate =
          !selectedDate ||
          format(new Date(appointment.appointmentDate), "yyyy-MM-dd") === selectedDate;

        return matchesSearch && matchesStatus && matchesDate;
      })
      .sort((a, b) => {
        let comparison = 0;
        switch (appointmentSortField) {
          case "id":
            comparison = a.id - b.id;
            break;
          case "patient":
            comparison = a.patient.name.localeCompare(b.patient.name);
            break;
          case "doctor":
            comparison = a.doctor.user.name.localeCompare(b.doctor.user.name);
            break;
          case "date":
            comparison = new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime();
            break;
          case "type":
            comparison = a.appointmentType.localeCompare(b.appointmentType);
            break;
        }
        return appointmentSortOrder === "asc" ? comparison : -comparison;
      });
  }, [
    appointments,
    appointmentSearchTerm,
    selectedStatus,
    selectedDate,
    appointmentSortField,
    appointmentSortOrder,
  ]);

  // Appointment pagination
  const totalAppointmentPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);
  const paginatedAppointments = filteredAppointments.slice(
    (appointmentPage - 1) * appointmentsPerPage,
    appointmentPage * appointmentsPerPage
  );

  // Replace fetchAppointments with simpler version
  const fetchAppointments = async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      setAppointments(response.data.appointments);
      setStats({
        total: response.data.stats.total || 0,
        confirmed: response.data.stats.confirmed || 0,
        pending: response.data.stats.pending || 0,
        cancelled: response.data.stats.cancelled || 0,
        completed: response.data.stats.completed || 0
      });
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  // Update useEffect to only fetch data once
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const appointmentsRes = await api.get('/admin/dashboard/stats');

        const doctorsData = appointmentsRes.data.doctors;
        console.log(appointmentsRes.data);

        if (doctorsData.error) throw new Error(doctorsData.error);

        setAppointments(appointmentsRes.data.appointments);
        setStats({
          total: appointmentsRes.data.stats.total || 0,
          confirmed: appointmentsRes.data.stats.confirmed || 0,
          pending: appointmentsRes.data.stats.pending || 0,
          cancelled: appointmentsRes.data.stats.cancelled || 0,
          completed: appointmentsRes.data.stats.completed || 0
        });
        setDoctors(doctorsData.map((doctor: any) => ({
          ...doctor,
          totalPatients: doctor.totalPatients || 0,
          avgRating: doctor.avgRating || 0,
          reviewCount: doctor.reviewCount || 0
        })));
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.error || err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle appointment sorting
  const handleAppointmentSort = (field: AppointmentSortField) => {
    if (appointmentSortField === field) {
      setAppointmentSortOrder(appointmentSortOrder === "asc" ? "desc" : "asc");
    } else {
      setAppointmentSortField(field);
      setAppointmentSortOrder("desc");
    }
  };

  // Handle appointment actions
  const handleAppointmentAction = async (action: string, appointmentId: number) => {
    try {
      switch (action) {
        case 'view':
          window.location.href = `/admin/appointments/${appointmentId}`;
          break;
        case 'confirm':
          if (confirm('Are you sure you want to confirm this appointment?')) {
            const response = await api.patch(`/appointments/${appointmentId}/status`, {
              status: 'confirmed'
            });

            if (response.data.error) {
              throw new Error(response.data.error);
            }

            // Update local state
            setAppointments(appointments.map(apt => 
              apt.id === appointmentId ? { ...apt, status: 'confirmed' } : apt
            ));

            // Update stats
            setStats(prev => ({
              ...prev,
              confirmed: prev.confirmed + 1,
              pending: prev.pending - 1,
            }));
          }
          break;
        case 'complete':
          if (confirm('Are you sure you want to mark this appointment as completed?')) {
            const response = await api.patch(`/appointments/${appointmentId}/status`, {
              status: 'completed'
            });

            if (response.data.error) {
              throw new Error(response.data.error);
            }

            // Update local state
            setAppointments(appointments.map(apt => 
              apt.id === appointmentId ? { ...apt, status: 'completed' } : apt
            ));

            // Update stats
            setStats(prev => ({
              ...prev,
              completed: prev.completed + 1,
              confirmed: prev.confirmed - 1,
            }));
          }
          break;
        case 'cancel':
          if (confirm('Are you sure you want to cancel this appointment?')) {
            const currentAppointment = appointments.find(apt => apt.id === appointmentId);
            if (!currentAppointment) return;

            const response = await api.patch(`/appointments/${appointmentId}/status`, {
              status: 'cancelled'
            });

            if (response.data.error) {
              throw new Error(response.data.error);
            }

            // Update local state
            setAppointments(appointments.map(apt => 
              apt.id === appointmentId ? { ...apt, status: 'cancelled' } : apt
            ));

            // Update stats
            setStats(prev => ({
              ...prev,
              cancelled: prev.cancelled + 1,
              [currentAppointment.status === 'confirmed' ? 'confirmed' : 'pending']: 
                prev[currentAppointment.status === 'confirmed' ? 'confirmed' : 'pending'] - 1,
            }));
          }
          break;
      }
    } catch (error: any) {
      console.error('Error handling appointment action:', error);
      alert(error.response?.data?.error || 'Failed to update appointment status. Please try again.');
    }
    setActiveAppointmentId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8 mx-auto">
        <div className="flex flex-col gap-6">
          {/* Header with enhanced search and filters */}
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-gray-500">Manage appointments and doctors</p>
            </div>

            {activeTab === "doctors" && (
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <input
                    type="text"
                    placeholder="Search doctors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary sm:w-64"
                  />
                </div>

                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="h-10 px-4 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">All Specialties</option>
                  {specialties.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="h-10 px-4 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">All Locations</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>

                <Link
                  href="/admin/doctors/create"
                  className="flex items-center justify-center h-10 px-4 text-white rounded-md bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add 
                </Link>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-2 mr-4 bg-blue-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Appointments</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-2 mr-4 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Confirmed</p>
                  <p className="text-2xl font-bold">{stats.confirmed}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-2 mr-4 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-2 mr-4 bg-red-100 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cancelled</p>
                  <p className="text-2xl font-bold">{stats.cancelled}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "appointments"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("appointments")}
            >
              Appointments
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "doctors"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("doctors")}
            >
              Doctors
            </button>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm">
            {activeTab === "appointments" ? (
              <div className="overflow-hidden bg-white rounded-lg shadow">
                <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type="text"
                      placeholder="Search appointments..."
                      value={appointmentSearchTerm}
                      onChange={(e) => setAppointmentSearchTerm(e.target.value)}
                      className="w-full h-10 pl-10 pr-4 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as AppointmentStatus)}
                    className="h-10 px-4 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="h-10 px-4 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left bg-gray-50">
                        <th
                          className="p-4 text-sm font-medium text-gray-500 cursor-pointer"
                          onClick={() => handleAppointmentSort("id")}
                        >
                          <div className="flex items-center">
                            ID
                            {appointmentSortField === "id" &&
                              (appointmentSortOrder === "asc" ? (
                                <ChevronUp className="w-4 h-4 ml-1" />
                              ) : (
                                <ChevronDown className="w-4 h-4 ml-1" />
                              ))}
                          </div>
                        </th>
                        <th
                          className="p-4 text-sm font-medium text-gray-500 cursor-pointer"
                          onClick={() => handleAppointmentSort("patient")}
                        >
                          <div className="flex items-center">
                            Patient
                            {appointmentSortField === "patient" &&
                              (appointmentSortOrder === "asc" ? (
                                <ChevronUp className="w-4 h-4 ml-1" />
                              ) : (
                                <ChevronDown className="w-4 h-4 ml-1" />
                              ))}
                          </div>
                        </th>
                        <th
                          className="p-4 text-sm font-medium text-gray-500 cursor-pointer"
                          onClick={() => handleAppointmentSort("doctor")}
                        >
                          <div className="flex items-center">
                            Doctor
                            {appointmentSortField === "doctor" &&
                              (appointmentSortOrder === "asc" ? (
                                <ChevronUp className="w-4 h-4 ml-1" />
                              ) : (
                                <ChevronDown className="w-4 h-4 ml-1" />
                              ))}
                          </div>
                        </th>
                        <th
                          className="p-4 text-sm font-medium text-gray-500 cursor-pointer"
                          onClick={() => handleAppointmentSort("date")}
                        >
                          <div className="flex items-center">
                            Date
                            {appointmentSortField === "date" &&
                              (appointmentSortOrder === "asc" ? (
                                <ChevronUp className="w-4 h-4 ml-1" />
                              ) : (
                                <ChevronDown className="w-4 h-4 ml-1" />
                              ))}
                          </div>
                        </th>
                        <th className="p-4 text-sm font-medium text-gray-500">
                          Time
                        </th>
                        <th
                          className="p-4 text-sm font-medium text-gray-500 cursor-pointer"
                          onClick={() => handleAppointmentSort("type")}
                        >
                          <div className="flex items-center">
                            Type
                            {appointmentSortField === "type" &&
                              (appointmentSortOrder === "asc" ? (
                                <ChevronUp className="w-4 h-4 ml-1" />
                              ) : (
                                <ChevronDown className="w-4 h-4 ml-1" />
                              ))}
                          </div>
                        </th>
                        <th className="p-4 text-sm font-medium text-gray-500">
                          Status
                        </th>
                        <th className="p-4 text-sm font-medium text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {paginatedAppointments.map((appointment) => (
                        <tr key={appointment.id}>
                          <td className="p-4 text-sm">#{appointment.id}</td>
                          <td className="p-4 text-sm font-medium">
                            {appointment.patient.name}
                          </td>
                          <td className="p-4 text-sm">
                            {appointment.doctor.user.name}
                          </td>
                          <td className="p-4 text-sm">
                            {format(
                              new Date(appointment.appointmentDate),
                              "dd MMM yyyy"
                            )}
                          </td>
                          <td className="p-4 text-sm">
                            {formatTimeDisplay(appointment.timeSlot.startTime)} - {formatTimeDisplay(appointment.timeSlot.endTime)}
                          </td>
                          <td className="p-4 text-sm">
                            {appointment.appointmentType}
                          </td>
                          <td className="p-4 text-sm">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                appointment.status === "confirmed"
                                  ? "bg-green-100 text-green-800"
                                  : appointment.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : appointment.status === "completed"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {appointment.status.charAt(0).toUpperCase() +
                                appointment.status.slice(1)}
                            </span>
                          </td>
                          <td className="p-4 text-sm">
                            <div className="relative">
                              <button
                                onClick={() =>
                                  setActiveAppointmentId(
                                    activeAppointmentId === appointment.id ? null : appointment.id
                                  )
                                }
                                className="p-1 text-gray-500 rounded-full hover:bg-gray-100"
                              >
                                <MoreHorizontal className="w-5 h-5" />
                              </button>

                              {activeAppointmentId === appointment.id && (
                                <div className="absolute right-0 z-10 w-48 py-1 mt-2 bg-white rounded-md shadow-lg">
                                  <button
                                    onClick={() => handleAppointmentAction("view", appointment.id)}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </button>
                                  {appointment.status === "pending" && (
                                    <button
                                      onClick={() => handleAppointmentAction("confirm", appointment.id)}
                                      className="flex items-center w-full px-4 py-2 text-sm text-green-600 hover:bg-gray-100"
                                    >
                                      <Check className="w-4 h-4 mr-2" />
                                      Confirm Appointment
                                    </button>
                                  )}
                                  {appointment.status === "confirmed" && (
                                    <button
                                      onClick={() => handleAppointmentAction("complete", appointment.id)}
                                      className="flex items-center w-full px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                                    >
                                      <Check className="w-4 h-4 mr-2" />
                                      Mark as Completed
                                    </button>
                                  )}
                                  {appointment.status !== "cancelled" && (
                                    <button
                                      onClick={() => handleAppointmentAction("cancel", appointment.id)}
                                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                    >
                                      <X className="w-4 h-4 mr-2" />
                                      Cancel Appointment
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add pagination section back */}
                <div className="flex items-center justify-between px-4 py-3 bg-white border-t">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-700">
                      Showing {(appointmentPage - 1) * appointmentsPerPage + 1} to{" "}
                      {Math.min(appointmentPage * appointmentsPerPage, filteredAppointments.length)} of{" "}
                      {filteredAppointments.length} appointments
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setAppointmentPage((page) => Math.max(1, page - 1))}
                      disabled={appointmentPage === 1}
                      className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalAppointmentPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setAppointmentPage(page)}
                        className={`px-3 py-1 text-sm font-medium rounded-md ${
                          appointmentPage === page
                            ? "bg-primary text-white"
                            : "text-gray-700 bg-white border hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setAppointmentPage((page) => Math.min(totalAppointmentPages, page + 1))}
                      disabled={appointmentPage === totalAppointmentPages}
                      className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden bg-white rounded-lg shadow">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left bg-gray-50">
                        <th className="p-4 text-sm font-medium text-gray-500">
                          ID
                        </th>
                        <th
                          className="p-4 text-sm font-medium text-gray-500 cursor-pointer"
                          onClick={() => handleSort("name")}
                        >
                          <div className="flex items-center">
                            Name
                            {sortField === "name" &&
                              (sortOrder === "asc" ? (
                                <ChevronUp className="w-4 h-4 ml-1" />
                              ) : (
                                <ChevronDown className="w-4 h-4 ml-1" />
                              ))}
                          </div>
                        </th>
                        <th
                          className="p-4 text-sm font-medium text-gray-500 cursor-pointer"
                          onClick={() => handleSort("specialty")}
                        >
                          <div className="flex items-center">
                            Specialty
                            {sortField === "specialty" &&
                              (sortOrder === "asc" ? (
                                <ChevronUp className="w-4 h-4 ml-1" />
                              ) : (
                                <ChevronDown className="w-4 h-4 ml-1" />
                              ))}
                          </div>
                        </th>
                        <th className="p-4 text-sm font-medium text-gray-500">
                          Degree
                        </th>
                        <th
                          className="p-4 text-sm font-medium text-gray-500 cursor-pointer"
                          onClick={() => handleSort("experience")}
                        >
                          <div className="flex items-center">
                            Experience
                            {sortField === "experience" &&
                              (sortOrder === "asc" ? (
                                <ChevronUp className="w-4 h-4 ml-1" />
                              ) : (
                                <ChevronDown className="w-4 h-4 ml-1" />
                              ))}
                          </div>
                        </th>
                        <th className="p-4 text-sm font-medium text-gray-500">
                          Location
                        </th>
                        <th className="p-4 text-sm font-medium text-gray-500">
                          Fee
                        </th>
                        <th className="p-4 text-sm font-medium text-gray-500">
                          Status
                        </th>
                        <th
                          className="p-4 text-sm font-medium text-gray-500 cursor-pointer"
                          onClick={() => handleSort("patients")}
                        >
                          <div className="flex items-center">
                            Patients
                            {sortField === "patients" &&
                              (sortOrder === "asc" ? (
                                <ChevronUp className="w-4 h-4 ml-1" />
                              ) : (
                                <ChevronDown className="w-4 h-4 ml-1" />
                              ))}
                          </div>
                        </th>
                        <th
                          className="p-4 text-sm font-medium text-gray-500 cursor-pointer"
                          onClick={() => handleSort("rating")}
                        >
                          <div className="flex items-center">
                            Rating
                            {sortField === "rating" &&
                              (sortOrder === "asc" ? (
                                <ChevronUp className="w-4 h-4 ml-1" />
                              ) : (
                                <ChevronDown className="w-4 h-4 ml-1" />
                              ))}
                          </div>
                        </th>
                        <th className="p-4 text-sm font-medium text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {paginatedDoctors.map((doctor) => (
                        <tr key={doctor.id}>
                          <td className="p-4 text-sm">#{doctor.id}</td>
                          <td className="p-4 text-sm font-medium">
                            {doctor.user.name}
                          </td>
                          <td className="p-4 text-sm">
                            {doctor.specialty?.name || "Not specified"}
                          </td>
                          <td className="p-4 text-sm">{doctor.degree}</td>
                          <td className="p-4 text-sm">
                            {doctor.experienceYears} Years
                          </td>
                          <td className="p-4 text-sm">
                            {doctor.location
                              ? `${doctor.location.name}, ${doctor.location.city}`
                              : "Not specified"}
                          </td>
                          <td className="p-4 text-sm">
                            {doctor.consultationFee
                              ? `₹${doctor.consultationFee}`
                              : "Not set"}
                          </td>
                          <td className="p-4 text-sm">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                doctor.isAvailable
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {doctor.isAvailable ? "Available" : "Unavailable"}
                            </span>
                          </td>
                          <td className="p-4 text-sm">
                            {doctor.totalPatients}
                          </td>
                          <td className="p-4 text-sm">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                              {doctor.avgRating}
                              <span className="ml-1 text-gray-500">
                                ({doctor.reviewCount})
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-sm">
                            <div className="relative">
                              <button
                                onClick={() =>
                                  setActiveActionId(
                                    activeActionId === doctor.id
                                      ? null
                                      : doctor.id
                                  )
                                }
                                className="p-1 text-gray-500 rounded-full hover:bg-gray-100"
                              >
                                <MoreHorizontal className="w-5 h-5" />
                              </button>

                              {activeActionId === doctor.id && (
                                <div className="absolute right-0 z-10 w-48 py-1 mt-2 bg-white rounded-md shadow-lg">
                                  <Link
                                    href={`/admin/doctors/${doctor.id}`}
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <Search className="w-4 h-4 mr-2" />
                                    View Details
                                  </Link>
                                  <button
                                    onClick={() =>
                                      handleAction("edit", doctor.id)
                                    }
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Doctor
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleAction(
                                        "toggle-availability",
                                        doctor.id
                                      )
                                    }
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <Ban className="w-4 h-4 mr-2" />
                                    {doctor.isAvailable
                                      ? "Mark Unavailable"
                                      : "Mark Available"}
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleAction("delete", doctor.id)
                                    }
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                  >
                                    <Trash className="w-4 h-4 mr-2" />
                                    Delete Doctor
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 bg-white border-t">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-700">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                      {Math.min(
                        currentPage * itemsPerPage,
                        filteredDoctors.length
                      )}{" "}
                      of {filteredDoctors.length} doctors
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        setCurrentPage((page) => Math.max(1, page - 1))
                      }
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 text-sm font-medium rounded-md ${
                            currentPage === page
                              ? "bg-primary text-white"
                              : "text-gray-700 bg-white border hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                    <button
                      onClick={() =>
                        setCurrentPage((page) => Math.min(totalPages, page + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminMiddleware>
      <AdminDashboardContent />
    </AdminMiddleware>
  );
}
