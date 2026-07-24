import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import type { PlanRequest, StudyPlan } from '@/lib/types';

// Force dynamic — never statically evaluated at build time
export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `You are a study planning assistant. Given a course syllabus and an exam or deadline date, break the syllabus into weekly study topics, weighted by how much material each topic covers and how close it is to assessments.

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

If you are given a list of already-completed topics and the current date, instead redistribute the REMAINING (not completed) topics across the remaining weeks until the deadline, prioritizing topics closest to the deadline and giving more hours to heavier/more complex topics.`;

function buildUserPrompt(body: PlanRequest): string {
  const today = new Date().toISOString().split('T')[0];

  if (body.mode === 'generate') {
    return `Course: ${body.courseName}
Exam/Deadline Date: ${body.examDate || 'Not specified (assume 12 weeks from today: ' + today + ')'}
Today's Date: ${today}

Syllabus:
${body.syllabusText}

Generate a complete week-by-week study plan from today until the exam/deadline. 
Identify all major topics from the syllabus, estimate their complexity/weight, and distribute them across weeks.
Ensure heavier topics get more hours. Return ONLY the JSON.`;
  } else {
    const completedList = body.completedTopics.length > 0
      ? body.completedTopics.join(', ')
      : 'None';
    return `Course: ${body.courseName}
Exam/Deadline Date: ${body.examDate || 'Not specified'}
Today's Date: ${today}

Original Syllabus:
${body.syllabusText}

COMPLETED Topics (do NOT include these in the new plan):
${completedList}

Original Plan:
${JSON.stringify(body.currentPlan, null, 2)}

Re-plan ONLY the remaining (not completed) topics. Redistribute them from today (${today}) until the deadline.
Prioritize topics that appear before assessments. Give more hours to heavier topics.
Start week numbers from 1 again for clarity. Return ONLY the JSON.`;
  }
}

function parseStudyPlan(raw: string): StudyPlan | null {
  try {
    // Strip any markdown code fences if present
    const cleaned = raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    // Validate shape
    if (!parsed.weeks || !Array.isArray(parsed.weeks)) return null;
    for (const week of parsed.weeks) {
      if (typeof week.week !== 'number') return null;
      if (!Array.isArray(week.topics)) return null;
      if (typeof week.hours_recommended !== 'number') return null;
    }
    return parsed as StudyPlan;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: PlanRequest = await req.json();

    // Basic validation
    if (!body.mode || !body.courseId || !body.syllabusText?.trim()) {
      return NextResponse.json(
        { error: 'Missing required fields: mode, courseId, syllabusText' },
        { status: 400 }
      );
    }

    if (body.syllabusText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Syllabus text is too short. Please paste more content.' },
        { status: 400 }
      );
    }

    const userPrompt = buildUserPrompt(body);

    // Call Gemini using the REST API
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is missing from environment variables.' },
        { status: 500 }
      );
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiApiKey}`;
    
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        },
        contents: [
          {
            parts: [{ text: userPrompt }]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', errText);
      return NextResponse.json(
        { error: 'Failed to generate plan from Gemini API.' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!rawContent) {
      return NextResponse.json(
        { error: 'AI returned an empty response. Please try again.' },
        { status: 500 }
      );
    }

    const plan = parseStudyPlan(rawContent);
    if (!plan) {
      return NextResponse.json(
        { error: 'AI returned malformed JSON. Please try again.' },
        { status: 500 }
      );
    }

    // Persist plan to Supabase
    const supabase = createServerClient();
    const { data: planData, error: planError } = await supabase
      .from('study_plans')
      .insert({
        course_id: body.courseId,
        plan_json: plan,
      })
      .select()
      .single();

    if (planError) {
      console.error('Supabase plan insert error:', planError);
      return NextResponse.json(
        { error: 'Failed to save plan to database.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ plan, planId: planData.id });
  } catch (err: unknown) {
    console.error('Generate plan error:', err);
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    
    // Check for API key issues
    if (message.includes('API_KEY') || message.includes('API key') || message.includes('401') || message.includes('403')) {
      return NextResponse.json(
        { error: 'AI service configuration error. Please check your GEMINI_API_KEY.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
