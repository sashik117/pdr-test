import { getUsersCollection } from "../../../utils/db";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, "id");

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: "User ID is required",
        });
    }

    const body = await readBody(event);

    if (!ObjectId.isValid(id)) {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid user ID",
        });
    }

    const users = await getUsersCollection();

    const existingUser = await users.findOne({ _id: new ObjectId(id) });
    if (!existingUser) {
        throw createError({
            statusCode: 404,
            statusMessage: "User not found",
        });
    }

    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) {
        updateData.name = body.name;
    }

    if (body.email !== undefined) {
        const emailExists = await users.findOne({
            email: body.email.toLowerCase(),
            _id: { $ne: new ObjectId(id) },
        });

        if (emailExists) {
            throw createError({
                statusCode: 400,
                statusMessage: "Email is already in use",
            });
        }

        updateData.email = body.email.toLowerCase();
    }

    if (body.role !== undefined) {
        if (body.role !== "user" && body.role !== "admin") {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid role. Must be "user" or "admin"',
            });
        }

        if (existingUser.role === "admin" && body.role === "user") {
            const adminCount = await users.countDocuments({ role: "admin" });
            if (adminCount <= 1) {
                throw createError({
                    statusCode: 400,
                    statusMessage: "Cannot remove the last admin user",
                });
            }
        }

        updateData.role = body.role;
    }

    if (body.emailVerified !== undefined) {
        updateData.emailVerified = Boolean(body.emailVerified);
    }

    if (body.password && body.password.trim() !== "") {
        if (body.password.length < 6) {
            throw createError({
                statusCode: 400,
                statusMessage: "Password must be at least 6 characters",
            });
        }
        updateData.password = await bcrypt.hash(body.password, 12);
    }

    const result = await users.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: "after" },
    );

    if (!result) {
        throw createError({
            statusCode: 404,
            statusMessage: "User not found",
        });
    }

    return {
        id: result._id?.toString(),
        email: result.email,
        name: result.name,
        role: result.role,
        emailVerified: result.emailVerified,
        createdAt: result.createdAt,
    };
});
