'use client';

import { useState } from 'react';
import { ChevronDown, Clock } from 'lucide-react';
import type { Week } from '@/lib/types';
import TopicCheckbox from './TopicCheckbox';

interface WeekCardProps {
  week: Week;
  completedTopics: string[];
  courseId: string;
  onToggleTopic: (topic: string, completed: boolean) => void;
  defaultOpen?: boolean;
}

export default function WeekCard({
  week,
  completedTopics,
  courseId,
  onToggleTopic,
  defaultOpen = false,
}: WeekCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  const completedInWeek = week.topics.filter((t) =>
    completedTopics.includes(t)
  ).length;
  const allDone = completedInWeek === week.topics.length;
  const pct = week.topics.length > 0
    ? Math.round((completedInWeek / week.topics.length) * 100)
    : 0;

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 ${
        allDone
          ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
      }`}
    >
      {/* Week header — clickable */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={`week-${week.week}-content`}
        className="w-full flex items-center justify-between p-5 text-left gap-4 group"
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Week badge */}
          <div
            className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
              allDone
                ? 'bg-emerald-500 text-white'
                : 'bg-indigo-600 text-white'
            }`}
          >
            {week.week}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Week {week.week}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {completedInWeek}/{week.topics.length} topics · {week.hours_recommended}h
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Hours badge */}
          <span className="hidden sm:flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-full">
            <Clock size={11} />
            {week.hours_recommended}h
          </span>

          {/* Mini progress */}
          <div className="hidden sm:block w-16">
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Topics list */}
      {open && (
        <div
          id={`week-${week.week}-content`}
          className="px-5 pb-5 space-y-2 animate-fade-in"
        >
          <div className="h-px bg-slate-100 dark:bg-slate-800 mb-3" />
          {week.topics.map((topic) => (
            <TopicCheckbox
              key={topic}
              topic={topic}
              completed={completedTopics.includes(topic)}
              courseId={courseId}
              onToggle={onToggleTopic}
            />
          ))}
        </div>
      )}
    </div>
  );
}
