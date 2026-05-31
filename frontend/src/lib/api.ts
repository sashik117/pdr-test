import axios from "axios";
import type {
    AuthResponse,
    Question,
    Ticket,
    TestResult,
    TestStats,
    Pagination,
} from "@/types";
import { useAuthStore } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Only logout on 401 if it's NOT a login/register/auth request
        if (error.response?.status === 401) {
            const url = error.config?.url || "";
            const isAuthEndpoint = url.includes("/auth/");
            if (!isAuthEndpoint && useAuthStore.getState().isAuthenticated) {
                // Token is expired or invalid - clear auth state
                useAuthStore.getState().logout();
            }
        }
        return Promise.reject(error);
    },
);

export const authApi = {
    register: async (data: {
        email: string;
        password: string;
        name: string;
    }): Promise<AuthResponse> => {
        const response = await api.post("/auth/register", data);
        return response.data;
    },

    login: async (data: {
        email: string;
        password: string;
    }): Promise<AuthResponse> => {
        const response = await api.post("/auth/login", data);
        return response.data;
    },

    getMe: async () => {
        const response = await api.get("/auth/me");
        return response.data;
    },

    verifyEmail: async (token: string): Promise<AuthResponse> => {
        const response = await api.post("/auth/verify-email", { token });
        return response.data;
    },

    resendVerification: async (
        email: string,
    ): Promise<{ success: boolean; message: string }> => {
        const response = await api.post("/auth/resend-verification", { email });
        return response.data;
    },
};

export const questionsApi = {
    getAll: async (params?: {
        page?: number;
        limit?: number;
        category?: string;
        ticket?: number;
    }): Promise<{
        questions: Question[];
        pagination: Pagination;
    }> => {
        const response = await api.get("/questions", { params });
        return response.data;
    },

    getRandom: async (
        count: number = 20,
    ): Promise<{ questions: Question[]; count: number }> => {
        const response = await api.get("/questions/random", {
            params: { count },
        });
        return response.data;
    },

    getById: async (id: string): Promise<Question> => {
        const response = await api.get(`/questions/${id}`);
        return response.data;
    },
};

export const ticketsApi = {
    getAll: async (): Promise<{ tickets: Ticket[]; total: number }> => {
        const response = await api.get("/tickets");
        return response.data;
    },

    getById: async (
        id: number,
    ): Promise<{
        ticketNumber: number;
        questions: Question[];
        totalQuestions: number;
    }> => {
        const response = await api.get(`/tickets/${id}`);
        return response.data;
    },
};

export const testsApi = {
    submit: async (data: {
        questions: string[];
        answers: { questionId: string; answer: string }[];
        startedAt: string;
    }): Promise<{
        success: boolean;
        testId: string;
        score: number;
        passed: boolean;
        totalQuestions: number;
        correctAnswers: number;
        answers: {
            questionId: string;
            answer: string;
            correct: boolean;
            correctAnswer: string;
        }[];
    }> => {
        const response = await api.post("/tests/submit", data);
        return response.data;
    },

    getHistory: async (params?: {
        page?: number;
        limit?: number;
    }): Promise<{
        results: TestResult[];
        stats: TestStats;
        pagination: Pagination;
    }> => {
        const response = await api.get("/tests/history", { params });
        return response.data;
    },

    checkLimit: async (): Promise<{
        allowed: boolean;
        remaining: number;
        isPremium: boolean;
    }> => {
        const response = await api.get("/tests/check-limit");
        return response.data;
    },
};

export const topicsApi = {
    getAll: async (): Promise<{
        topics: {
            id: string;
            name: string;
            slug: string;
            description: string;
            difficulty: number;
            questionCount: number;
            order: number;
            userProgress: {
                answeredCorrectly: number;
                totalAttempts: number;
                percentage: number;
            };
        }[];
    }> => {
        const response = await api.get("/topics");
        return response.data;
    },

    getQuestionsBySlug: async (
        slug: string,
        params?: { page?: number; limit?: number },
    ): Promise<{
        topic: { name: string; slug: string };
        questions: Question[];
        pagination: Pagination;
    }> => {
        const response = await api.get(`/topics/${slug}/questions`, { params });
        return response.data;
    },
};

