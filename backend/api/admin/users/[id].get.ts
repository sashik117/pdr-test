import { adminService } from "../../../services/admin.service";

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, "id");

    if (!id) {
        throw createError({ statusCode: 400, message: "ID обов'язковий" });
    }

    const user = await adminService.getUserById(id);

    if (!user) {
        throw createError({ statusCode: 404, message: "Користувача не знайдено" });
    }

    return user;
});
