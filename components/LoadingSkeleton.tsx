export function CourseCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-soft border border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-3 mb-5">
        <div className="skeleton w-10 h-10 rounded-xl flex-shrink-0" />
        <div className="skeleton h-4 w-40 rounded" />
      </div>
      <div className="skeleton h-3 w-full rounded mb-2" />
      <div className="skeleton h-1.5 w-full rounded-full mb-1.5" />
      <div className="skeleton h-3 w-28 rounded mt-3" />
    </div>
  );
}

export function WeekCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="skeleton w-9 h-9 rounded-xl flex-shrink-0" />
        <div>
          <div className="skeleton h-4 w-24 rounded mb-1.5" />
          <div className="skeleton h-3 w-36 rounded" />
        </div>
      </div>
    </div>
  );
}

export function PlanPageSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <WeekCardSkeleton key={i} />
      ))}
    </div>
  );
}
