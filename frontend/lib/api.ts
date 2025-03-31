import axios from 'axios';
import { Doctor, Specialty } from "@/types/doctor";
import config from '@/config';

console.log('Current Environment:', process.env.NODE_ENV);
console.log('API URL:', config.apiUrl);

const api = axios.create({
  baseURL: `${config.apiUrl}/api`,  // config.apiUrl already includes /api
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(`API Error (${config.env}):`, {
        data: error.response.data,
        status: error.response.status,
        url: error.config.url
      });
    } else if (error.request) {
      console.error(`Request Error (${config.env}):`, {
        request: error.request,
        message: error.message
      });
    } else {
      console.error(`Error (${config.env}):`, error.message);
    }
    return Promise.reject(error);
  }
);

interface DoctorsResponse {
  doctors: Doctor[];
  total: number;
  totalPages: number;
  currentPage: number;
  specialties: Specialty[];
}

export async function getTopDoctors(): Promise<Doctor[]> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await api.get('/doctors/top');
    return response.data.doctors;
  } catch (error: any) {
    console.error("Error fetching top doctors:", error.message);
    if (error.response?.status === 401) {
      // Handle unauthorized error (token expired or invalid)
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw error;
  }
}

export async function getAllDoctors(params: any): Promise<DoctorsResponse> {
  try {
    
    const response = await api.get('/doctors', { params });
    return {
      doctors: response.data.doctors,
      total: response.data.total,
      totalPages: response.data.totalPages,
      currentPage: response.data.currentPage,
      specialties: response.data.specialties
    };
  } catch (error) {
    console.error("Error fetching all doctors:", error);
    throw error;
  }
}

