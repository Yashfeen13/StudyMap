'use client';

import Link from 'next/link';
import { BookOpen, Plus } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  showAction?: boolean;
}

export default function EmptyState({
  title = 'No courses yet',
  description = "Add your first course and let AI turn your syllabus into a smart weekly study plan.",
  showAction = true,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 px-6 animate-fade-in">
      {/* Illustration */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-3xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center shadow-soft">
          <BookOpen size={40} className="text-indigo-400 dark:text-indigo-500" />
        </div>
        {/* Decorative dots */}
        <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-indigo-200 dark:bg-indigo-800" />
        <div className="absolute -bottom-1 -left-3 w-3 h-3 rounded-full bg-violet-200 dark:bg-violet-800" />
        <div className="absolute top-4 -left-5 w-2 h-2 rounded-full bg-blue-200 dark:bg-blue-800" />
      </div>

      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">{title}</h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed mb-8">
        {description}
      </p>

      {showAction && (
        <Link
          href="/add-course"
          className="btn-primary flex items-center gap-2"
          aria-label="Add your first course"
        >
          <Plus size={18} />
          Add Your First Course
        </Link>
      )}
    </div>
  );
}
