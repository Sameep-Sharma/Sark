export type QuizOption = {
  id: string;
  label: string;
};

export type QuizQuestion = {
  id: string;
  category: string;
  difficulty: "Core" | "Applied" | "Challenge";
  prompt: string;
  description?: string;
  options: QuizOption[];
};

export type QuizQuestionWithAnswer = QuizQuestion & {
  answer: string;
};

export type QuizConfig = {
  title: string;
  description: string;
  duration: string;
  durationSeconds: number;
  totalQuestions?: number;
  startsAt: string;
  rules: string[];
  highlights: Array<{
    label: string;
    value: string;
  }>;
};

export type ResultInvite = {
  title: string;
  description: string;
  image: false | string;
};

export type QuizPayload = {
  id: string;
  config: QuizConfig;
  questions: QuizQuestion[];
  resultInvite: ResultInvite;
  isActive: boolean;
};

export type QuizSubmission = {
  answers: Record<string, string>;
  startedAt: number;
  quizId?: string;
};
