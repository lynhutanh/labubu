import { APIRequest, IResponse } from "./api-request";
import type {
  LoginPayload,
  RegisterPayload,
  LoginResponse,
  RegisterResponse,
  ApiResponse,
  GoogleLoginPayload,
  FacebookLoginPayload,
} from "../interfaces";
import { storage } from "../utils/storage";
import { TOKEN } from "./api-request";

export class AuthService extends APIRequest {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const response: ApiResponse<LoginResponse> = await this.post(
      "/auth/login",
      payload,
    );

    if (response && response.data) {
      const { token, user } = response.data;
      if (typeof window !== "undefined") {
        localStorage.setItem(TOKEN, token);
        storage.setUser(user);
      }
      return { token, user };
    }

    throw new Error(response?.message || "Login failed");
  }

  async register(payload: RegisterPayload): Promise<RegisterResponse> {
    const response: ApiResponse<RegisterResponse> = await this.post(
      "/auth/users/register",
      payload,
    );

    if (response && response.data) {
      const { token, message, user } = response.data;
      if (typeof window !== "undefined") {
        localStorage.setItem(TOKEN, token);
        if (user) {
          storage.setUser(user);
        }
      }
      return { token, message, user };
    }

    throw new Error(response?.message || "Registration failed");
  }

  async loginWithGoogle(
    payload: GoogleLoginPayload | string,
  ): Promise<LoginResponse> {
    const credential =
      typeof payload === "string" ? payload : payload.credential;

    const response: ApiResponse<LoginResponse> = await this.post(
      "/auth/google/login",
      { credential },
    );

    if (response && response.data) {
      const { token, user } = response.data;
      if (typeof window !== "undefined") {
        localStorage.setItem(TOKEN, token);
        storage.setUser(user);
      }
      return { token, user };
    }

    throw new Error(response?.message || "Google login failed");
  }

  async loginWithFacebook(
    payload: FacebookLoginPayload,
  ): Promise<LoginResponse> {
    const response: ApiResponse<LoginResponse> = await this.post(
      "/auth/facebook/login",
      payload,
    );

    if (response && response.data) {
      const { token, user } = response.data;
      if (typeof window !== "undefined") {
        localStorage.setItem(TOKEN, token);
        storage.setUser(user);
      }
      return { token, user };
    }

    throw new Error(response?.message || "Facebook login failed");
  }

  logout(): void {
    storage.clear();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response: ApiResponse<{ message: string }> = await this.post(
      "/auth/forgot-password",
      { email },
    );

    if (response && response.data) {
      return response.data;
    }

    throw new Error(response?.message || "Failed to send reset email");
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const response: ApiResponse<{ message: string }> = await this.post(
      "/auth/reset-password",
      { token, password },
    );

    if (response && response.data) {
      return response.data;
    }

    throw new Error(response?.message || "Failed to reset password");
  }
}

export const authService = new AuthService();

