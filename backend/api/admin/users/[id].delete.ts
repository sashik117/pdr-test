import { getUsersCollection } from "../../../utils/db";
import { ObjectId } from "mongodb";

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, "id");

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: "User ID is required",
        });
    }

    if (!ObjectId.isValid(id)) {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid user ID",
        });
    }

    const users = await getUsersCollection();

    const user = await users.findOne({ _id: new ObjectId(id) });
    if (!user) {
        throw createError({
            statusCode: 404,
            statusMessage: "User not found",
        });
    }

    if (user.role === "admin") {
        const adminCount = await users.countDocuments({ role: "admin" });
        if (adminCount <= 1) {
            throw createError({
                statusCode: 400,
                statusMessage: "Cannot delete the last admin user",
            });
        }
    }

    const currentUserId = event.context.user?.id;
    if (currentUserId && currentUserId === id) {
        throw createError({
            statusCode: 400,
            statusMessage: "Cannot delete your own account",
        });
    }

    const result = await users.findOneAndDelete({ _id: new ObjectId(id) });

    if (!result) {
        throw createError({
            statusCode: 404,
            statusMessage: "User not found",
        });
    }

    return {
        id: result._id?.toString(),
        email: result.email,
        message: "User deleted successfully",
    };
});
