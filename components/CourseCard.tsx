'use client';

import Link from 'next/link';
import { Calendar, ChevronRight, BookOpen } from 'lucide-react';
import type { CourseWithProgress } from '@/lib/types';

interface CourseCardProps {
  course: CourseWithProgress;
}

export default function CourseCard({ course }: CourseCardProps) {
  const pct =
    course.totalTopics > 0
      ? Math.round((course.completedCount / course.totalTopics) * 100)
      : 0;

  const deadlineLabel = course.exam_date
    ? new Date(course.exam_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const daysLeft = course.exam_date
    ? Math.ceil(
        (new Date(course.exam_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : null;

  const urgencyColor =
    daysLeft === null
      ? 'text-slate-400'
      : daysLeft < 7
      ? 'text-red-500 dark:text-red-400'
      : daysLeft < 21
      ? 'text-amber-500 dark:text-amber-400'
      : 'text-emerald-600 dark:text-emerald-400';

  return (
    <Link
      href={`/courses/${course.id}`}
      className="group block bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-soft card-hover border border-slate-100 dark:border-slate-800 focus-visible:ring-2 focus-visible:ring-indigo-500"
      aria-label={`View study plan for ${course.name}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center flex-shrink-0">
            <BookOpen size={18} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-base truncate">
            {course.name}
          </h3>
        </div>
        <ChevronRight
          size={18}
          className="text-slate-400 group-hover:text-indigo-500 transition-colors flex-shrink-0 mt-1"
        />
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Progress
          </span>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            {pct}%
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
          {course.completedCount} / {course.totalTopics} topics done
        </p>
      </div>

      {/* Deadline */}
      {deadlineLabel && (
        <div className={`flex items-center gap-1.5 text-xs font-medium ${urgencyColor}`}>
          <Calendar size={12} />
          <span>
            {deadlineLabel}
            {daysLeft !== null && daysLeft >= 0 && (
              <span className="ml-1 opacity-75">({daysLeft}d left)</span>
            )}
            {daysLeft !== null && daysLeft < 0 && (
              <span className="ml-1 opacity-75">(passed)</span>
            )}
          </span>
        </div>
      )}

      {!course.latestPlan && (
        <div className="mt-3 text-xs text-slate-400 dark:text-slate-500 italic">
          No plan generated yet
        </div>
      )}
    </Link>
  );
}
