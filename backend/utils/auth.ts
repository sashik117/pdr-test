import { H3Event } from "h3";
import { JWTPayload } from "./jwt";

export interface AuthUser {
    id: string;
    email: string;
    role?: string;
}

/**
 * Extracts user information from the event context
 * Returns null if user is not authenticated
 */
export async function getUserFromEvent(
    event: H3Event,
): Promise<AuthUser | null> {
    const auth = event.context.auth as JWTPayload | undefined;

    if (!auth || !auth.userId) {
        return null;
    }

    return {
        id: auth.userId,
        email: auth.email,
        role: auth.role,
    };
}
