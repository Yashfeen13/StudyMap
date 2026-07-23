'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getOrCreateSessionId } from '@/lib/session';
import CourseCard from '@/components/CourseCard';
import EmptyState from '@/components/EmptyState';
import { CourseCardSkeleton } from '@/components/LoadingSkeleton';
import type { CourseWithProgress, Course, DbStudyPlan, TopicCompletion } from '@/lib/types';
import { BookOpen, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    setLoading(true);
    const supabase = createClient();
    const sessionId = getOrCreateSessionId();

    // Fetch courses
    const { data: rawCourses, error: cErr } = await supabase
      .from('courses')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (cErr || !rawCourses || rawCourses.length === 0) {
      setLoading(false);
      setCourses([]);
      return;
    }

    const courseIds = rawCourses.map((c: Course) => c.id);

    // Fetch latest plans for all courses
    const { data: plans } = await supabase
      .from('study_plans')
      .select('*')
      .in('course_id', courseIds)
      .order('generated_at', { ascending: false });

    // Fetch all completions
    const { data: completions } = await supabase
      .from('topic_completions')
      .select('*')
      .in('course_id', courseIds);

    // Build enriched courses
    const enriched: CourseWithProgress[] = rawCourses.map((course: Course) => {
      // Most recent plan for this course
      const coursePlans = (plans || []).filter(
        (p: DbStudyPlan) => p.course_id === course.id
      );
      const latestPlan = coursePlans[0] ?? null;

      const allTopics = latestPlan
        ? latestPlan.plan_json.weeks.flatMap((w: { topics: string[] }) => w.topics)
        : [];

      const courseCompletions = (completions || [])
        .filter((tc: TopicCompletion) => tc.course_id === course.id)
        .map((tc: TopicCompletion) => tc.topic_name);

      const completedCount = courseCompletions.filter((t: string) =>
        allTopics.includes(t)
      ).length;

      return {
        ...course,
        latestPlan,
        completedTopics: courseCompletions,
        totalTopics: allTopics.length,
        completedCount,
      };
    });

    setCourses(enriched);
    setLoading(false);
  }

  const totalTopics = courses.reduce((s, c) => s + c.totalTopics, 0);
  const completedTopics = courses.reduce((s, c) => s + c.completedCount, 0);
  const overallPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-glow">
            <GraduationCap size={20} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            My <span className="gradient-text">Study Dashboard</span>
          </h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 ml-[52px]">
          AI-powered weekly plans from your course syllabi
        </p>
      </div>

      {/* Stats bar */}
      {!loading && courses.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Courses', value: courses.length, icon: BookOpen },
            { label: 'Topics Done', value: `${completedTopics}/${totalTopics}`, icon: null },
            { label: 'Overall Progress', value: `${overallPct}%`, icon: null },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-soft border border-slate-100 dark:border-slate-800 text-center"
            >
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {stat.value}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Course grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
          {/* Add more card */}
          <Link
            href="/add-course"
            className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-soft border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all duration-200 group min-h-[160px]"
            aria-label="Add a new course"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950 transition-colors">
              <span className="text-2xl text-slate-400 group-hover:text-indigo-500 transition-colors">+</span>
            </div>
            <span className="text-sm font-medium text-slate-400 group-hover:text-indigo-500 transition-colors">
              Add Course
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
