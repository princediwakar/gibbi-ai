// Path: app/insights/[exam]/most-failed-concepts/loading.tsx

export default function MostFailedConceptsLoading() {
  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        <div className="h-4 w-32 bg-slate-800 rounded animate-pulse mb-6" />
        <div className="mb-8">
          <div className="h-8 w-80 bg-slate-800 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-96 bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="rounded-xl border border-white/5 bg-slate-900 overflow-hidden">
          <div className="border-b border-white/5 bg-slate-900 px-4 py-3">
            <div className="flex gap-8">
              <div className="h-3 w-8 bg-slate-800 rounded animate-pulse" />
              <div className="h-3 w-24 bg-slate-800 rounded animate-pulse" />
              <div className="h-3 w-20 bg-slate-800 rounded animate-pulse" />
              <div className="h-3 w-16 bg-slate-800 rounded animate-pulse" />
            </div>
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="border-b border-white/5 px-4 py-3 flex items-center gap-4"
            >
              <div className="h-4 w-6 bg-slate-800 rounded animate-pulse" />
              <div className="h-4 w-40 bg-slate-800 rounded animate-pulse" />
              <div className="flex-1">
                <div className="h-2 w-24 bg-slate-800 rounded-full animate-pulse" />
              </div>
              <div className="h-4 w-12 bg-slate-800 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
