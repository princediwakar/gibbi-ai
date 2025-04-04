export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">From the Community</h1>
        <p className="text-muted-foreground">
          Discover quizzes on all sorts of topics shared by the community.
        </p>
      </div>
      <div className="relative flex gap-2">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 bg-gray-200 rounded-full animate-pulse" />
        <div className="pl-10 flex-1 max-w-md h-10 bg-gray-200 rounded-lg animate-pulse" />
      </div>
      <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/6 animate-pulse" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="border rounded-lg p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                    <div className="h-10 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}