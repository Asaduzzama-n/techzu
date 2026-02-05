import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { User, ApiResponse } from '../types';
import api from '../lib/api/client';

interface AuthState {
    token: string | null;
    refreshToken: string | null;
    role: string | null;
    user: User | null;
    isAuthenticated: boolean;
    setAuth: (token: string, refreshToken: string, role: string, user: User) => Promise<void>;
    logout: () => Promise<void>;
    initialize: () => Promise<void>;
    fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    refreshToken: null,
    role: null,
    user: null,
    isAuthenticated: false,
    setAuth: async (token, refreshToken, role, user) => {
        await SecureStore.setItemAsync('accessToken', token);
        if (refreshToken) {
            await SecureStore.setItemAsync('refreshToken', refreshToken);
        }
        await SecureStore.setItemAsync('role', role);
        if (user) {
            await SecureStore.setItemAsync('user', JSON.stringify(user));
        }
        set({ token, refreshToken, role, user: user || null, isAuthenticated: true });
    },
    logout: async () => {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        await SecureStore.deleteItemAsync('role');
        await SecureStore.deleteItemAsync('user');
        set({ token: null, refreshToken: null, role: null, user: null, isAuthenticated: false });
    },
    initialize: async () => {
        const token = await SecureStore.getItemAsync('accessToken');
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        const role = await SecureStore.getItemAsync('role');
        const userStr = await SecureStore.getItemAsync('user');
        const user = userStr ? JSON.parse(userStr) : null;
        if (token) {
            set({ token, refreshToken, role, user, isAuthenticated: true });
            // Fetch latest profile in background
            useAuthStore.getState().fetchProfile().catch(console.error);
        }
    },
    fetchProfile: async () => {
        try {
            const response = await api.get<ApiResponse<User>>('/user/profile');
            if (response.data.success) {
                const updatedUser = response.data.data;
                await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
                set({ user: updatedUser });
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            // If fetching profile fails with 401, we might want to logout
        }
    },
}));
