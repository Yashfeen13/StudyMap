'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getOrCreateSessionId } from '@/lib/session';
import WeekCard from '@/components/WeekCard';
import ReplanButton from '@/components/ReplanButton';
import ProgressRing from '@/components/ProgressRing';
import { PlanPageSkeleton } from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';
import type { Course, DbStudyPlan, StudyPlan, TopicCompletion } from '@/lib/types';
import {
  Calendar,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ArrowLeft,
} from 'lucide-react';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replanError, setReplanError] = useState('');
  const [replanSuccess, setReplanSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    const supabase = createClient();
    const sessionId = getOrCreateSessionId();

    // Verify course belongs to session
    const { data: courseData, error: cErr } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .eq('session_id', sessionId)
      .single();

    if (cErr || !courseData) {
      setError('Course not found or you do not have access to it.');
      setLoading(false);
      return;
    }
    setCourse(courseData);

    // Fetch latest plan
    const { data: plans } = await supabase
      .from('study_plans')
      .select('*')
      .eq('course_id', courseId)
      .order('generated_at', { ascending: false })
      .limit(1);

    if (plans && plans.length > 0) {
      setPlan((plans[0] as DbStudyPlan).plan_json);
    }

    // Fetch completions
    const { data: completions } = await supabase
      .from('topic_completions')
      .select('topic_name')
      .eq('course_id', courseId);

    setCompletedTopics(
      (completions as Pick<TopicCompletion, 'topic_name'>[] || []).map(
        (tc) => tc.topic_name
      )
    );

    setLoading(false);
  }, [courseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleTopic = (topic: string, completed: boolean) => {
    setCompletedTopics((prev) =>
      completed ? [...prev, topic] : prev.filter((t) => t !== topic)
    );
  };

  const handleReplanSuccess = (newPlan: StudyPlan) => {
    setPlan(newPlan);
    setReplanError('');
    setReplanSuccess(true);
    setTimeout(() => setReplanSuccess(false), 3000);
    // Scroll to top of plan
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  const handleDeleteCourse = async () => {
    if (!deleteConfirm) { setDeleteConfirm(true); return; }
    const supabase = createClient();
    const { error } = await supabase.from('courses').delete().eq('id', courseId);
    if (error) { setError('Failed to delete course.'); return; }
    router.push('/');
  };

  // Computed
  const allTopics = plan?.weeks.flatMap((w) => w.topics) ?? [];
  const totalTopics = allTopics.length;
  const completedCount = completedTopics.filter((t) => allTopics.includes(t)).length;
  const pct = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

  const deadlineLabel = course?.exam_date
    ? new Date(course.exam_date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const daysLeft = course?.exam_date
    ? Math.ceil(
        (new Date(course.exam_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : null;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="skeleton h-8 w-64 rounded mb-2" />
        <div className="skeleton h-4 w-40 rounded mb-8" />
        <PlanPageSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20">
        <EmptyState
          title="Oops!"
          description={error}
          showAction={false}
        />
        <div className="flex justify-center mt-6">
          <Link href="/" className="btn-secondary flex items-center gap-2">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-500 transition-colors mb-6"
        aria-label="Back to dashboard"
      >
        <ArrowLeft size={14} /> Dashboard
      </Link>

      {/* Course header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 mb-6">
        <div className="flex items-start gap-5">
          {/* Progress ring */}
          <div className="flex-shrink-0">
            <ProgressRing percentage={pct} size={72} strokeWidth={7} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen size={15} className="text-indigo-500 flex-shrink-0" />
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">
                Course
              </p>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
              {course?.name}
            </h1>

            <div className="flex flex-wrap gap-3 text-sm">
              <span className="text-slate-500 dark:text-slate-400">
                {completedCount}/{totalTopics} topics
              </span>
              {deadlineLabel && (
                <span
                  className={`flex items-center gap-1 ${
                    daysLeft !== null && daysLeft < 7
                      ? 'text-red-500'
                      : daysLeft !== null && daysLeft < 21
                      ? 'text-amber-500'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  <Calendar size={13} />
                  {deadlineLabel}
                  {daysLeft !== null && daysLeft >= 0 && (
                    <span className="text-xs opacity-75 ml-0.5">({daysLeft}d)</span>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="mt-5">
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Action bar */}
      {plan && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            {replanSuccess && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 font-medium animate-fade-in">
                <CheckCircle2 size={14} />
                Plan updated!
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ReplanButton
              courseId={courseId}
              syllabusText={course?.syllabus_text ?? ''}
              courseName={course?.name ?? ''}
              examDate={course?.exam_date}
              completedTopics={completedTopics}
              currentPlan={plan}
              onSuccess={handleReplanSuccess}
              onError={setReplanError}
            />
            <button
              onClick={handleDeleteCourse}
              className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl transition-all duration-200 ${
                deleteConfirm
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'text-slate-400 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30'
              }`}
              aria-label={deleteConfirm ? 'Confirm delete course' : 'Delete course'}
            >
              <Trash2 size={14} />
              {deleteConfirm ? 'Confirm' : 'Delete'}
            </button>
          </div>
        </div>
      )}

      {/* Replan error */}
      {replanError && (
        <div
          role="alert"
          className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl mb-4 animate-fade-in"
        >
          <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400">{replanError}</p>
        </div>
      )}

      {/* Weekly plan */}
      {plan ? (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
            Weekly Plan — {plan.weeks.length} weeks
          </h2>
          {plan.weeks.map((week, i) => (
            <WeekCard
              key={`${week.week}-${i}`}
              week={week}
              completedTopics={completedTopics}
              courseId={courseId}
              onToggleTopic={handleToggleTopic}
              defaultOpen={i === 0}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No plan yet"
          description="Something went wrong generating your plan. Go back and try adding the course again."
          showAction={false}
        />
      )}

      {/* Syllabus preview (collapsed) */}
      {course?.syllabus_text && (
        <details className="mt-8 group">
          <summary className="cursor-pointer text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors font-medium list-none flex items-center gap-1.5">
            <span className="group-open:rotate-90 transition-transform inline-block">›</span>
            View original syllabus
          </summary>
          <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
            {course.syllabus_text}
          </div>
        </details>
      )}
    </div>
  );
}
