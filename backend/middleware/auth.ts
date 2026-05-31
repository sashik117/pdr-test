import { extractToken, verifyToken } from "../utils/jwt";

export default defineEventHandler(async (event) => {
    if (event.method === "OPTIONS") {
        return;
    }

    const path = getRequestURL(event).pathname;

    // Public routes that don't require authentication
    const publicRoutes = [
        "/api/auth/login",
        "/api/auth/register",
        "/api/auth/verify-email",
        "/api/auth/resend-verification",
        "/api/admin/auth/login",
        "/api/theory",
    ];

    const isPublicRoute = publicRoutes.some((route) => path.startsWith(route));

    // Public GET-only routes (questions and tickets listing)
    const publicGetRoutes = [
        "/api/questions",
        "/api/tickets",
        "/api/topics",
    ];
    const isPublicGetRoute =
        event.method === "GET" &&
        publicGetRoutes.some((route) => path.startsWith(route));

    if (isPublicRoute || isPublicGetRoute) {
        // Still try to extract auth if a token is provided (optional auth)
        const authHeader = getRequestHeader(event, "authorization");
        const token = extractToken(authHeader);
        if (token) {
            const payload = verifyToken(token);
            if (payload) {
                event.context.auth = payload;
            }
        }
        return;
    }

    // All other /api/ routes require authentication
    if (path.startsWith("/api/")) {
        const authHeader = getRequestHeader(event, "authorization");
        const token = extractToken(authHeader);

        if (!token) {
            throw createError({
                statusCode: 401,
                message: "Необхідна авторизація",
            });
        }

        const payload = verifyToken(token);
        if (!payload) {
            throw createError({
                statusCode: 401,
                message: "Невірний або застарілий токен",
            });
        }

        event.context.auth = payload;
    }
});