export async function getDoctorById(id: string | number): Promise<{ doctor: Doctor; availability: any[] }> {
  try {
    if (!id) {
      throw new Error('Doctor ID is required');
    }

    // Convert id to number if it's a string
    const doctorId = typeof id === 'string' ? parseInt(id, 10) : id;
    
    if (isNaN(doctorId)) {
      throw new Error('Invalid doctor ID');
    }

    const response = await api.get(`/doctors/${doctorId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching doctor details:", error);
    throw error;
  }
}

export interface DoctorAppointment {
  id: number;
  appointmentDate: string;
  status: string;
  appointmentType: string;
  patientProblem?: string;
  patientAge: number;
  patientGender: string;
  userId: number;
  patient: {
    name: string;
    email: string;
  };
  timeSlot: {
    startTime: string;
    endTime: string;
  };
}

export async function getDoctorAppointments(doctorId: string | number, status?: string): Promise<{ appointments: DoctorAppointment[] }> {
  try {
    const params = status ? { status } : {};
    const response = await api.get(`/appointments/doctor/${doctorId}/user`, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    throw error;
  }
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  patient: {
    id: number;
    name: string;
  };
}

export async function getDoctorReviews(doctorId: string | number): Promise<{ reviews: Review[] }> {
  try {
    const response = await api.get(`/reviews`, {
      params: { doctorId }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching doctor reviews:", error);
    throw error;
  }
}

export async function createReview(doctorId: string | number, rating: number, comment: string): Promise<{ review: Review }> {
  try {
    const response = await api.post('/reviews', {
      doctorId,
      rating,
      comment
    });
    return response.data;
  } catch (error) {
    console.error("Error creating review:", error);
    throw error;
  }
}

export interface TimeSlot {
  id: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface DateSlot {
  date: string;
  day: string;
  month: string;
  fullDate: string;
  timeSlots: TimeSlot[];
}

export interface Location {
  id: number;
  name: string;
  address: string;
  city: string;
  fullAddress: string;
}

export interface DoctorDetails {
  id: number;
  name: string;
  specialty_name: string;
  location_name: string;
  consultation_fee: string;
}

export async function getDoctorAvailability(doctorId: string | number, date: string): Promise<{ dates: DateSlot[] }> {
  try {
    const response = await api.get(`/doctors/${doctorId}/availability`, {
      params: { date }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching doctor availability:", error);
    throw error;
  }
}

export async function getDoctorLocations(doctorId: string | number): Promise<{ locations: Location[] }> {
  try {
    const response = await api.get('/locations', {
      params: { doctorId }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching doctor locations:", error);
    throw error;
  }
}

export async function createAppointment(data: {
  doctorId: number;
  date: string;
  timeSlotId: number;
  appointmentType: string;
  patientProblem?: string;
  patientAge: number;
  patientGender: string;
}) {
  try {
    const response = await api.post('/appointments', data);
    return response.data;
  } catch (error: any) {
    console.error("Error creating appointment:", error.message);
    throw error;
  }
}

export interface AppointmentDetails {
  id: number;
  appointment_date: string;
  status: string;
  appointment_type: string;
  patient_problem?: string;
  patient_age: number;
  patient_gender: string;
  patient: {
    name: string;
    email: string;
  };
  doctor: {
    id: number;
    name: string;
    email: string;
    degree: string;
    experience_years: number;
    consultation_fee: number;
    specialty: {
      name: string;
    };
    location: {
      name: string;
      address: string;
    };
  };
  time_slot: {
    start_time: string;
    end_time: string;
  };
}

export async function getAppointmentDetails(appointmentId: string | number): Promise<{ appointment: AppointmentDetails }> {
  try {
    const response = await api.get(`/appointments/${appointmentId}`);
    console.log('Appointment details:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching appointment details:", error);
    throw error;
  }
}

export interface UserAppointment {
  id: number;
  appointment_date: string;
  status: string;
  appointment_type: string;
  patient_problem?: string;
  patient_age: number;
  patient_gender: string;
  doctor: {
    id: number;
    name: string;
    email: string;
    degree: string;
    experience_years: number;
    consultation_fee: number;
    specialty: {
      name: string;
    };
    location: {
      name: string;
      address: string;
    };
  };
  time_slot: {
    start_time: string;
    end_time: string;
  };
}

export async function getUserAppointments(): Promise<{ appointments: UserAppointment[] }> {
  try {
    const response = await api.get('/user/appointments');
    return response.data;
  } catch (error) {
    console.error("Error fetching user appointments:", error);
    throw error;
  }
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  profile: {
    phoneNumber?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    dateOfBirth?: string;
    gender?: string;
    bloodGroup?: string;
    medicalHistory?: string;
  };
}

export async function getUserProfile(): Promise<{ user: UserProfile }> {
  try {
    const response = await api.get('/user/profile');
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
}

export async function updateUserProfile(data: Partial<UserProfile>): Promise<{ message: string; profile: any }> {
  try {
    const response = await api.put('/user/profile', data);
    return response.data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

export interface CreateDoctorData {
  name: string;
  email: string;
  password: string;
  specialty_id: string;
  degree: string;
  experience_years: string;
  bio: string;
  location_id: string;
  consultation_fee: string;
  profile_picture?: string;
}

export interface CreateDoctorResponse {
  success: boolean;
  message: string;
  doctorId: number;
}

export async function createDoctor(data: CreateDoctorData): Promise<CreateDoctorResponse> {
  try {
    const response = await api.post('/admin/doctors', data);
    return response.data;
  } catch (error: any) {
    console.error("Error creating doctor:", error);
    
    // Handle specific error cases
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error.response?.status === 401) {
      throw new Error('Unauthorized. Please log in as an admin.');
    } else if (error.response?.status === 400) {
      throw new Error('Invalid data provided. Please check all fields.');
    }
    
    throw new Error('Failed to create doctor. Please try again.');
  }
}

// Admin Doctor Actions
export async function deleteDoctor(doctorId: number): Promise<{ message: string }> {
  try {
    const response = await api.delete(`/admin/doctors/${doctorId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting doctor:", error);
    throw error;
  }
}

export async function toggleDoctorAvailability(doctorId: number, isAvailable: boolean): Promise<{ message: string }> {
  try {
    const response = await api.patch(`/admin/doctors/${doctorId}/availability`, { isAvailable });
    return response.data;
  } catch (error) {
    console.error("Error toggling doctor availability:", error);
    throw error;
  }
}

export async function updateDoctor(doctorId: number, data: Partial<CreateDoctorData>): Promise<{ message: string }> {
  try {
    const response = await api.put(`/admin/doctors/${doctorId}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating doctor:", error);
    throw error;
  }
}

// Admin Appointment Actions
export async function updateAppointmentStatus(appointmentId: number, status: string): Promise<{ message: string }> {
  try {
    const response = await api.patch(`/appointments/${appointmentId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error("Error updating appointment status:", error);
    throw error;
  }
}

// Admin Dashboard Stats
export interface DashboardStats {
  appointments: {
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
    patient: {
      id: number;
      name: string;
      email: string;
    };
    timeSlot: {
      id: number;
      startTime: string;
      endTime: string;
    };
  }[];
  stats: {
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
  };
  doctors: Doctor[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
}

// Search and Filter Appointments
export interface AppointmentSearchParams {
  search?: string;
  status?: string;
  date?: string;
  doctorId?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export async function searchAppointments(params: AppointmentSearchParams): Promise<{
  appointments: any[];
  total: number;
  totalPages: number;
  currentPage: number;
}> {
  try {
    const response = await api.get('/admin/appointments/search', { params });
    return response.data;
  } catch (error) {
    console.error("Error searching appointments:", error);
    throw error;
  }
}

export default api;  

// getDoctorById: async (req, res) => {
//     try {
//       const doctorId = parseInt(req.params.id);

//       if (isNaN(doctorId)) {
//         return res.status(400).json({ error: 'Invalid doctor ID' });
//       }

//       const query = `
//         SELECT 
//           d.*,
//           u.id as user_id,
//           u.name as doctor_name,
//           u.profile_picture,
//           s.id as specialty_id,
//           s.name as specialty_name,
//           l.id as location_id,
//           l.name as location_name,
//           l.address,
//           l.city,
//           l.state
//         FROM doctors d
//         JOIN users u ON d.user_id = u.id
//         LEFT JOIN specialties s ON d.specialty_id = s.id
//         LEFT JOIN locations l ON d.location_id = l.id
//         WHERE d.id = $1
//       `;

//       const result = await pool.query(query, [doctorId]);

//       if (result.rows.length === 0) {
//         return res.status(404).json({ error: 'Doctor not found' });
//       }

//       const doctor = result.rows[0];

//       // Get doctor's availability
//       const availabilityQuery = `
//         SELECT 
//           da.day_of_week,
//           ts.id as time_slot_id,
//           ts.start_time,
//           ts.end_time
//         FROM doctor_availability da
//         JOIN time_slots ts ON da.time_slot_id = ts.id
//         WHERE da.doctor_id = $1 AND da.is_available = true
//         ORDER BY da.day_of_week ASC, ts.start_time ASC
//       `;

//       const availabilityResult = await pool.query(availabilityQuery, [doctorId]);

//       // Format the response
//       res.json({
//         doctor: {
//           id: doctor.id,
//           user_id: doctor.user_id,
//           name: doctor.doctor_name,
//           profile_picture: doctor.profile_picture,
//           degree: doctor.degree,
//           experience_years: doctor.experience_years,
//           avg_rating: doctor.avg_rating,
//           bio: doctor.bio,
//           consultation_fee: doctor.consultation_fee,
//           specialty_id: doctor.specialty_id,
//           specialty_name: doctor.specialty_name,
//           location_id: doctor.location_id,
//           location_name: doctor.location_name,
//           address: doctor.address,
//           city: doctor.city,
//           state: doctor.state
//         },
//         availability: availabilityResult.rows.map(a => ({
//           day_of_week: a.day_of_week,
//           time_slot_id: a.time_slot_id,
//           start_time: formatTime(a.start_time),
//           end_time: formatTime(a.end_time)
//         }))
//       });
//     } catch (error) {
//       console.error('Error fetching doctor details:', error);
//       res.status(500).json({ error: error.message });
//     }
//   },