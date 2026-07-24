import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import AddCourseForm from '@/components/AddCourseForm';
import { BookOpen, Sparkles, FileText, Calendar } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Add Course — StudyMap',
  description: 'Add a new course and let AI generate your personalized weekly study plan from the syllabus.',
};

export default function AddCoursePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid lg:grid-cols-5 gap-10 items-start">
        {/* Left: Info panel */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-500 transition-colors mb-6"
              aria-label="Back to dashboard"
            >
              ← Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 leading-tight">
              Add a{' '}
              <span className="gradient-text">New Course</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Paste or upload your course syllabus, set a deadline, and AI will
              build you a smart week-by-week study plan.
            </p>
          </div>

          {/* How it works */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-soft border border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
              <Sparkles size={14} className="text-indigo-500" />
              How it works
            </h2>
            <ol className="space-y-4">
              {[
                {
                  icon: FileText,
                  title: 'Paste your syllabus',
                  desc: 'Copy-paste the syllabus text or upload a PDF/TXT file.',
                },
                {
                  icon: Sparkles,
                  title: 'AI reads it',
                  desc: 'Gemini 3.5 Flash extracts all topics, weights them by importance.',
                },
                {
                  icon: Calendar,
                  title: 'Get a weekly plan',
                  desc: 'Receive a structured schedule up to your exam date.',
                },
                {
                  icon: BookOpen,
                  title: 'Adapt as you go',
                  desc: 'Tick off topics and hit Replan — AI redistributes the rest.',
                },
              ].map((step, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <step.icon size={13} className="text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {step.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Right: Form */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl shadow-soft-lg border border-slate-100 dark:border-slate-800 p-8">
          <AddCourseForm />
        </div>
      </div>
    </div>
  );
}
