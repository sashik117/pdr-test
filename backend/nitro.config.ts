import { defineNitroConfig } from "nitropack/config";

export default defineNitroConfig({
    compatibilityDate: "2024-01-01",

    runtimeConfig: {
        jwtSecret:
            process.env.JWT_SECRET ||
            "your-super-secret-jwt-key-change-in-production",
        mongoUri:
            process.env.MONGO_URI || "mongodb://localhost:27017/pdr-ukraine",
        frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
    },

    publicAssets: [
        {
            baseURL: "/images",
            dir: "public/images",
            maxAge: 60 * 60 * 24 * 365, // 1 year
        },
    ],

    routeRules: {
        "/images/**": {
            headers: {
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        },
    },
});
