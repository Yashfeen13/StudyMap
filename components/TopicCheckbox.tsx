'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface TopicCheckboxProps {
  topic: string;
  completed: boolean;
  courseId: string;
  onToggle: (topic: string, completed: boolean) => void;
}

export default function TopicCheckbox({
  topic,
  completed,
  courseId,
  onToggle,
}: TopicCheckboxProps) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (loading) return;
    setLoading(true);
    const supabase = createClient();

    try {
      if (!completed) {
        // Mark complete
        const { error } = await supabase
          .from('topic_completions')
          .upsert({ course_id: courseId, topic_name: topic }, { onConflict: 'course_id,topic_name' });
        if (error) throw error;
        onToggle(topic, true);
      } else {
        // Mark incomplete
        const { error } = await supabase
          .from('topic_completions')
          .delete()
          .eq('course_id', courseId)
          .eq('topic_name', topic);
        if (error) throw error;
        onToggle(topic, false);
      }
    } catch (err) {
      console.error('Toggle topic error:', err);
    } finally {
      setLoading(false);
    }
  };

  const topicId = `topic-${courseId}-${topic.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <label
      htmlFor={topicId}
      className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 group ${
        completed
          ? 'bg-emerald-50/70 dark:bg-emerald-950/30'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
      } ${loading ? 'opacity-60 cursor-wait' : ''}`}
    >
      {/* Checkbox */}
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          id={topicId}
          type="checkbox"
          checked={completed}
          onChange={handleToggle}
          disabled={loading}
          className="sr-only"
          aria-label={`Mark "${topic}" as ${completed ? 'incomplete' : 'complete'}`}
        />
        <div
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
            completed
              ? 'bg-emerald-500 border-emerald-500'
              : 'border-slate-300 dark:border-slate-600 group-hover:border-indigo-400'
          } ${loading ? '' : ''}`}
        >
          {completed && <Check size={12} strokeWidth={3} className="text-white" />}
          {loading && (
            <div className="w-2.5 h-2.5 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
          )}
        </div>
      </div>

      {/* Label */}
      <span
        className={`text-sm leading-relaxed transition-all duration-300 ${
          completed
            ? 'line-through text-slate-400 dark:text-slate-500'
            : 'text-slate-700 dark:text-slate-300'
        }`}
      >
        {topic}
      </span>
    </label>
  );
}
