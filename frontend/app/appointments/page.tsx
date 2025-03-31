"use client"

import Link from "next/link"
import { Search, Star, StarHalf } from "lucide-react"
import { useState, useEffect } from 'react'
import { getTopDoctors, getAllDoctors } from "@/lib/api"
import { Doctor, Specialty } from "@/types/doctor"
import { toast } from "sonner"
import LoadingSkeleton from "./loading"
import { motion, AnimatePresence } from "framer-motion"

export default function AppointmentsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [selectedRating, setSelectedRating] = useState(0)
  const [selectedExperience, setSelectedExperience] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchTopDoctors = async () => {
    try {
      setLoading(true)
      const doctors = await getTopDoctors()
      setDoctors(doctors)
      setTotalPages(1)
      toast.success('Top doctors loaded successfully')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch top doctors'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 6,
        search: searchTerm,
        ...(selectedSpecialty && { specialty: selectedSpecialty }),
        ...(selectedRating > 0 && { minRating: selectedRating }),
        ...(selectedExperience && { minExperience: selectedExperience })
      }
      
      const response = await getAllDoctors(params)
      
      setDoctors(response.doctors)
      setSpecialties(response.specialties)
      setTotalPages(response.totalPages)
      toast.success('Doctors loaded successfully')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch doctors'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // Initial load - fetch top doctors
  useEffect(() => {
    fetchTopDoctors()
  }, [])

  // Handle filters and search
  useEffect(() => {
    if (!isInitialLoad) {
      fetchDoctors()
    }
  }, [currentPage, selectedSpecialty, selectedRating, selectedExperience, searchTerm, isInitialLoad])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    setIsInitialLoad(false)
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
    setIsInitialLoad(false)
    if (e.target.value === '') {
      fetchTopDoctors()
      setIsInitialLoad(true)
    }
  }

  const handleFilterChange = () => {
    setCurrentPage(1)
    setIsInitialLoad(false)
  }

  const handleResetFilters = () => {
    setSelectedRating(0)
    setSelectedExperience('')
    setSelectedSpecialty('')
    handleFilterChange()
    toast.success('Filters have been reset')
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star
            key={i}
            className="w-4 h-4 text-yellow-400 fill-current"
          />
        )
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <StarHalf
            key={i}
            className="w-4 h-4 text-yellow-400 fill-current"
          />
        )
      } else {
        stars.push(
          <Star
            key={i}
            className="w-4 h-4 text-gray-300"
          />
        )
      }
    }

    return stars
  }

  return (
    <div className="flex flex-col">
      <section className="py-12 bg-white">
        <div className="container px-4 mx-auto text-center md:px-6">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 text-3xl font-bold md:text-4xl"
          >
            Find a doctor at your own ease
          </motion.h1>
          <div className="max-w-xl mx-auto mb-8">
            <form onSubmit={handleSearch} className="flex">
              <div className="relative flex-grow">
                <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Search doctors..."
                  value={searchTerm}
                  onChange={handleSearchInputChange}
                  className="w-full h-12 pl-10 pr-4 border rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <button type="submit" className="h-12 px-6 text-white transition-colors rounded-r-md bg-primary hover:bg-primary/90">
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="container px-4 mx-auto md:px-6">
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-2 text-2xl font-bold text-center md:text-3xl"
          >
            {loading ? 'Loading doctors...' : isInitialLoad ? 'Top Rated Doctors' : `${doctors.length} doctors available`}
          </motion.h2>
          <p className="mb-8 text-center text-gray-500">
            Book appointments with minimum wait time & verified doctor details
          </p>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            {/* Mobile Filters Toggle */}
            <div className="block mb-4 md:hidden">
              <button
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md shadow-sm hover:bg-gray-50"
              >
                {isFiltersOpen ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>

            {/* Filters */}
            <AnimatePresence>
              <motion.div 
                className={`md:col-span-3 ${isFiltersOpen ? 'block' : 'hidden md:block'}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Filter By:</h3>
                    <button 
                      onClick={handleResetFilters}
                      className="text-sm text-primary hover:underline"
                    >
                      Reset
                    </button>
                  </div>

                  {/* Rating Filter */}
                  <div className="mb-6">
                    <h4 className="mb-2 font-medium">Rating</h4>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="rating"
                          value="0"
                          checked={selectedRating === 0}
                          onChange={(e) => {
                            setSelectedRating(Number(e.target.value))
                            handleFilterChange()
                          }}
                          className="w-4 h-4 text-primary"
                        />
                        <span className="ml-2 text-sm">Show all</span>
                      </label>
                      {[4, 4.5].map((rating) => (
                        <label key={rating} className="flex items-center">
                          <input
                            type="radio"
                            name="rating"
                            value={rating}
                            checked={selectedRating === rating}
                            onChange={(e) => {
                              setSelectedRating(Number(e.target.value))
                              handleFilterChange()
                            }}
                            className="w-4 h-4 text-primary"
                          />
                          <span className="ml-2 text-sm flex items-center gap-1">
                            {rating}+ star {renderStars(rating)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Experience Filter */}
                  <div className="mb-6">
                    <h4 className="mb-2 font-medium">Experience</h4>
                    <div className="space-y-2">
                      {[
                        { label: 'Show all', value: '' },
                        { label: '15+ years', value: '15' },
                        { label: '10-15 years', value: '10' },
                        { label: '5-10 years', value: '5' },
                        { label: '3-5 years', value: '3' },
                        { label: '1-3 years', value: '1' }
                      ].map((option) => (
                        <label key={option.value} className="flex items-center">
                          <input
                            type="radio"
                            name="experience"
                            value={option.value}
                            checked={selectedExperience === option.value}
                            onChange={(e) => {
                              setSelectedExperience(e.target.value)
                              handleFilterChange()
                            }}
                            className="w-4 h-4 text-primary"
                          />
                          <span className="ml-2 text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Specialty Filter */}
                  <div>
                    <h4 className="mb-2 font-medium">Specialty</h4>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="specialty"
                          value=""
                          checked={selectedSpecialty === ''}
                          onChange={(e) => {
                            setSelectedSpecialty(e.target.value)
                            handleFilterChange()
                          }}
                          className="w-4 h-4 text-primary"
                        />
                        <span className="ml-2 text-sm">Show All</span>
                      </label>
                      {specialties?.map((specialty) => (
                        <label key={specialty.id} className="flex items-center">
                          <input
                            type="radio"
                            name="specialty"
                            value={specialty.name}
                            checked={selectedSpecialty === specialty.name}
                            onChange={(e) => {
                              setSelectedSpecialty(e.target.value)
                              handleFilterChange()
                            }}
                            className="w-4 h-4 text-primary"
                          />
                          <span className="ml-2 text-sm">{specialty.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Doctor Cards */}
            <div className="md:col-span-9">
              {error ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 text-red-600 bg-red-50 rounded-lg"
                >
                  {error}
                </motion.div>
              ) : loading ? (
                <LoadingSkeleton />
              ) : doctors.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 text-center bg-white rounded-lg shadow-sm"
                >
                  <h3 className="mb-2 text-xl font-medium text-gray-900">No doctors found</h3>
                  <p className="text-gray-500">
                    {isInitialLoad 
                      ? "Unable to load top doctors. Please try again later."
                      : "Try adjusting your search criteria or filters to find more doctors."}
                  </p>
                  {!isInitialLoad && (
                    <button
                      onClick={() => {
                        setSearchTerm('')
                        setSelectedRating(0)
                        setSelectedExperience('')
                        setSelectedSpecialty('')
                        setIsInitialLoad(true)
                        fetchTopDoctors()
                      }}
                      className="mt-4 text-primary hover:underline"
                    >
                      View top doctors instead
                    </button>
                  )}
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <AnimatePresence>
                    {doctors.map((doctor, index) => (
                      <motion.div
                        key={doctor.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        className="overflow-hidden bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="p-4 text-center">
                          <div className="flex justify-center mb-2">
                            <div className="w-24 h-24 overflow-hidden rounded-full">
                              <img
                                src="/default-avatar.png"
                                alt={doctor.name}
                                className="object-cover w-full h-full transition-transform hover:scale-110"
                              />
                            </div>
                          </div>
                          <h3 className="mb-1 text-lg font-medium">{doctor.name}</h3>
                          <div className="flex items-center justify-center mb-2 text-sm text-gray-500">
                            <span>{doctor.specialty?.name || doctor.specialtyName}</span>
                            <span className="mx-2">•</span>
                            <span>{doctor.experienceYears} Years</span>
                          </div>
                          <div className="flex items-center justify-center mb-4">
                            <div className="flex">
                              {renderStars(doctor.avgRating || 0)}
                            </div>
                          </div>
                          <Link
                            href={`/appointments/doctor/${doctor.id}`}
                            className="block w-full py-2 text-center text-white transition-colors rounded-md bg-primary hover:bg-primary/90"
                          >
                            Book Appointment
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Pagination */}
              {!loading && doctors.length > 0 && totalPages > 1 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center mt-8"
                >
                  <nav className="flex items-center space-x-1">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 transition-colors border rounded-md hover:bg-gray-50 disabled:opacity-50"
                    >
                      Prev
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-2 text-sm font-medium border rounded-md transition-colors ${
                          currentPage === i + 1
                            ? 'text-white bg-primary'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 transition-colors border rounded-md hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}