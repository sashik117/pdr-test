import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),
    PORT: z.coerce.number().default(3001),
    LOG_LEVEL: z
        .enum(["error", "warn", "info", "http", "debug"])
        .default("info"),

    MONGO_URI: z.string().url(),

    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.string().default("7d"),

    FRONTEND_URL: z.string().url().default("http://localhost:3000"),

    RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
    RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

    LIQPAY_PUBLIC_KEY: z.string(),
    LIQPAY_PRIVATE_KEY: z.string(),
});

type EnvConfig = z.infer<typeof envSchema>;

const processEnv = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    LOG_LEVEL: process.env.LOG_LEVEL,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    FRONTEND_URL: process.env.FRONTEND_URL,
    RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
    RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS,
    LIQPAY_PUBLIC_KEY: process.env.LIQPAY_PUBLIC_KEY,
    LIQPAY_PRIVATE_KEY: process.env.LIQPAY_PRIVATE_KEY,
};

const parsed = envSchema.safeParse(processEnv);
const isDevelopment = process.env.NODE_ENV !== "production";

let config: EnvConfig;

if (!parsed.success) {
    if (process.env.NODE_ENV === "test") {
        console.warn(
            "Invalid environment variables (Test Mode):",
            JSON.stringify(parsed.error.format(), null, 2),
        );

        config = {
            NODE_ENV: "test",
            PORT: 3001,
            LOG_LEVEL: "info",
            MONGO_URI: "mongodb://localhost:27017/pdr-test",
            JWT_SECRET: "test-secret-key-at-least-32-characters-long",
            JWT_EXPIRES_IN: "7d",
            FRONTEND_URL: "http://localhost:3000",
            RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,
            RATE_LIMIT_MAX_REQUESTS: 100,
            LIQPAY_PUBLIC_KEY: "test_public_key",
            LIQPAY_PRIVATE_KEY: "test_private_key",
        };
    } else if (
        isDevelopment &&
        parsed.error.issues.every(
            (issue) =>
                issue.path[0] === "LIQPAY_PUBLIC_KEY" ||
                issue.path[0] === "LIQPAY_PRIVATE_KEY",
        )
    ) {
        console.warn(
            "LiqPay keys are missing in development mode. Using sandbox placeholders.",
        );

        config = {
            NODE_ENV:
                (process.env.NODE_ENV as "development" | "production" | "test") ||
                "development",
            PORT: Number(process.env.PORT) || 3001,
            LOG_LEVEL:
                (process.env.LOG_LEVEL as
                    | "error"
                    | "warn"
                    | "info"
                    | "http"
                    | "debug") || "info",
            MONGO_URI:
                process.env.MONGO_URI ||
                "mongodb://localhost:27017/pdr-ukraine",
            JWT_SECRET:
                process.env.JWT_SECRET ||
                "your-super-secret-jwt-key-change-in-production",
            JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
            FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
            RATE_LIMIT_WINDOW_MS:
                Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
            RATE_LIMIT_MAX_REQUESTS:
                Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
            LIQPAY_PUBLIC_KEY: "sandbox_public_key",
            LIQPAY_PRIVATE_KEY: "sandbox_private_key",
        };
    } else {
        console.error(
            "Invalid environment variables:",
            JSON.stringify(parsed.error.format(), null, 2),
        );
        process.exit(1);
    }
} else {
    config = parsed.data;
}

export { config };
export default config;
