import { create } from "zustand";
import type { Question } from "@/types";

interface SubmitAnswer {
    questionId: string;
    answer: string;
}

interface TestState {
    questions: Question[];
    currentIndex: number;
    answers: Map<string, string>;
    startedAt: string | null;
    isCompleted: boolean;

    startTest: (questions: Question[]) => void;
    setAnswer: (questionId: string, answer: string) => void;
    nextQuestion: () => void;
    prevQuestion: () => void;
    goToQuestion: (index: number) => void;
    completeTest: () => void;
    resetTest: () => void;
    getAnswersArray: () => SubmitAnswer[];
}

export const useTestStore = create<TestState>((set, get) => ({
    questions: [],
    currentIndex: 0,
    answers: new Map(),
    startedAt: null,
    isCompleted: false,

    startTest: (questions) => {
        set({
            questions,
            currentIndex: 0,
            answers: new Map(),
            startedAt: new Date().toISOString(),
            isCompleted: false,
        });
    },

    setAnswer: (questionId, answer) => {
        const newAnswers = new Map(get().answers);
        newAnswers.set(questionId, answer);
        set({ answers: newAnswers });
    },

    nextQuestion: () => {
        const { currentIndex, questions } = get();
        if (currentIndex < questions.length - 1) {
            set({ currentIndex: currentIndex + 1 });
        }
    },

    prevQuestion: () => {
        const { currentIndex } = get();
        if (currentIndex > 0) {
            set({ currentIndex: currentIndex - 1 });
        }
    },

    goToQuestion: (index) => {
        const { questions } = get();
        if (index >= 0 && index < questions.length) {
            set({ currentIndex: index });
        }
    },

    completeTest: () => {
        set({ isCompleted: true });
    },

    resetTest: () => {
        set({
            questions: [],
            currentIndex: 0,
            answers: new Map(),
            startedAt: null,
            isCompleted: false,
        });
    },

    getAnswersArray: () => {
        const { answers } = get();
        return Array.from(answers.entries()).map(([questionId, answer]) => ({
            questionId,
            answer,
        }));
    },
}));
