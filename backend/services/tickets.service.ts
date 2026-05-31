import { getQuestionsCollection } from "../utils/db";

export interface TicketDTO {
    ticketNumber: number;
    questionsCount: number;
    categories: string[];
}

export interface TicketQuestionsDTO {
    ticketNumber: number;
    questions: {
        id: string;
        questionId: string;
        questionNumber: number;
        text: string;
        imageUrl: string | null;
        options: { id: string; text: string }[];
        category: string;
    }[];
}

export class TicketsService {
    async getAllTickets(): Promise<{ tickets: TicketDTO[]; total: number }> {
        const questionsCollection = await getQuestionsCollection();

        const tickets = await questionsCollection.aggregate([
            {
                $group: {
                    _id: "$ticketNumber",
                    questionsCount: { $sum: 1 },
                    categories: { $addToSet: "$category" },
                },
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    ticketNumber: "$_id",
                    questionsCount: 1,
                    categories: 1,
                    _id: 0,
                },
            },
        ]).toArray();

        return {
            tickets: tickets as TicketDTO[],
            total: tickets.length,
        };
    }

    async getTicketById(ticketNumber: number): Promise<TicketQuestionsDTO | null> {
        const questionsCollection = await getQuestionsCollection();

        const questions = await questionsCollection
            .find({ ticketNumber })
            .sort({ questionNumber: 1 })
            .toArray();

        if (questions.length === 0) return null;

        return {
            ticketNumber,
            questions: questions.map(q => ({
                id: q._id?.toString() || "",
                questionId: q.questionId,
                questionNumber: q.questionNumber,
                text: q.text,
                imageUrl: q.imageUrl,
                options: q.options,
                category: q.category,
            })),
        };
    }
}

export const ticketsService = new TicketsService();
