import bcrypt from "bcryptjs";
import crypto from "crypto";
import { getUsersCollection } from "../models/user.model";
import { signToken } from "../utils/jwt";
import { sendVerificationEmail, sendPasswordResetEmail } from "../utils/email";
import logger from "../utils/logger";
import { ObjectId } from "mongodb";

export interface LoginResult {
    success: boolean;
    token: string;
    user: {
        id: string;
        email: string;
        name: string;
        emailVerified: boolean;
    };
}

export interface RegisterResult {
    success: boolean;
    message: string;
    user: {
        id: string;
        email: string;
        name: string;
        emailVerified: boolean;
    };
}

export interface UserDTO {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    role: string;
    createdAt: Date;
}

export class AuthService {
    async login(email: string, password: string): Promise<LoginResult> {
        const users = await getUsersCollection();

        const user = await users.findOne({ email: email.toLowerCase() });
        if (!user) {
            throw new Error("Невірний email або пароль");
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error("Невірний email або пароль");
        }

        if (!user.emailVerified) {
            const error = new Error("Email не підтверджено") as any;
            error.code = "EMAIL_NOT_VERIFIED";
            error.data = { emailVerified: false, email: user.email };
            throw error;
        }

        const token = signToken({
            userId: user._id!.toString(),
            email: user.email,
        });

        logger.info(`User logged in: ${user.email}`);

        return {
            success: true,
            token,
            user: {
                id: user._id!.toString(),
                email: user.email,
                name: user.name,
                emailVerified: user.emailVerified,
            },
        };
    }

    async register(email: string, password: string, name: string): Promise<RegisterResult> {
        const users = await getUsersCollection();

        const existingUser = await users.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            throw new Error("Користувач з таким email вже існує");
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const newUser = {
            email: email.toLowerCase(),
            password: hashedPassword,
            name,
            role: "user" as const,
            emailVerified: false,
            verificationToken,
            verificationTokenExpires,
            createdAt: new Date(),
        };

        const insertResult = await users.insertOne(newUser);

        logger.info(`New user registered: ${email}`);

        try {
            await sendVerificationEmail(email, name, verificationToken);
        } catch (error) {
            logger.error("Failed to send verification email:", { error });
        }

        return {
            success: true,
            message: "Реєстрація успішна! Перевірте ваш email для підтвердження облікового запису.",
            user: {
                id: insertResult.insertedId.toString(),
                email: newUser.email,
                name: newUser.name,
                emailVerified: false,
            },
        };
    }

    async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
        const users = await getUsersCollection();

        const user = await users.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: new Date() },
        });

        if (!user) {
            throw new Error("Невірний або прострочений токен підтвердження");
        }

        await users.updateOne(
            { _id: user._id },
            {
                $set: { emailVerified: true },
                $unset: { verificationToken: "", verificationTokenExpires: "" },
            }
        );

        logger.info(`Email verified for user: ${user.email}`);

        return {
            success: true,
            message: "Email успішно підтверджено! Тепер ви можете увійти.",
        };
    }

    async resendVerification(email: string): Promise<{ success: boolean; message: string }> {
        const users = await getUsersCollection();

        const user = await users.findOne({ email: email.toLowerCase() });
        if (!user) {
            throw new Error("Користувача з таким email не знайдено");
        }

        if (user.emailVerified) {
            throw new Error("Email вже підтверджено");
        }

        const verificationToken = crypto.randomBytes(32).toString("hex");
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await users.updateOne(
            { _id: user._id },
            { $set: { verificationToken, verificationTokenExpires } }
        );

        await sendVerificationEmail(email, user.name, verificationToken);

        logger.info(`Verification email resent to: ${email}`);

        return {
            success: true,
            message: "Лист з підтвердженням надіслано повторно",
        };
    }

    async getUserById(userId: string): Promise<UserDTO | null> {
        const users = await getUsersCollection();

        const user = await users.findOne({ _id: new ObjectId(userId) as any });
        if (!user) return null;

        return {
            id: user._id!.toString(),
            email: user.email,
            name: user.name,
            emailVerified: user.emailVerified,
            role: user.role,
            createdAt: user.createdAt,
        };
    }
}

export const authService = new AuthService();
