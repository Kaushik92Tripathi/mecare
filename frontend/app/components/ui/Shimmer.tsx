interface ShimmerProps {
  className?: string;
}

export function Shimmer({ className = "" }: ShimmerProps) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}>
      <div className="sr-only">Loading...</div>
    </div>
  );
}

export function DoctorProfileSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-3">
      {/* Doctor Profile Card Skeleton */}
      <div className="md:col-span-1">
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex flex-col items-center">
            {/* Profile Picture */}
            <Shimmer className="w-32 h-32 mb-4 rounded-full" />
            
            {/* Name */}
            <Shimmer className="h-6 w-48 mb-2" />
            
            {/* Degree */}
            <Shimmer className="h-4 w-36 mb-4" />
            
            {/* Rating */}
            <Shimmer className="h-4 w-24 mb-4" />
            
            {/* Book Appointment Button */}
            <Shimmer className="w-full h-10 mb-4" />
            
            {/* Info Section */}
            <div className="w-full pt-4 mt-4 border-t space-y-4">
              <Shimmer className="h-4 w-full" />
              <Shimmer className="h-4 w-3/4" />
              <Shimmer className="h-4 w-1/2" />
            </div>
            
            {/* Bio Section */}
            <div className="w-full pt-4 mt-4 border-t">
              <Shimmer className="h-4 w-24 mb-2" />
              <Shimmer className="h-20 w-full" />
            </div>
            
            {/* Fee Section */}
            <div className="w-full pt-4 mt-4 border-t">
              <Shimmer className="h-4 w-32 mb-2" />
              <Shimmer className="h-8 w-24" />
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section Skeleton */}
      <div className="md:col-span-2">
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <Shimmer className="h-6 w-32 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Shimmer className="h-4 w-48" />
                <Shimmer className="h-4 w-full" />
                <Shimmer className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 