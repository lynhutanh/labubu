export interface ILogin {
  username: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  token: string;
  user: {
    _id: string;
    email: string;
    username: string;
    name?: string;
    role: string;
    isSeller: boolean;
  };
}

