import bcrypt from "bcryptjs";
import { getUsersCollection, getQuestionsCollection, User } from "../utils/db";
import { ObjectId } from "mongodb";

export interface AdminUserDTO {
    id: string;
    email: string;
    name: string;
    role: string;
    emailVerified: boolean;
    createdAt: Date;
}

export interface AdminQuestionDTO {
    id: string;
    questionId: string;
    ticketNumber: number;
    questionNumber: number;
    text: string;
    imageUrl: string | null;
    options: { id: string; text: string }[];
    correctAnswer: string;
    explanation: string;
    category: string;
    topic?: string;
    difficulty?: number;
}

export interface ListParams {
    start: number;
    end: number;
    sortField: string;
    sortOrder: "ASC" | "DESC";
    filters: Record<string, any>;
}

export class AdminService {
    async getUsers(
        params: ListParams,
    ): Promise<{ items: AdminUserDTO[]; total: number }> {
        const users = await getUsersCollection();
        const skip = params.start;
        const limit = params.end - params.start;
        const sortOrder = params.sortOrder === "DESC" ? -1 : 1;

        const filter: Record<string, unknown> = {};
        if (params.filters.email) {
            filter.email = { $regex: params.filters.email, $options: "i" };
        }
        if (params.filters.name) {
            filter.name = { $regex: params.filters.name, $options: "i" };
        }
        if (params.filters.role) {
            filter.role = params.filters.role;
        }
        if (params.filters.emailVerified !== undefined) {
            filter.emailVerified = params.filters.emailVerified === "true";
        }
        if (params.filters.q) {
            filter.$or = [
                { email: { $regex: params.filters.q, $options: "i" } },
                { name: { $regex: params.filters.q, $options: "i" } },
            ];
        }

        const [items, total] = await Promise.all([
            users
                .find(filter)
                .sort({ [params.sortField]: sortOrder })
                .skip(skip)
                .limit(limit)
                .toArray(),
            users.countDocuments(filter),
        ]);

        return {
            items: items.map((u) => ({
                id: u._id?.toString() || "",
                email: u.email,
                name: u.name,
                role: u.role,
                emailVerified: u.emailVerified,
                createdAt: u.createdAt,
            })),
            total,
        };
    }

    async getUserById(id: string): Promise<AdminUserDTO | null> {
        const users = await getUsersCollection();
        const user = await users.findOne({ _id: new ObjectId(id) as any });
        if (!user) return null;

        return {
            id: user._id?.toString() || "",
            email: user.email,
            name: user.name,
            role: user.role,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt,
        };
    }

