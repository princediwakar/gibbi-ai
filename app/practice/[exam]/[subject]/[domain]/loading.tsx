// Path: app/practice/[exam]/[subject]/[domain]/loading.tsx

export default function PracticePageLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Breadcrumb skeleton */}
      <div className="mb-6 flex items-center gap-2">
        <div className="h-4 w-12 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-4 text-slate-300 dark:text-slate-700">/</div>
        <div className="h-4 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-4 text-slate-300 dark:text-slate-700">/</div>
        <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-4 text-slate-300 dark:text-slate-700">/</div>
        <div className="h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Page heading skeleton */}
      <div className="mb-2 h-8 w-2/3 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="mb-8 h-5 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-slate-900" />

      {/* Question card skeletons */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950"
        >
          {/* Question header */}
          <div className="mb-4 flex items-center gap-2">
            <div className="h-5 w-8 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-5 w-20 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-5 w-16 animate-pulse rounded-full bg-slate-100 dark:bg-slate-900" />
          </div>

          {/* Question text */}
          <div className="mb-5 space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-900" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100 dark:bg-slate-900" />
          </div>

          {/* Option buttons */}
          {[1, 2, 3, 4].map((j) => (
            <div
              key={j}
              className="mb-2.5 flex items-center gap-3 rounded-lg border border-slate-200 p-3.5 dark:border-slate-800"
            >
              <div className="h-6 w-6 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100 dark:bg-slate-900" />
            </div>
          ))}

          {/* Explanation area */}
          <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="mb-2 h-3 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-900" />
              <div className="h-3.5 w-5/6 animate-pulse rounded bg-slate-100 dark:bg-slate-900" />
              <div className="h-3.5 w-4/6 animate-pulse rounded bg-slate-100 dark:bg-slate-900" />
            </div>
          </div>
        </div>
      ))}

      {/* CTA skeleton */}
      <div className="mt-10 h-40 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}
