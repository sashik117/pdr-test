export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  questionId: string;
  ticketNumber: number;
  questionNumber: number;
  text: string;
  imageUrl: string | null;
  options: QuestionOption[];
  correctAnswer: string;
  explanation: string;
  category: string;
}

export interface QuestionFilterVariables {
  q?: string;
  questionId?: string;
  ticketNumber?: number;
  category?: string;
  text?: string;
}

export interface QuestionCreateInput {
  questionId?: string;
  ticketNumber: number;
  questionNumber: number;
  text: string;
  imageUrl?: string | null;
  options: QuestionOption[];
  correctAnswer: string;
  explanation?: string;
  category?: string;
}

export interface QuestionUpdateInput extends Partial<QuestionCreateInput> {
  id: string;
}
