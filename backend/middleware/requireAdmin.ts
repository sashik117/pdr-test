import { H3Event } from "h3";
import { verifyJWT } from "../utils/jwt";
import { getUsersCollection } from "../utils/db";
import { ObjectId } from "mongodb";

export default defineEventHandler(async (event: H3Event) => {
    const path = event.path;
    if (!path.startsWith("/api/admin")) {
        return;
    }

    if (
        path.startsWith("/api/admin/auth/login") ||
        path.startsWith("/api/admin/auth/register")
    ) {
        return;
    }

    const authHeader = getHeader(event, "authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw createError({
            statusCode: 401,
            statusMessage: "Unauthorized - No token provided",
        });
    }

    const token = authHeader.substring(7);

    try {
        const payload = verifyJWT(token);

        if (!payload || !payload.userId) {
            throw createError({
                statusCode: 401,
                statusMessage: "Unauthorized - Invalid token",
            });
        }

        const users = await getUsersCollection();
        const user = await users.findOne({ _id: new ObjectId(payload.userId) });

        if (!user) {
            throw createError({
                statusCode: 401,
                statusMessage: "Unauthorized - User not found",
            });
        }

        if (user.role !== "admin") {
            throw createError({
                statusCode: 403,
                statusMessage: "Forbidden - Admin access required",
            });
        }

        event.context.user = {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
        };
    } catch (error: any) {
        if (error.statusCode) {
            throw error;
        }
        throw createError({
            statusCode: 401,
            statusMessage: "Unauthorized - Invalid token",
        });
    }
});
