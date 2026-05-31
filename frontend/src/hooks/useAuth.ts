import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import type { AuthResponse, User } from "@/types";

export const authKeys = {
    all: ["auth"] as const,
    me: () => [...authKeys.all, "me"] as const,
};

export function useMe() {
    return useQuery({
        queryKey: authKeys.me(),
        queryFn: authApi.getMe,
        retry: false,
        staleTime: 5 * 60 * 1000,
    });
}

export function useRegister() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: (data: { email: string; password: string; name: string }) =>
            authApi.register(data),
        onSuccess: (data) => { },
    });
}

export function useLogin() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: (data: { email: string; password: string }) =>
            authApi.login(data),
        onSuccess: (data) => {
            if (data.token) {
                // Update Zustand store (which also persists to localStorage)
                useAuthStore.getState().login(data.token, data.user);

                queryClient.invalidateQueries({ queryKey: authKeys.all });

                router.push("/dashboard");
            }
        },
    });
}

export function useLogout() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: async () => {
            useAuthStore.getState().logout();
        },
        onSuccess: () => {
            queryClient.clear();

            router.push("/login");
        },
    });
}

export function useVerifyEmail() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: (token: string) => authApi.verifyEmail(token),
        onSuccess: (data) => {
            if (data.token) {
                useAuthStore.getState().login(data.token, data.user);

                queryClient.invalidateQueries({ queryKey: authKeys.all });
            }
        },
    });
}

export function useResendVerification() {
    return useMutation({
        mutationFn: (email: string) => authApi.resendVerification(email),
    });
}

export function useIsAuthenticated(): boolean {
    return useAuthStore.getState().isAuthenticated;
}

export function useCurrentUser(): User | null {
    return useAuthStore.getState().user;
}
