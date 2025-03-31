export interface Specialty {
  id: number;
  name: string;
}

export interface Location {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string | null;
  country: string;
}

export interface Doctor {
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
    profilePicture: string | null;
  };
  specialty: {
    id: number;
    name: string;
  } | null;
  location: {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string | null;
  } | null;
  availability?: {
    dayOfWeek: number;
    timeSlotId: number;
    startTime: string;
    endTime: string;
  }[];
}