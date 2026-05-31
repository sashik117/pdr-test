import { adminService } from "../../../services/admin.service";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);

    const params = {
        start: parseInt(query._start as string) || 0,
        end: parseInt(query._end as string) || 10,
        sortField: (query._sort as string) || "createdAt",
        sortOrder: (query._order as "ASC" | "DESC") || "ASC",
        filters: {
            email: query.email,
            name: query.name,
            role: query.role,
            emailVerified: query.emailVerified,
            q: query.q,
        },
    };

    const { items, total } = await adminService.getUsers(params);

    setResponseHeader(event, "X-Total-Count", total.toString());
    setResponseHeader(event, "Access-Control-Expose-Headers", "X-Total-Count");

    return items;
});
