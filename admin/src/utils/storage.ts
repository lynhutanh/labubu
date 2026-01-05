export const storage = {
  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  },

  setUser(user: any): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  },

  getUser(): any | null {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  removeUser(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  },

  clear(): void {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  },
};








