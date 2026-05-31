import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().email('Невірний формат email'),
    password: z.string().min(6, 'Пароль повинен містити мінімум 6 символів'),
    name: z.string().min(2, 'Ім\'я повинно містити мінімум 2 символи'),
});

export const loginSchema = z.object({
    email: z.string().email('Невірний формат email'),
    password: z.string().min(1, 'Введіть пароль'),
});

export const submitTestSchema = z.object({
    questions: z.array(z.string()),
    answers: z.array(z.object({
        questionId: z.string(),
        answer: z.string(),
    })),
    startedAt: z.string().datetime(),
});

export const idParamSchema = z.object({
    id: z.string().min(1, 'ID is required'),
});

export const slugParamSchema = z.object({
    slug: z.string().min(1, 'Slug is required'),
});

export const paginationSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
});

export const adminUpdateQuestionSchema = z.object({
    text: z.string().min(1, 'Text is required').optional(),
    imageUrl: z.string().optional().nullable(),
    topic: z.string().optional(),
    difficulty: z.number().min(1).max(5).optional(),
    options: z.array(z.object({
        id: z.string(),
        text: z.string(),
    })).optional(),
    correctAnswer: z.string().optional(),
    explanation: z.string().optional(),
});

export const adminCreateQuestionSchema = z.object({
    text: z.string().min(1, 'Text is required'),
    imageUrl: z.string().optional().nullable(),
    topic: z.string().optional(),
    difficulty: z.number().min(1).max(5).optional(),
    options: z.array(z.object({
        id: z.string(),
        text: z.string(),
    })),
    correctAnswer: z.string().min(1, 'Correct answer is required'),
    explanation: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SubmitTestInput = z.infer<typeof submitTestSchema>;
