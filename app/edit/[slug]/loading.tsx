// app/edit/[slug]/Loading.tsx
export default function Loading() {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-8">
        {/* Header Section: Title and Buttons */}
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse" /> {/* Title */}
          <div className="flex gap-4">
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" /> {/* Start Quiz Button */}
          </div>
        </div>
  
        {/* Tabs and Content */}
        <div className="space-y-6">
          {/* Tabs List */}
          <div className="grid w-full grid-cols-2 gap-2">
            <div className="h-10 bg-gray-200 rounded animate-pulse" /> {/* Details Tab */}
            <div className="h-10 bg-gray-200 rounded animate-pulse" /> {/* Questions Tab */}
            {/* <div className="h-10 bg-gray-200 rounded animate-pulse" /> Settings Tab */}
          </div>
  
          {/* Details Tab Content */}
          <div className="space-y-6 animate-pulse">
            {/* Title */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4" /> {/* Label */}
              <div className="h-10 bg-gray-200 rounded w-full" /> {/* Input/Text */}
            </div>
  
            {/* Description */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4" /> {/* Label */}
              <div className="h-10 bg-gray-200 rounded w-full" /> {/* Input/Text */}
            </div>
  
            {/* Subject */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4" /> {/* Label */}
              <div className="h-10 bg-gray-200 rounded w-full" /> {/* Input/Text */}
            </div>
  
            {/* Topic */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4" /> {/* Label */}
              <div className="h-10 bg-gray-200 rounded w-full" /> {/* Input/Text */}
            </div>
  
            {/* Difficulty */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4" /> {/* Label */}
              <div className="h-10 bg-gray-200 rounded w-3/4" /> {/* Input/Text */}
            </div>
          </div>
        </div>
      </div>
    );
  }