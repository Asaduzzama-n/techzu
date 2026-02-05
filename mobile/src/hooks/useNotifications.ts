import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api/client';
import { ApiResponse, Notification } from '../types';

export const useNotifications = () => {
    return useInfiniteQuery({
        queryKey: ['notifications'],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await api.get<ApiResponse<Notification[]>>(`/notifications?page=${pageParam}&limit=10`);
            return response.data;
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.meta && lastPage.meta.page < Math.ceil(lastPage.meta.total / lastPage.meta.limit)) {
                return lastPage.meta.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
    });
};

export const useMarkAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.patch(`/notifications/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};

export const useMarkAllAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            await api.patch('/notifications/all');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};
