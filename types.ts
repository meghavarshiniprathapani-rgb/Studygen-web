export interface DayPlan {
  day: string;
  topics: string[];
  activities: string[];
}

export interface PeriodPlan {
  period: string; // e.g., "Week 1" or "Day 1"
  focus: string;
  days: DayPlan[];
}

export interface StudyPlan {
  title: string;
  overview: string;
  schedule: PeriodPlan[];
}

export interface DayDetails {
  description: string;
  youtubeQueries: string[];
  practiceProblems: string[];
}

export interface CodeEvaluationResult {
  output: string;
  analysis: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface FinalExam {
  mcqs: QuizQuestion[];
  codingProblems: string[];
}

export interface User {
  name: string;
  email: string;
  avatar?: string;
  joinedAt: string; // ISO Date string for trial tracking
  isPremium: boolean;
  hasPaymentMethod: boolean;
  planCompleted: boolean; // Tracks if a plan was finished to trigger payment
}

export enum Duration {
  WEEKEND = "Weekend Crash Course",
  ONE_WEEK = "1 Week",
  TWO_WEEKS = "2 Weeks",
  ONE_MONTH = "1 Month",
  SEMESTER = "Semester (4 Months)"
}

export enum Intensity {
  LIGHT = "Light (1-2 hours/day)",
  MEDIUM = "Medium (3-4 hours/day)",
  INTENSE = "Intense (5+ hours/day)"
}