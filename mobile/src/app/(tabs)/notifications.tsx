import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/hooks/useNotifications';
import Colors from '@/constants/Colors';
import { Notification } from '@/types';
import { useRouter } from 'expo-router';
import { ChevronLeft, CheckCheck } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsScreen() {
    const router = useRouter();
    const {
        data,
        isLoading,
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage,
        refetch,
        isFetching
    } = useNotifications();

    const { mutate: markAsRead } = useMarkAsRead();
    const { mutate: markAllAsRead } = useMarkAllAsRead();

    const notifications = data?.pages.flatMap(page => page.data) || [];
    const primaryColor = Colors.light.primary;

    const renderItem = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            style={[styles.notificationItem, !item.isRead && styles.unreadItem]}
            onPress={() => !item.isRead && markAsRead(item._id)}
            activeOpacity={0.7}
        >
            <View style={[styles.avatar, { backgroundColor: primaryColor }]}>
                <Text style={styles.avatarText}>{item.from?.name?.[0] || 'U'}</Text>
            </View>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.time}>
                        {(() => {
                            try {
                                const date = new Date(item.createdAt);
                                return isNaN(date.getTime()) ? '' : formatDistanceToNow(date, { addSuffix: true });
                            } catch (e) {
                                return '';
                            }
                        })()}
                    </Text>
                </View>
                <Text style={styles.body}>{item.body}</Text>
            </View>
            {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: primaryColor }]} />}
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={primaryColor} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.topBar}>
                <View style={styles.leftHeader}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ChevronLeft size={28} color="#1e293b" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Notifications</Text>
                </View>
                {notifications.some(n => !n.isRead) && (
                    <TouchableOpacity
                        onPress={() => markAllAsRead()}
                        style={styles.markAllButton}
                    >
                        <CheckCheck size={20} color={primaryColor} />
                        <Text style={[styles.markAllText, { color: primaryColor }]}>Mark all as read</Text>
                    </TouchableOpacity>
                )}
            </View>

            <FlashList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={(item, index) => item._id || index.toString()}
                onEndReached={() => {
                    if (hasNextPage && !isFetchingNextPage) {
                        fetchNextPage();
                    }
                }}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl
                        refreshing={isFetching}
                        onRefresh={refetch}
                        tintColor={primaryColor}
                    />
                }
                ListFooterComponent={() =>
                    isFetchingNextPage ? <ActivityIndicator style={styles.footerLoader} color={primaryColor} /> : null
                }
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No notifications yet</Text>
                    </View>
                )}
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9'
    },
    leftHeader: { flexDirection: 'row', alignItems: 'center' },
    backButton: { padding: 4, marginRight: 8 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b' },
    markAllButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    markAllText: { fontSize: 13, fontWeight: '600' },
    listContent: { flexGrow: 1 },
    notificationItem: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        alignItems: 'flex-start'
    },
    unreadItem: { backgroundColor: '#f8fafc' },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 2
    },
    avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
    content: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, alignItems: 'center' },
    title: { fontSize: 16, fontWeight: '700', color: '#1e293b', flex: 1, marginRight: 8 },
    time: { fontSize: 12, color: '#94a3b8' },
    body: { fontSize: 14, color: '#475569', lineHeight: 20 },
    unreadDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 8, marginTop: 22 },
    footerLoader: { paddingVertical: 20 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
    emptyText: { fontSize: 16, color: '#94a3b8' }
});
