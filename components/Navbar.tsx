'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Plus, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('studymap_theme');
    if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDark = () => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('studymap_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-4 md:px-8 backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/50 dark:border-slate-800/50">
      <div className="flex items-center gap-2 flex-1">
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          aria-label="StudyMap home"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
            <BookOpen size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
            Study<span className="text-indigo-600 dark:text-indigo-400">Map</span>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleDark}
          aria-label="Toggle dark mode"
          className="btn-ghost p-2 rounded-xl"
        >
          {dark ? (
            <Sun size={18} className="text-amber-400" />
          ) : (
            <Moon size={18} />
          )}
        </button>

        {pathname !== '/add-course' && (
          <Link
            href="/add-course"
            className="btn-primary flex items-center gap-2 py-2 px-4 text-sm"
            aria-label="Add a new course"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Course</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
