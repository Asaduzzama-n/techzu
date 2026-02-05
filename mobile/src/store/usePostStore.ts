import { create } from 'zustand';
import { Post, ApiResponse } from '../types';
import api from '../lib/api/client';

interface PostState {
    posts: Post[];
    loading: boolean;
    refreshing: boolean;
    fetchPosts: (searchTerm?: string) => Promise<void>;
    addPost: (post: Post) => void;
    setRefreshing: (refreshing: boolean) => void;
}

export const usePostStore = create<PostState>((set) => ({
    posts: [],
    loading: true,
    refreshing: false,
    fetchPosts: async (searchTerm) => {
        // Only set loading to true if it's the first fetch
        set((state) => ({ refreshing: true, loading: state.posts.length === 0 }));
        try {
            const response = await api.get<ApiResponse<Post[]>>('/posts', {
                params: { username: searchTerm || undefined }
            });
            set({ posts: response.data.data, loading: false, refreshing: false });
        } catch (err) {
            console.error('Fetch posts error:', err);
            set({ loading: false, refreshing: false });
        }
    },
    addPost: (post) => set((state) => ({
        posts: [post, ...state.posts]
    })),
    setRefreshing: (refreshing) => set({ refreshing }),
}));
