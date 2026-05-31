import { getUsersCollection } from "../../../utils/db";
import { ObjectId } from "mongodb";

export default defineEventHandler(async (event) => {
    const currentUser = event.context.user;

    if (!currentUser || !currentUser.id) {
        throw createError({
            statusCode: 401,
            statusMessage: "Unauthorized",
        });
    }

    const users = await getUsersCollection();

    const user = await users.findOne({ _id: new ObjectId(currentUser.id) });

    if (!user) {
        throw createError({
            statusCode: 404,
            statusMessage: "User not found",
        });
    }

    return {
        id: user._id?.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
    };
});
