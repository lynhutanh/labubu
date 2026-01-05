export interface LoginPayload {
  username: string;
  password: string;
  remember?: boolean;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  name?: string;
  gender?: string;
  phone?: string;
  address?: string;
}

export interface UserProfile {
  _id: string;
  username: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: string;
  status?: string;
  [key: string]: any;
}

export interface LoginResponse {
  token: string;
  user: UserProfile;
}

export interface RegisterResponse {
  message: string;
  token: string;
  user?: UserProfile;
}

export interface ApiResponse<T> {
  status: number;
  data?: T;
  message?: string;
  error?: any;
}

