export const corsConfig = {
    allowedOrigins: ["http://localhost:3000", "http://localhost:3001"],

    allowedMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],

    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
        "Origin",
    ],

    allowCredentials: true,

    maxAge: 86400,
};

export function isOriginAllowed(origin: string | undefined): boolean {
    if (!origin) return false;

    if (
        process.env.NODE_ENV === "development" &&
        origin.includes("localhost")
    ) {
        return true;
    }

    return corsConfig.allowedOrigins.includes(origin);
}

export function getAllowedOrigin(requestOrigin: string | undefined): string {
    if (requestOrigin && isOriginAllowed(requestOrigin)) {
        return requestOrigin;
    }

    return corsConfig.allowedOrigins[0] || "*";
}
