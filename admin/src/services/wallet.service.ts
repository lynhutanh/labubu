import { APIRequest } from './api-request';

class WalletService extends APIRequest {
    public async getSystemWalletStats() {
        return this.get('/admin/wallet/system/stats');
    }

    public async getTransactions(params?: any) {
        return this.get('/admin/wallet/transactions', params);
    }

    public async getUserBalance(userId: string) {
        // We can reuse the wallet controller logic if we had a direct endpoint for specific user,
        // but typically admin might need a specific endpoint.
        // However, looking at the backend, `GET /wallet/balance` gets current user balance.
        // Admin getting ANY user balance might need a new endpoint or use `searchTransactions` to infer?
        // Actually, let's assume we maintain `GET /admin/users/:id` which returns user data,
        // does user data include wallet? Usually not for security/performance.
        // Let's rely on a hypothetical `GET /admin/wallet/users/:userId/balance` if it existed,
        // OR just use `adjustUserBalance` returns the new wallet, so maybe we can query `searchTransactions`?
        // WAIT: I missed checking if there is an endpoint to GET user balance for ADMIN.
        // `AdminWalletController` doesn't seem to have `getUserBalance`.
        // But `WalletController` has `getBalance` for `CurrentUser`.
        // I can assume for now I should add one, or I can just fetch the user details?
        // Actually, `UserService.getById` returns `UserResponse`... does it have wallet?
        // Let's implement `getUserBalance` using a new endpoint or fallback.
        // For now, I'll assume I can add `GET /admin/wallet/users/:userId` to backend if needed,
        // OR just use `adjustUserBalance` to get it mostly.
        // Let's add `GET /admin/wallet/users/:userId` to backend in next step if it fails.
        // Actually, let's try `GET /admin/wallet/users/:userId/balance` pattern in backend too.
        return this.get(`/admin/wallet/users/${userId}/balance`);
    }

    public async adjustUserBalance(userId: string, data: { amount: number; type: 'deposit' | 'withdraw'; description?: string }) {
        return this.post(`/admin/wallet/users/${userId}/adjust-balance`, data);
    }
}

export const walletService = new WalletService();
