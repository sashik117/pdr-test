import { AuthProvider } from "@refinedev/core";
import { LoginRequest, LoginResponse, AuthUser } from "../types/user";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api/admin";
const TOKEN_KEY = "admin_token";

export const authProvider: AuthProvider = {
  login: async ({ email, password }: LoginRequest) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            name: "LoginError",
            message: (data as any).statusMessage || "Invalid email or password",
          },
        };
      }

      if (data.success && data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        return {
          success: true,
          redirectTo: "/",
        };
      }

      return {
        success: false,
        error: {
          name: "LoginError",
          message: "Invalid response from server",
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: "LoginError",
          message: "Network error. Please try again.",
        },
      };
    }
  },

  logout: async () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("user");
    return {
      success: true,
      redirectTo: "/login",
    };
  },

  check: async () => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      return {
        authenticated: false,
        redirectTo: "/login",
        logout: true,
      };
    }

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem("user");
        return {
          authenticated: false,
          redirectTo: "/login",
          logout: true,
        };
      }

      const user = await response.json();

      if (user.role !== "admin") {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem("user");
        return {
          authenticated: false,
          redirectTo: "/login",
          logout: true,
          error: {
            name: "Forbidden",
            message: "You don't have permission to access this page",
          },
        };
      }

      return {
        authenticated: true,
      };
    } catch (error) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("user");
      return {
        authenticated: false,
        redirectTo: "/login",
        logout: true,
      };
    }
  },

  getPermissions: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      return null;
    }

    const userStr = localStorage.getItem("user");
    if (!userStr) {
      return null;
    }

    try {
      const user: AuthUser = JSON.parse(userStr);
      return user.role;
    } catch {
      return null;
    }
  },

  getIdentity: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      return null;
    }

    const userStr = localStorage.getItem("user");
    if (!userStr) {
      return null;
    }

    try {
      const user: AuthUser = JSON.parse(userStr);
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          user.name
        )}&background=random`,
      };
    } catch {
      return null;
    }
  },

  onError: async (error) => {
    if (error?.statusCode === 401 || error?.statusCode === 403) {
      return {
        logout: true,
        redirectTo: "/login",
        error,
      };
    }

    return { error };
  },
};
