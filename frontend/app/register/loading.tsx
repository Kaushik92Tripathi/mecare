export default function LoadingSkeleton() {
  return (
    <div className="relative flex items-center justify-center min-h-screen">
      <div className="relative z-10 w-full max-w-md p-4 border border-white/40 rounded-xl shadow-lg backdrop-blur-lg bg-white/10 animate-pulse">
        <div className="h-8 mx-auto mb-4 bg-gray-200 rounded w-28"></div>
        <div className="h-4 mx-auto mb-4 bg-gray-200 rounded w-48"></div>
        
        <div className="space-y-3">
          {/* Name field */}
          <div className="space-y-0.5">
            <div className="h-4 mb-1 bg-gray-200 rounded w-14"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>

          {/* Email field */}
          <div className="space-y-0.5">
            <div className="h-4 mb-1 bg-gray-200 rounded w-14"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>

          {/* Password field */}
          <div className="space-y-0.5">
            <div className="h-4 mb-1 bg-gray-200 rounded w-20"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>

          {/* Confirm Password field */}
          <div className="space-y-0.5">
            <div className="h-4 mb-1 bg-gray-200 rounded w-32"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>

          {/* Submit button */}
          <div className="h-10 bg-gray-200 rounded"></div>

          {/* Divider */}
          <div className="relative py-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <div className="h-4 px-2 bg-gray-200 rounded w-36"></div>
            </div>
          </div>

          {/* Google button */}
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  )
} 