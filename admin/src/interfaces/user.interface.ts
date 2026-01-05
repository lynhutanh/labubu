export interface UserSearchParams {
  q?: string;
  role?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface UserResponse {
  _id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  avatarPath: string;
  status: string;
  dateOfBirth?: Date;
  gender?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSearchResponse {
  data: UserResponse[];
  total: number;
}

export interface CreateUserPayload {
  name: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
}

