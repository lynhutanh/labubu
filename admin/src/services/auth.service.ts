import { APIRequest, TOKEN } from './api-request';
import { ILogin } from '../interfaces';

class AuthService extends APIRequest {
  public async login(data: ILogin) {
    return this.post('/auth/login', data);
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN, token);
    }
  }

  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN);
    }
  }

  updatePassword(password: string, source?: string) {
    return this.put('/auth/users/me/password', { password, source });
  }

  getCurrentUser() {
    return this.get('/auth/me');
  }
}

export const authService = new AuthService();




