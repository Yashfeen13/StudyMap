export interface Week {
  week: number;
  topics: string[];
  hours_recommended: number;
}

export interface StudyPlan {
  weeks: Week[];
}

export interface Course {
  id: string;
  session_id: string;
  name: string;
  syllabus_text: string;
  exam_date: string | null;
  created_at: string;
}

export interface DbStudyPlan {
  id: string;
  course_id: string;
  generated_at: string;
  plan_json: StudyPlan;
}

export interface TopicCompletion {
  id: string;
  course_id: string;
  topic_name: string;
  completed_at: string;
}

export interface CourseWithProgress extends Course {
  latestPlan: DbStudyPlan | null;
  completedTopics: string[];
  totalTopics: number;
  completedCount: number;
}

export interface GeneratePlanRequest {
  mode: 'generate';
  courseId: string;
  syllabusText: string;
  courseName: string;
  examDate?: string;
}

export interface ReplanRequest {
  mode: 'replan';
  courseId: string;
  syllabusText: string;
  courseName: string;
  examDate?: string;
  completedTopics: string[];
  currentPlan: StudyPlan;
}

export type PlanRequest = GeneratePlanRequest | ReplanRequest;
