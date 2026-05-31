export interface User {
    id: string;
    email: string;
    name: string;
    role: "user" | "admin";
    emailVerified: boolean;
    createdAt: Date | string;
    updatedAt?: Date | string;
}

export interface UserFilterVariables {
    q?: string;
    email?: string;
    name?: string;
    role?: "user" | "admin";
    emailVerified?: boolean;
}

export interface UserCreateInput {
    email: string;
    password: string;
    name: string;
    role?: "user" | "admin";
    emailVerified?: boolean;
}

export interface UserUpdateInput extends Partial<UserCreateInput> {
    id: string;
}

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    token: string;
    user: AuthUser;
}
