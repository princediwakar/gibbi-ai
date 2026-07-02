// Path: app/insights/loading.tsx

export default function InsightsLoading() {
  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 animate-pulse mx-auto mb-4" />
          <div className="h-8 w-64 bg-slate-800 rounded-lg animate-pulse mx-auto mb-3" />
          <div className="h-4 w-96 bg-slate-800 rounded animate-pulse mx-auto" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/5 bg-slate-900 p-6"
            >
              <div className="h-6 w-28 bg-slate-800 rounded animate-pulse mb-2" />
              <div className="h-3 w-20 bg-slate-800 rounded animate-pulse mb-5" />
              <div className="space-y-2">
                <div className="h-4 w-40 bg-slate-800 rounded animate-pulse" />
                <div className="h-4 w-32 bg-slate-800 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
