// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  company: string;
  createdAt: Date;
  lastActive: Date;
}

// Scenario Types
export interface SuccessMetric {
  id: string;
  name: string;
  weight: number;
  criteria: string[];
  description: string;
  keyPhrases?: string[];
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  timeLimit: number;
  maxQuestions: number;
  customerBackground: string;
  situation: string;
  successMetrics: SuccessMetric[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// Chat Types
export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  analysis?: MessageAnalysis;
}

export interface MessageAnalysis {
  metrics: MetricScore[];
  overallScore: number;
  suggestions: string[];
}

export interface MetricScore {
  metricId: string;
  score: number;
  feedback: string;
}

// Analysis Types
export interface Analysis {
  metrics: MetricScore[];
  overallScore: number;
  suggestions: string[];
  dealProbability: number;
}

export interface SessionResults {
  satisfaction: number;
  dealClosed: boolean;
  metricsScores: {
    metricId: string;
    score: number;
  }[];
  strengths: string[];
  improvements: string[];
}

// Session Types
export interface Session {
  id: string;
  userId: string;
  scenarioId: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  questionCount: number;
  messages: Message[];
  finalResults: SessionResults;
}

// Auth Types
export interface AuthConfig {
  signInMethods: ["email", "google"];
  roleBasedAccess: {
    admin: string[];
    user: string[];
  };
}

// Analytics Types
export interface AnalyticsEvent {
  sessionStarted: { scenarioId: string };
  sessionCompleted: { duration: number; score: number };
  messageSent: { responseTime: number };
  scenarioViewed: { scenarioId: string };
  feedbackReceived: { satisfactionScore: number };
}
