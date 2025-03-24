// app/quizzes/[quizId]/Loading.tsx
export default function Loading() {
	return (
	  <div className="max-w-2xl mx-auto p-4">
		<div className="animate-pulse space-y-6">
		  {/* Title */}
		  <div className="h-9 bg-gray-200 rounded w-3/4"></div>
  
		  {/* Creator */}
		  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
  
		  {/* Description */}
		  <div className="h-5 bg-gray-200 rounded w-full"></div>
  
		  {/* Grid for Subject, Topic, Difficulty, Questions */}
		  <div className="grid grid-cols-2 gap-4">
			<div className="flex flex-col space-y-1">
			  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
			  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
			</div>
			<div className="flex flex-col space-y-1">
			  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
			  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
			</div>
			<div className="flex flex-col space-y-1">
			  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
			  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
			</div>
			<div className="flex flex-col space-y-1">
			  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
			  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
			</div>
		  </div>
		</div>
	  </div>
	);
  }