import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api/client';

export const useComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
            const response = await api.post(`/posts/${postId}/comment`, { content });
            return response.data;
        },
        onSuccess: () => {
            // Invalidate posts to refresh data
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
    });
};
