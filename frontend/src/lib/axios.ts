import axios from "axios";
import { useAuthStore } from "@/lib/auth";

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: false,
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const url = error.config?.url || "";
            if (!url.includes("/auth/") && useAuthStore.getState().isAuthenticated) {
                useAuthStore.getState().logout();
            }
        }
        return Promise.reject(error);
    },
);

export default axiosInstance;
