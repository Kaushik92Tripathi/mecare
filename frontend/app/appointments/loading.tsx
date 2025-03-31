export default function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="overflow-hidden bg-white rounded-lg shadow-sm animate-pulse">
          <div className="p-4 text-center">
            <div className="flex justify-center mb-2">
              <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
            </div>
            <div className="h-6 mx-auto mb-1 bg-gray-200 rounded w-36"></div>
            <div className="flex items-center justify-center mb-2">
              <div className="h-4 mx-auto bg-gray-200 rounded w-28"></div>
            </div>
            <div className="flex items-center justify-center mb-4 space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <div key={star} className="w-4 h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  )
} 