    async createUser(data: {
        email: string;
        password: string;
        name: string;
        role?: string;
    }): Promise<AdminUserDTO> {
        const users = await getUsersCollection();
        const hashedPassword = await bcrypt.hash(data.password, 12);

        const newUser = {
            email: data.email.toLowerCase(),
            password: hashedPassword,
            name: data.name,
            role: (data.role || "user") as "user" | "admin",
            emailVerified: true,
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
    }

    async updateUser(
        id: string,
        data: Partial<{
            email: string;
            name: string;
            role: string;
            password: string;
        }>,
    ): Promise<AdminUserDTO | null> {
        const users = await getUsersCollection();
        const updateData: any = { ...data };

        if (data.password) {
            updateData.password = await bcrypt.hash(data.password, 12);
        }
        if (data.email) {
            updateData.email = data.email.toLowerCase();
        }

        await users.updateOne(
            { _id: new ObjectId(id) as any },
            { $set: updateData },
        );
        return this.getUserById(id);
    }

    async deleteUser(id: string): Promise<boolean> {
        const users = await getUsersCollection();
        const result = await users.deleteOne({ _id: new ObjectId(id) as any });
        return result.deletedCount > 0;
    }

    async getQuestions(
        params: ListParams,
    ): Promise<{ items: AdminQuestionDTO[]; total: number }> {
        const questions = await getQuestionsCollection();
        const skip = params.start;
        const limit = params.end - params.start;
        const sortOrder = params.sortOrder === "DESC" ? -1 : 1;

        const filter: Record<string, unknown> = {};
        if (params.filters.questionId) {
            filter.questionId = {
                $regex: params.filters.questionId,
                $options: "i",
            };
        }
        if (params.filters.ticketNumber) {
            filter.ticketNumber = parseInt(params.filters.ticketNumber);
        }
        if (params.filters.category) {
            filter.category = params.filters.category;
        }
        if (params.filters.text) {
            filter.text = { $regex: params.filters.text, $options: "i" };
        }
        if (params.filters.q) {
            filter.$or = [
                { questionId: { $regex: params.filters.q, $options: "i" } },
                { text: { $regex: params.filters.q, $options: "i" } },
                { explanation: { $regex: params.filters.q, $options: "i" } },
            ];
        }

        const [items, total] = await Promise.all([
            questions
                .find(filter)
                .sort({ [params.sortField]: sortOrder })
                .skip(skip)
                .limit(limit)
                .toArray(),
            questions.countDocuments(filter),
        ]);

        return {
            items: items.map((q) => ({
                id: q._id?.toString() || "",
                questionId: q.questionId,
                ticketNumber: q.ticketNumber,
                questionNumber: q.questionNumber,
                text: q.text,
                imageUrl: q.imageUrl,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                category: q.category,
                topic: q.topic,
                difficulty: q.difficulty,
            })),
            total,
        };
    }

    async getQuestionById(id: string): Promise<AdminQuestionDTO | null> {
        const questions = await getQuestionsCollection();
        const question = await questions.findOne({
            _id: new ObjectId(id) as any,
        });
        if (!question) return null;

        return {
            id: question._id?.toString() || "",
            questionId: question.questionId,
            ticketNumber: question.ticketNumber,
            questionNumber: question.questionNumber,
            text: question.text,
            imageUrl: question.imageUrl,
            options: question.options,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
            category: question.category,
            topic: question.topic,
            difficulty: question.difficulty,
        };
    }

    async createQuestion(
        data: Partial<AdminQuestionDTO>,
    ): Promise<AdminQuestionDTO> {
        const questions = await getQuestionsCollection();

        const questionId =
            data.questionId ||
            `Q${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        let ticketNumber = data.ticketNumber;
        let questionNumber = data.questionNumber;

        if (!ticketNumber || !questionNumber) {
            const lastQuestion = await questions.findOne(
                {},
                { sort: { ticketNumber: -1, questionNumber: -1 } },
            );
            ticketNumber =
                ticketNumber || (lastQuestion?.ticketNumber || 0) + 1;
            questionNumber = questionNumber || 1;
        }

        const newQuestion = {
            questionId,
            ticketNumber,
            questionNumber,
            text: data.text || "",
            imageUrl: data.imageUrl || null,
            options: data.options || [],
            correctAnswer: data.correctAnswer || "A",
            explanation: data.explanation || "",
            category: data.category || "general",
            topic: data.topic,
            difficulty: data.difficulty || 1,
        } as any;

        const result = await questions.insertOne(newQuestion);

        return {
            id: result.insertedId.toString(),
            ...newQuestion,
        };
    }

    async updateQuestion(
        id: string,
        data: Partial<AdminQuestionDTO>,
    ): Promise<AdminQuestionDTO | null> {
        const questions = await getQuestionsCollection();
        const { id: _, ...updateData } = data;

        await questions.updateOne(
            { _id: new ObjectId(id) as any },
            { $set: updateData },
        );
        return this.getQuestionById(id);
    }

    async deleteQuestion(id: string): Promise<boolean> {
        const questions = await getQuestionsCollection();
        const result = await questions.deleteOne({
            _id: new ObjectId(id) as any,
        });
        return result.deletedCount > 0;
    }
}

export const adminService = new AdminService();
