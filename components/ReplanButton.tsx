'use client';

import { useState } from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import type { StudyPlan } from '@/lib/types';

interface ReplanButtonProps {
  courseId: string;
  syllabusText: string;
  courseName: string;
  examDate?: string | null;
  completedTopics: string[];
  currentPlan: StudyPlan;
  onSuccess: (newPlan: StudyPlan) => void;
  onError: (msg: string) => void;
}

export default function ReplanButton({
  courseId,
  syllabusText,
  courseName,
  examDate,
  completedTopics,
  currentPlan,
  onSuccess,
  onError,
}: ReplanButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleReplan = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'replan',
          courseId,
          syllabusText,
          courseName,
          examDate: examDate ?? undefined,
          completedTopics,
          currentPlan,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        onError(data.error || 'Replan failed. Please try again.');
        return;
      }
      onSuccess(data.plan);
    } catch {
      onError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleReplan}
      disabled={loading}
      aria-label="Re-plan remaining topics with AI"
      className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-5 py-2.5 rounded-2xl transition-all duration-200 shadow-soft hover:shadow-soft-lg active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 text-sm"
    >
      {loading ? (
        <>
          <RefreshCw size={15} className="animate-spin" />
          <span>Replanning…</span>
        </>
      ) : (
        <>
          <Sparkles size={15} />
          <span>Replan Remaining</span>
        </>
      )}
    </button>
  );
}
