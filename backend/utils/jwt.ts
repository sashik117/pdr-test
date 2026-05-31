import jwt from "jsonwebtoken";

export interface JWTPayload {
    userId: string;
    email: string;
    role?: string;
}

export function signToken(payload: JWTPayload): string {
    const config = useRuntimeConfig();
    return jwt.sign(payload, config.jwtSecret as string, {
        expiresIn: "7d",
    });
}

export function verifyToken(token: string): JWTPayload | null {
    try {
        const config = useRuntimeConfig();
        const decoded = jwt.verify(
            token,
            config.jwtSecret as string,
        ) as JWTPayload;
        return decoded;
    } catch {
        return null;
    }
}

export function extractToken(authHeader: string | undefined): string | null {
    if (!authHeader) return null;
    if (!authHeader.startsWith("Bearer ")) return null;
    return authHeader.slice(7);
}

export const signJWT = signToken;
export const verifyJWT = verifyToken;
