"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Phone, Lock, GraduationCap, Stethoscope, Clock, DollarSign, MapPin, Upload, X } from "lucide-react"
import Image from "next/image"
import { createDoctor, type CreateDoctorData } from "@/lib/api"

interface FormData extends CreateDoctorData {}

function CreateDoctorForm() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    specialty_id: "",
    degree: "",
    experience_years: "",
    bio: "",
    location_id: "",
    consultation_fee: "",
    profile_picture: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convert to JPEG with 0.7 quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit before compression
          setError("Image size should be less than 5MB");
          return;
        }

        // Compress the image
        const compressedImage = await compressImage(file);
        
        // Check compressed size (base64 string length * 0.75 gives approximate byte size)
        const approximateSize = (compressedImage.length * 0.75) / (1024 * 1024); // size in MB
        if (approximateSize > 1) { // 1MB limit after compression
          setError("Image is too large even after compression. Please choose a smaller image.");
          return;
        }

        setPreviewUrl(compressedImage);
        setFormData(prev => ({
          ...prev,
          profile_picture: compressedImage
        }));
      } catch (error) {
        console.error('Error compressing image:', error);
        setError("Failed to process image. Please try another one.");
      }
    }
  };

  const removeImage = () => {
    setPreviewUrl("")
    setFormData(prev => ({
      ...prev,
      profile_picture: ""
    }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Validate required fields
      const requiredFields = ['name', 'email', 'password', 'specialty_id', 'degree', 'experience_years', 'bio'] as const
      for (const field of requiredFields) {
        if (!formData[field]) {
          throw new Error(`${field.replace('_', ' ')} is required`)
        }
      }

      // Create doctor using the API function
      const response = await createDoctor(formData)

      if (response.success) {
        router.push("/admin/dashboard")
      } else {
        throw new Error(response.message || 'Failed to create doctor')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create doctor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Doctor</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-4 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center p-6 border-2 border-dashed rounded-lg border-gray-300">
            <div className="relative w-32 h-32 mb-4">
              {previewUrl ? (
                <>
                  <Image
                    src={previewUrl}
                    alt="Profile preview"
                    fill
                    className="rounded-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center px-4 py-2 text-sm text-white rounded-md bg-primary hover:bg-primary/90"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Photo
            </button>
            <p className="mt-2 text-xs text-gray-500">Recommended: Square JPG, PNG. Max 2MB.</p>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <div className="mt-1 relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm h-10"
                placeholder="Enter doctor's full name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="mt-1 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm h-10"
                placeholder="Enter doctor's email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1 relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleChange}
                className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm h-10"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="specialty_id" className="block text-sm font-medium text-gray-700">
              Specialty
            </label>
            <div className="mt-1 relative">
              <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                id="specialty_id"
                required
                value={formData.specialty_id}
                onChange={handleChange}
                className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm h-10"
              >
                <option value="">Select Specialty</option>
                <option value="1">Cardiology</option>
                <option value="2">Dermatology</option>
                <option value="3">Neurology</option>
                <option value="4">Pediatrics</option>
                <option value="5">Orthopedics</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="degree" className="block text-sm font-medium text-gray-700">
              Degree
            </label>
            <div className="mt-1 relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="degree"
                type="text"
                required
                value={formData.degree}
                onChange={handleChange}
                className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm h-10"
                placeholder="Enter degree (e.g., MBBS, MD)"
              />
            </div>
          </div>

          <div>
            <label htmlFor="experience_years" className="block text-sm font-medium text-gray-700">
              Experience (in years)
            </label>
            <div className="mt-1 relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="experience_years"
                type="number"
                required
                value={formData.experience_years}
                onChange={handleChange}
                className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm h-10"
                placeholder="Enter years of experience"
              />
            </div>
          </div>

          <div>
            <label htmlFor="location_id" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <div className="mt-1 relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                id="location_id"
                required
                value={formData.location_id}
                onChange={handleChange}
                className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm h-10"
              >
                <option value="">Select Location</option>
                <option value="1">Main Hospital</option>
                <option value="2">Downtown Clinic</option>
                <option value="3">North Branch</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="consultation_fee" className="block text-sm font-medium text-gray-700">
              Consultation Fee
            </label>
            <div className="mt-1 relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="consultation_fee"
                type="number"
                required
                value={formData.consultation_fee}
                onChange={handleChange}
                className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm h-10"
                placeholder="Enter consultation fee"
              />
            </div>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
              Bio
            </label>
            <div className="mt-1 relative">
              <textarea
                id="bio"
                required
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="pl-3 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Enter doctor's bio and professional background"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {loading ? "Creating..." : "Create Doctor"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CreateDoctor() {
  return <CreateDoctorForm />
}

