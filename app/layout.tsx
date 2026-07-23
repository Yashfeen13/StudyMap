import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'StudyMap — Syllabus to Study Plan',
  description:
    'Turn your course syllabus into a personalized, AI-generated weekly study plan. Track progress and let AI re-plan as you go.',
  keywords: ['study plan', 'syllabus', 'AI', 'university', 'student planner'],
  openGraph: {
    title: 'StudyMap — Syllabus to Study Plan',
    description: 'AI-powered study planning for university students',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <Navbar />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
