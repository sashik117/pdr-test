import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { testsApi } from "@/lib/api";
import type { TestResult, TestStats, Pagination } from "@/types";

export const testKeys = {
    all: ["tests"] as const,
    lists: () => [...testKeys.all, "list"] as const,
    list: (filters: { page?: number; limit?: number }) =>
        [...testKeys.lists(), filters] as const,
    history: (params?: { page?: number; limit?: number }) =>
        [...testKeys.all, "history", params] as const,
    stats: () => [...testKeys.all, "stats"] as const,
};

export function useSubmitTest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: {
            questions: string[];
            answers: { questionId: string; answer: string }[];
            startedAt: string;
        }) => testsApi.submit(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: testKeys.all });
        },
    });
}

export function useTestHistory(params?: { page?: number; limit?: number }) {
    return useQuery<{
        results: TestResult[];
        stats: TestStats;
        pagination: Pagination;
    }>({
        queryKey: testKeys.history(params),
        queryFn: () => testsApi.getHistory(params),
        staleTime: 2 * 60 * 1000,
    });
}

export function useTestStats() {
    return useQuery<TestStats>({
        queryKey: testKeys.stats(),
        queryFn: async () => {
            const response = await testsApi.getHistory({ limit: 1000 });
            return response.stats;
        },
        staleTime: 5 * 60 * 1000,
    });
}

export function useClearTestCache() {
    const queryClient = useQueryClient();

    return () => {
        queryClient.invalidateQueries({ queryKey: testKeys.all });
    };
}
