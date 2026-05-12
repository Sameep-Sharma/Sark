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

export type QuizConfig = {
  title: string;
  description: string;
  duration: string;
  totalQuestions?: number;
  passingScore: string;
  startsAt: string;
  mode: string;
  rules: string[];
  highlights: Array<{
    label: string;
    value: string;
  }>;
};

export type QuizPayload = {
  config: QuizConfig;
  questions: QuizQuestion[];
};
