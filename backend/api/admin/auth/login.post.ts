import bcrypt from "bcryptjs";
import { getUsersCollection } from "../../../utils/db";
import { signJWT } from "../../../utils/jwt";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    if (!body.email || !body.password) {
        throw createError({
            statusCode: 400,
            statusMessage: "Email and password are required",
        });
    }

    const users = await getUsersCollection();

    const user = await users.findOne({ email: body.email.toLowerCase() });

    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: "Invalid email or password",
        });
    }

    if (user.role !== "admin") {
        throw createError({
            statusCode: 403,
            statusMessage: "Access denied. Admin privileges required.",
        });
    }

    const isPasswordValid = await bcrypt.compare(body.password, user.password);

    if (!isPasswordValid) {
        throw createError({
            statusCode: 401,
            statusMessage: "Invalid email or password",
        });
    }

    if (!user.emailVerified) {
        throw createError({
            statusCode: 403,
            statusMessage:
                "Please verify your email before accessing the admin panel",
        });
    }

    const token = signJWT({
        userId: user._id!.toString(),
        email: user.email,
        role: user.role,
    });

    return {
        success: true,
        token,
        user: {
            id: user._id!.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
        },
    };
});
