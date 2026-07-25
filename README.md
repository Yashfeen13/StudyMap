# StudyMap — Syllabus to Study Plan

> **AI-powered study planning for university students.**  
> Paste your syllabus → get a personalized week-by-week study plan → check off topics → let AI re-plan automatically.

---

## 🔗 Live URL

**[(https://study-map-flame.vercel.app/)](https://study-map-flame.vercel.app/)**  
_(Opens in incognito/private window with no login required)_

---

## Problem Statement

University students receive a course syllabus at the start of term and have no idea how to break it into a realistic weekly study schedule. Existing planner apps require manually entering every task. **StudyMap** solves this by reading the syllabus with AI, identifying all topics, estimating their weight/complexity, and generating a structured study plan automatically — then adapting the plan as the student makes progress.

**Who it's for:** University and college students in any subject, worldwide.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Add a Course** | Name your course, paste raw syllabus text or upload a `.txt`/`.pdf` file, and optionally set an exam/deadline date |
| **AI Plan Generation** | AI parses the syllabus into topics, weights them by importance/complexity, and builds a week-by-week plan with recommended study hours |
| **Plan View** | Clean weekly view — collapsible week cards showing topics and recommended hours per week |
| **Mark Topics Complete** | Checkboxes per topic; completion state persists in Supabase instantly |
| **Replan** | "Replan Remaining" button calls AI with your current completion state and returns an updated plan that redistributes uncompleted topics |
| **Multiple Courses** | Dashboard listing all your courses with progress bars and deadline indicators |
| **Persistence** | All data saved to Supabase — reloads correctly on refresh or revisit |
| **Anonymous Sessions** | No login required — a browser UUID scopes your data; nothing leaks between users |
| **Error Handling** | Graceful handling of AI failures, empty inputs, and network errors with user-facing messages |
| **Responsive Design** | Fully usable on desktop, tablet, and mobile |
| **Dark Mode** | System-aware dark mode with manual toggle |
| **Delete Course** | Remove a course and all its data with confirmation |

---

## 🤖 The AI Feature

### What It Does

**Initial Plan Generation** — When you submit a syllabus, StudyMap calls Google's Gemini 3.5 Flash from a server-side API route (`/api/generate-plan`). The model reads the entire syllabus, identifies all distinct topics, estimates each topic's weight/complexity relative to the others, and distributes them across weeks leading up to your exam date. Heavier topics get more study hours; topics close to assessments are scheduled earlier.

**Adaptive Replanning** — At any time, you can click "Replan Remaining". This sends the AI your original syllabus, the current plan, the list of already-completed topics, and today's date. The AI generates a **new plan covering only the remaining (uncompleted) topics**, redistributed across the weeks left before the deadline, prioritizing urgent topics and allocating hours based on complexity.

### System Prompt (Exact)

```
You are a study planning assistant. Given a course syllabus and an exam or
deadline date, break the syllabus into weekly study topics, weighted by how
much material each topic covers and how close it is to assessments.

Return ONLY valid JSON in this exact shape, with no extra commentary:
{
  "weeks": [
    {
      "week": 1,
      "topics": ["Topic name", "Topic name"],
      "hours_recommended": 6
    }
  ]
}

If you are given a list of already-completed topics and the current date,
instead redistribute the REMAINING (not completed) topics across the
remaining weeks until the deadline, prioritizing topics closest to the
deadline and giving more hours to heavier/more complex topics.
```

The API route uses `response_format: { type: 'json_object' }` for reliable JSON output and defensively validates/parses the response before saving it.

---

## 🛠 Tools, Services & Models

| Tool / Service | Purpose |
|---|---|
| **Next.js 14** (App Router) | React framework, server components, API routes |
| **TypeScript** | Full type safety across the codebase |
| **Tailwind CSS 3** | Utility-first styling with custom design tokens |
| **Supabase** (PostgreSQL) | Database: courses, plans, completions with RLS |
| **Google Gemini 3.5 Flash** | AI plan generation and replanning |
| **PDF.js (pdfjs-dist)** | Client-side PDF text extraction — no file upload needed |
| **Lucide React** | Icon library |
| **Vercel** | Hosting and deployment |
| **Inter (Google Fonts)** | Typography |

---



---

## 🚀 How to Run Locally

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/studymap.git
cd studymap
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env.local` and fill in your real values:

```bash
cp .env.example .env.local
```

Required variables (see `.env.example`):

```env
OPENAI_API_KEY=          # From platform.openai.com
NEXT_PUBLIC_SUPABASE_URL=      # From your Supabase project → Settings → API
NEXT_PUBLIC_SUPABASE_ANON_KEY= # From your Supabase project → Settings → API
```

### 4. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Copy your project URL and anon key into `.env.local`

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment (Vercel)

1. Push this repo to GitHub (ensure no secrets are committed)
2. Import the repo into [vercel.com](https://vercel.com)
3. Add the 3 environment variables in Vercel's project settings
4. Deploy — Vercel auto-builds on every push

---

## Project Structure

```
StudyMap/
├── app/
│   ├── api/generate-plan/route.ts   # AI API route (server-only)
│   ├── add-course/page.tsx          # Add course form page
│   ├── courses/[id]/page.tsx        # Course detail + weekly plan
│   ├── globals.css                  # Design system CSS
│   ├── layout.tsx                   # Root layout + fonts
│   └── page.tsx                     # Dashboard
├── components/
│   ├── AddCourseForm.tsx            # Syllabus upload + form
│   ├── CourseCard.tsx               # Dashboard course card
│   ├── EmptyState.tsx               # Empty state illustration
│   ├── LoadingSkeleton.tsx          # Shimmer skeletons
│   ├── Navbar.tsx                   # Top navigation
│   ├── ProgressRing.tsx             # SVG progress ring
│   ├── ReplanButton.tsx             # AI replan trigger
│   ├── TopicCheckbox.tsx            # Persistent topic checkbox
│   └── WeekCard.tsx                 # Collapsible week card
├── lib/
│   ├── supabase/
│   │   ├── client.ts                # Browser Supabase client
│   │   └── server.ts                # Server Supabase client
│   ├── session.ts                   # Anonymous session UUID
│   └── types.ts                     # TypeScript interfaces
├── supabase/
│   └── schema.sql                   # Database schema + RLS
├── .env.example                     # Required env var names
└── README.md
```

---

## License

MIT — free to use, fork, and modify.
