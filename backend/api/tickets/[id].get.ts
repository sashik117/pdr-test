import { ticketsService } from "../../services/tickets.service";
import { idParamSchema } from "../../utils/schemas";
import { z } from "zod";

const ticketIdSchema = z.object({
    id: z.coerce.number().int().positive("ID білету повинен бути позитивним числом"),
});

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, "id");

    const result = ticketIdSchema.safeParse({ id });
    if (!result.success) {
        throw createError({
            statusCode: 400,
            message: result.error.errors[0].message,
        });
    }

    const ticket = await ticketsService.getTicketById(result.data.id);

    if (!ticket) {
        throw createError({
            statusCode: 404,
            message: "Білет не знайдено",
        });
    }

    return ticket;
});
