import { ticketsService } from "../../services/tickets.service";

export default defineEventHandler(async () => {
    return await ticketsService.getAllTickets();
});
