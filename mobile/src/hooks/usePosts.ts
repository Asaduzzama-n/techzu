import { useQuery } from '@tanstack/react-query';
import api from '../lib/api/client';
import { Post, ApiResponse } from '../types';

export const usePosts = (searchTerm?: string) => {
    return useQuery({
        queryKey: ['posts', searchTerm],
        queryFn: async () => {
            const response = await api.get<ApiResponse<Post[]>>('/posts', {
                params: { searchTerm: searchTerm || undefined }
            });
            return response.data.data;
        },
        placeholderData: (previousData) => previousData,
    });
};

export const useMyPosts = () => {
    return useQuery({
        queryKey: ['my-posts'],
        queryFn: async () => {
            const response = await api.get<ApiResponse<Post[]>>('/posts/my-posts');
            return response.data.data;
        },
        placeholderData: (previousData) => previousData,
    });
};
