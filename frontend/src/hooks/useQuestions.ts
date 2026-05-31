import { useQuery } from "@tanstack/react-query";
import { questionsApi } from "@/lib/api";
import type { Question, Pagination } from "@/types";

export const questionKeys = {
    all: ["questions"] as const,
    lists: () => [...questionKeys.all, "list"] as const,
    list: (filters: {
        page?: number;
        limit?: number;
        category?: string;
        ticket?: number;
    }) => [...questionKeys.lists(), filters] as const,
    details: () => [...questionKeys.all, "detail"] as const,
    detail: (id: string) => [...questionKeys.details(), id] as const,
    random: (count: number) => [...questionKeys.all, "random", count] as const,
};

export function useQuestions(params?: {
    page?: number;
    limit?: number;
    category?: string;
    ticket?: number;
}) {
    return useQuery<{
        questions: Question[];
        pagination: Pagination;
    }>({
        queryKey: questionKeys.list(params || {}),
        queryFn: () => questionsApi.getAll(params),
        staleTime: 10 * 60 * 1000,
    });
}

export function useQuestion(id: string | null) {
    return useQuery<Question>({
        queryKey: questionKeys.detail(id || ""),
        queryFn: () => questionsApi.getById(id!),
        enabled: !!id,
        staleTime: 10 * 60 * 1000,
    });
}

export function useRandomQuestions(
    count: number = 20,
    enabled: boolean = true,
) {
    return useQuery<{
        questions: Question[];
        count: number;
    }>({
        queryKey: questionKeys.random(count),
        queryFn: () => questionsApi.getRandom(count),
        enabled,
        staleTime: 0,
        gcTime: 0,
    });
}
