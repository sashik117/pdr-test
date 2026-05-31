import { useQuery } from "@tanstack/react-query";
import { ticketsApi } from "@/lib/api";
import type { Ticket, Question } from "@/types";

export const ticketKeys = {
    all: ["tickets"] as const,
    lists: () => [...ticketKeys.all, "list"] as const,
    list: () => [...ticketKeys.lists()] as const,
    details: () => [...ticketKeys.all, "detail"] as const,
    detail: (id: number) => [...ticketKeys.details(), id] as const,
};

export function useTickets() {
    return useQuery<{
        tickets: Ticket[];
        total: number;
    }>({
        queryKey: ticketKeys.list(),
        queryFn: ticketsApi.getAll,
        staleTime: 30 * 60 * 1000,
    });
}

export function useTicket(id: number | null, enabled: boolean = true) {
    return useQuery<{
        ticketNumber: number;
        questions: Question[];
        totalQuestions: number;
    }>({
        queryKey: ticketKeys.detail(id || 0),
        queryFn: () => ticketsApi.getById(id!),
        enabled: enabled && !!id && id > 0 && id <= 117,
        staleTime: 15 * 60 * 1000,
    });
}

export function useTicketExists(id: number): boolean {
    return id >= 1 && id <= 117;
}
