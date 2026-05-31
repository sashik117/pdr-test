import { getUsersCollection } from "../../../utils/db";
import bcrypt from "bcryptjs";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    if (!body.email || !body.password || !body.name) {
        throw createError({
            statusCode: 400,
            statusMessage: "Missing required fields: email, password, name",
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid email format",
        });
    }

    if (body.password.length < 6) {
        throw createError({
            statusCode: 400,
            statusMessage: "Password must be at least 6 characters",
        });
    }

    const role = body.role || "user";
    if (role !== "user" && role !== "admin") {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid role. Must be "user" or "admin"',
        });
    }

    const users = await getUsersCollection();

    const existingUser = await users.findOne({
        email: body.email.toLowerCase(),
    });
    if (existingUser) {
        throw createError({
            statusCode: 409,
            statusMessage: `User with email ${body.email} already exists`,
        });
    }

    const hashedPassword = await bcrypt.hash(body.password, 12);

    const newUser = {
        email: body.email.toLowerCase(),
        password: hashedPassword,
        name: body.name,
        role: role as "user" | "admin",
        emailVerified:
            body.emailVerified !== undefined
                ? Boolean(body.emailVerified)
                : false,
        createdAt: new Date(),
    };

    const result = await users.insertOne(newUser);

    return {
        id: result.insertedId.toString(),
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        emailVerified: newUser.emailVerified,
        createdAt: newUser.createdAt,
    };
});
