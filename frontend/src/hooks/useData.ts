"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    topicsApi,
    progressApi,
    theoryApi,
    savedQuestionsApi,
    mistakesApi,
    difficultApi,
    categoryQuestionsApi,
} from "@/lib/api";

export const topicKeys = {
    all: ["topics"] as const,
    list: () => [...topicKeys.all, "list"] as const,
    questions: (slug: string) => [...topicKeys.all, "questions", slug] as const,
};

export function useTopics() {
    return useQuery({
        queryKey: topicKeys.list(),
        queryFn: topicsApi.getAll,
        staleTime: 5 * 60 * 1000,
    });
}

export function useTopicQuestions(
    slug: string | null,
    params?: { page?: number; limit?: number },
) {
    return useQuery({
        queryKey: [...topicKeys.questions(slug || ""), params],
        queryFn: () => topicsApi.getQuestionsBySlug(slug!, params),
        enabled: !!slug,
        staleTime: 5 * 60 * 1000,
    });
}

export const progressKeys = {
    all: ["progress"] as const,
    overall: () => [...progressKeys.all, "overall"] as const,
    weekly: () => [...progressKeys.all, "weekly"] as const,
    problematic: () => [...progressKeys.all, "problematic"] as const,
};

export function useProgress() {
    return useQuery({
        queryKey: progressKeys.overall(),
        queryFn: progressApi.getOverall,
        staleTime: 2 * 60 * 1000,
    });
}

export function useWeeklyProgress() {
    return useQuery({
        queryKey: progressKeys.weekly(),
        queryFn: progressApi.getWeekly,
        staleTime: 5 * 60 * 1000,
    });
}

export function useProblematicData() {
    return useQuery({
        queryKey: progressKeys.problematic(),
        queryFn: progressApi.getProblematic,
        staleTime: 5 * 60 * 1000,
    });
}

export const theoryKeys = {
    all: ["theory"] as const,
    list: (category?: string) => [...theoryKeys.all, "list", category] as const,
    detail: (slug: string) => [...theoryKeys.all, "detail", slug] as const,
};

export function useTheoryArticles(category?: string) {
    return useQuery({
        queryKey: theoryKeys.list(category),
        queryFn: () => theoryApi.getAll(category ? { category } : undefined),
        staleTime: 10 * 60 * 1000,
    });
}

export function useTheoryArticle(slug: string | null) {
    return useQuery({
        queryKey: theoryKeys.detail(slug || ""),
        queryFn: () => theoryApi.getBySlug(slug!),
        enabled: !!slug,
        staleTime: 10 * 60 * 1000,
    });
}

export function useTheoryContent(type: string | null) {
    return useQuery({
        queryKey: ["theory", "content", type],
        queryFn: () => theoryApi.getByType(type!),
        enabled: !!type,
        staleTime: 10 * 60 * 1000,
    });
}

export const savedKeys = {
    all: ["saved"] as const,
    list: (params?: { page?: number; limit?: number }) =>
        [...savedKeys.all, "list", params] as const,
};

export function useSavedQuestions(params?: { page?: number; limit?: number }) {
    return useQuery({
        queryKey: savedKeys.list(params),
        queryFn: () => savedQuestionsApi.getAll(params),
        staleTime: 2 * 60 * 1000,
    });
}

export function useSaveQuestion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: savedQuestionsApi.save,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: savedKeys.all });
        },
    });
}

export function useUnsaveQuestion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: savedQuestionsApi.unsave,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: savedKeys.all });
        },
    });
}

export const mistakesKeys = {
    all: ["mistakes"] as const,
    list: (params?: { page?: number; limit?: number }) =>
        [...mistakesKeys.all, "list", params] as const,
};

export function useMistakes(params?: { page?: number; limit?: number }) {
    return useQuery({
        queryKey: mistakesKeys.list(params),
        queryFn: () => mistakesApi.getAll(params),
        staleTime: 2 * 60 * 1000,
    });
}

export function useClearMistakes() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: mistakesApi.clear,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: mistakesKeys.all });
        },
    });
}

export const difficultKeys = {
    all: ["difficult"] as const,
    list: (params?: { page?: number; limit?: number }) =>
        [...difficultKeys.all, "list", params] as const,
};

export function useDifficultQuestions(params?: {
    page?: number;
    limit?: number;
}) {
    return useQuery({
        queryKey: difficultKeys.list(params),
        queryFn: () => difficultApi.getAll(params),
        staleTime: 5 * 60 * 1000,
    });
}

export const categoryKeys = {
    all: ["category"] as const,
    list: (category: string, params?: { page?: number; limit?: number }) =>
        [...categoryKeys.all, "list", category, params] as const,
};

export function useCategoryQuestions(
    category: string | null,
    params?: { page?: number; limit?: number },
) {
    return useQuery({
        queryKey: categoryKeys.list(category || "", params),
        queryFn: () => categoryQuestionsApi.getByCategory(category!, params),
        enabled: !!category,
        staleTime: 5 * 60 * 1000,
    });
}
