'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, X, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getOrCreateSessionId } from '@/lib/session';

export default function AddCourseForm() {
  const router = useRouter();

  const [courseName, setCourseName] = useState('');
  const [syllabusText, setSyllabusText] = useState('');
  const [examDate, setExamDate] = useState('');
  const [fileName, setFileName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'idle' | 'saving' | 'generating'>('idle');

  const fileRef = useRef<HTMLInputElement>(null);

  // --- PDF / TXT extraction ---
  const extractTextFromFile = async (file: File): Promise<string> => {
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      return await file.text();
    }

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      // Dynamically import pdfjs-dist (client-side only) with CDN worker
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      let text = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item) => ('str' in item ? item.str : '')).join(' ') + '\n';
      }
      return text;
    }

    throw new Error('Unsupported file type. Please upload a .pdf or .txt file.');
  };

  const handleFile = async (file: File) => {
    if (!file) return;
    setError('');
    try {
      const text = await extractTextFromFile(file);
      setSyllabusText(text);
      setFileName(file.name);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to read file.');
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) await handleFile(file);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await handleFile(file);
  };

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!courseName.trim()) { setError('Please enter a course name.'); return; }
    if (!syllabusText.trim()) { setError('Please paste or upload your syllabus.'); return; }
    if (syllabusText.trim().length < 50) { setError('Syllabus seems too short. Add more content.'); return; }

    setLoading(true);
    setStep('saving');

    try {
      // Create client lazily inside handler — never runs during SSR
      const supabase = createClient();
      const sessionId = getOrCreateSessionId();

      // 1. Save course to Supabase
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .insert({
          session_id: sessionId,
          name: courseName.trim(),
          syllabus_text: syllabusText.trim(),
          exam_date: examDate || null,
        })
        .select()
        .single();

      if (courseError) throw new Error(courseError.message);

      setStep('generating');

      // 2. Generate AI plan
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'generate',
          courseId: courseData.id,
          syllabusText: syllabusText.trim(),
          courseName: courseName.trim(),
          examDate: examDate || undefined,
        }),
      });

      const planData = await res.json();
      if (!res.ok) throw new Error(planData.error || 'Plan generation failed.');

      // 3. Navigate to course page
      router.push(`/courses/${courseData.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
      setLoading(false);
      setStep('idle');
    }
  };

  const clearFile = () => {
    setFileName('');
    setSyllabusText('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const stepLabel =
    step === 'saving'
      ? 'Saving course…'
      : step === 'generating'
      ? 'AI is generating your plan…'
      : '';

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Course name */}
      <div>
        <label
          htmlFor="course-name"
          className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
        >
          Course Name <span className="text-red-400">*</span>
        </label>
        <input
          id="course-name"
          type="text"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          placeholder="e.g. Introduction to Computer Science"
          disabled={loading}
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-60"
          aria-required="true"
          maxLength={120}
        />
      </div>

      {/* Exam date */}
      <div>
        <label
          htmlFor="exam-date"
          className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
        >
          Exam / Deadline Date{' '}
          <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <input
          id="exam-date"
          type="date"
          value={examDate}
          onChange={(e) => setExamDate(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-60"
        />
      </div>

      {/* Syllabus input */}
      <div>
        <label
          htmlFor="syllabus-text"
          className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
        >
          Syllabus Content <span className="text-red-400">*</span>
        </label>

        {/* File dropzone */}
        {!syllabusText && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="Upload syllabus file"
            onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
            className={`dropzone mb-3 p-8 flex flex-col items-center justify-center gap-3 cursor-pointer ${
              dragActive ? 'active' : 'hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center">
              <Upload size={22} className="text-indigo-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Drop your syllabus here
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Supports .pdf and .txt · or click to browse
              </p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.txt,text/plain,application/pdf"
              onChange={handleFileInput}
              className="hidden"
              aria-hidden="true"
              tabIndex={-1}
            />
          </div>
        )}

        {/* File uploaded indicator */}
        {fileName && (
          <div className="flex items-center gap-2 mb-3 px-4 py-2.5 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900">
            <FileText size={15} className="text-indigo-500 flex-shrink-0" />
            <span className="text-sm text-indigo-700 dark:text-indigo-300 flex-1 truncate">
              {fileName}
            </span>
            <button
              type="button"
              onClick={clearFile}
              aria-label="Remove file"
              className="text-slate-400 hover:text-red-400 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Textarea */}
        <textarea
          id="syllabus-text"
          value={syllabusText}
          onChange={(e) => setSyllabusText(e.target.value)}
          placeholder="Paste your syllabus text here… Topics, chapters, weekly schedule, assessment weights — the more detail, the better the plan."
          disabled={loading}
          rows={10}
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-y min-h-[200px] disabled:opacity-60 text-sm leading-relaxed"
          aria-required="true"
        />
        <p className="text-xs text-slate-400 mt-1.5">
          {syllabusText.length} characters
        </p>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl"
        >
          <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Loading progress */}
      {loading && (
        <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900">
          <Loader2 size={16} className="text-indigo-500 animate-spin flex-shrink-0" />
          <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">
            {stepLabel}
          </p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        id="generate-plan-btn"
        className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 text-base"
        aria-label="Generate AI study plan"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            {step === 'generating' ? 'Generating Plan…' : 'Saving…'}
          </>
        ) : (
          <>
            <Sparkles size={18} />
            Generate Study Plan with AI
          </>
        )}
      </button>
    </form>
  );
}
