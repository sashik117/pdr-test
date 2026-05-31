export interface User {
    id: string;
    email: string;
    name: string;
    role: "user" | "admin";
    isPremium?: boolean;
    subscriptionExpiresAt?: string;
}

export interface AuthResponse {
    success: boolean;
    token?: string;
    message?: string;
    user: User;
}

export interface VerifyEmailRequest {
    token: string;
}

export interface ResendVerificationRequest {
    email: string;
}

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
    category: string;
    correctAnswer?: string;
    explanation?: string;
}

export interface Ticket {
    ticketNumber: number;
    questionsCount: number;
    categories: string[];
}

export interface TestAnswer {
    questionId: string;
    answer: string;
    correct: boolean;
    correctAnswer: string;
}

export interface TestResult {
    id: string;
    startedAt: string;
    completedAt: string;
    score: number;
    passed: boolean;
    totalQuestions: number;
    correctAnswers: number;
    answers?: TestAnswer[];
}

export interface TestStats {
    totalTests: number;
    passed: number;
    averageScore: number;
    totalQuestions: number;
    totalCorrect: number;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