export const progressApi = {
    getOverall: async (): Promise<{
        overall: {
            totalAnswered: number;
            totalCorrect: number;
            percentage: number;
            testsCompleted: number;
        };
        byTopic: {
            topicId: string;
            topicSlug: string;
            name: string;
            difficulty: number;
            questionCount: number;
            answeredCorrectly: number;
            percentage: number;
        }[];
    }> => {
        const response = await api.get("/progress");
        return response.data;
    },

    getWeekly: async (): Promise<{
        days: {
            date: string;
            dayName: string;
            testsCompleted: number;
            questionsAnswered: number;
            correctRate: number;
        }[];
        totals: {
            testsCompleted: number;
            questionsAnswered: number;
            correctRate: number;
        };
    }> => {
        const response = await api.get("/progress/weekly");
        return response.data;
    },

    getProblematic: async (): Promise<{
        topics: {
            topicSlug: string;
            topicName: string;
            errorRate: number;
        }[];
        questions: {
            questionId: string;
            text: string;
            topicName: string;
            mistakeCount: number;
        }[];
    }> => {
        const response = await api.get("/progress/problematic");
        return response.data;
    },
};

export const theoryApi = {
    getAll: async (params?: {
        category?: string;
    }): Promise<{
        articles: {
            id: string;
            slug: string;
            title: string;
            category: string;
            content: string;
        }[];
    }> => {
        const response = await api.get("/theory", { params });
        return response.data;
    },

    getBySlug: async (
        slug: string,
    ): Promise<{
        id: string;
        slug: string;
        title: string;
        description?: string;
        content?: string;
        categoryId?: string;
        categoryName?: string;
        order?: number;
        chapterId?: number;
        sections?: any[];
        items?: any[];
    }> => {
        const response = await api.get(`/theory/${slug}`);
        return response.data;
    },

    getByType: async (
        type: string,
    ): Promise<{
        content: {
            id: string;
            type: string;
            slug: string;
            title: string;
            description?: string;
            content?: string;
            itemCount?: number;
            chapterId?: number;
            items?: any[];
            imageUrl?: string;
            categoryId?: string;
            categoryName?: string;
            order?: number;
        }[];
    }> => {
        const response = await api.get("/theory", { params: { type } });
        return response.data;
    },
};

export const savedQuestionsApi = {
    getAll: async (params?: {
        page?: number;
        limit?: number;
    }): Promise<{
        questions: Question[];
        pagination: Pagination;
    }> => {
        const response = await api.get("/questions/saved", { params });
        return response.data;
    },

    save: async (questionId: string): Promise<{ success: boolean }> => {
        const response = await api.post("/questions/saved", { questionId });
        return response.data;
    },

    unsave: async (questionId: string): Promise<{ success: boolean }> => {
        const response = await api.delete(`/questions/saved/${questionId}`);
        return response.data;
    },
};

export const mistakesApi = {
    getAll: async (params?: {
        page?: number;
        limit?: number;
    }): Promise<{
        questions: Question[];
        pagination: Pagination;
    }> => {
        const response = await api.get("/questions/mistakes", { params });
        return response.data;
    },

    clear: async (): Promise<{ success: boolean }> => {
        const response = await api.delete("/questions/mistakes");
        return response.data;
    },
};

export const difficultApi = {
    getAll: async (params?: {
        page?: number;
        limit?: number;
    }): Promise<{
        questions: Question[];
        pagination: Pagination;
    }> => {
        const response = await api.get("/questions/difficult", { params });
        return response.data;
    },
};

export const categoryQuestionsApi = {
    getByCategory: async (
        category: string,
        params?: { page?: number; limit?: number },
    ): Promise<{
        questions: Question[];
        pagination: Pagination;
    }> => {
        const response = await api.get("/questions/by-category", {
            params: { category, ...params },
        });
        return response.data;
    },
};

export const paymentApi = {
    checkout: async (data: {
        userId: string;
        plan: string;
    }): Promise<{ url: string; orderId: string }> => {
        const response = await api.post("/payment/checkout", data);
        return response.data;
    },
};

export const repetitionApi = {
    getDue: async (
        limit: number = 20,
    ): Promise<{ success: boolean; questions: any[] }> => {
        const response = await api.get("/repetition/due", {
            params: { limit },
        });
        return response.data;
    },

    review: async (data: {
        questionId: string;
        grade: number;
    }): Promise<{ success: boolean; result: any }> => {
        const response = await api.post("/repetition/review", data);
        return response.data;
    },

    getStats: async (): Promise<{ success: boolean; stats: any }> => {
        const response = await api.get("/repetition/stats");
        return response.data;
    },
};

export default api;
