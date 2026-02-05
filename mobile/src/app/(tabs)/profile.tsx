import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl, Platform } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { LogOut, MapPin, Link as LinkIcon, Settings, Heart, MessageCircle, Share2 } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { usePosts, useMyPosts } from '../../hooks/usePosts';
import { Post } from '../../types';
import api from '../../lib/api/client';
import { useState, useCallback } from 'react';
import PostCard from '@/components/PostCard';

export default function ProfileScreen() {
    const { logout, user } = useAuthStore();
    const [isManualRefreshing, setIsManualRefreshing] = useState(false);
    const { data: posts, isLoading, isFetching, refetch } = useMyPosts();
    const primaryColor = Colors.light.primary;

    const handleLike = async (postId: string) => {
        try {
            await api.post(`/posts/${postId}/like`);
            refetch();
        } catch (err) {
            console.error('Like error:', err);
        }
    };

    const handleRefresh = async () => {
        setIsManualRefreshing(true);
        await refetch();
        setIsManualRefreshing(false);
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.headerTop}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatarRing}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{user?.name?.[0] || 'U'}</Text>
                        </View>
                    </View>
                </View>
                {/* <TouchableOpacity style={styles.editButton}>
                    <Text style={styles.editButtonText}>Edit Profile</Text>
                </TouchableOpacity> */}
            </View>

            <View style={styles.userInfo}>
                <Text style={styles.name}>{user?.name || 'User'}</Text>
                <Text style={styles.handle}>@{user?.email?.split('@')[0] || 'username'}</Text>
                <Text style={styles.bio}>Digital nomad ✨ | Tech Enthusiast 📱 | Coffee Lover ☕️</Text>

                <View style={styles.metadata}>
                    <View style={styles.metaItem}>
                        <MapPin size={14} color="#64748b" />
                        <Text style={styles.metaText}>New York, USA</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <LinkIcon size={14} color="#64748b" />
                        <Text style={styles.metaText}>techzu.io</Text>
                    </View>
                </View>

                {/* Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{posts?.length || 0}</Text>
                        <Text style={styles.statLabel}>Posts</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>1.2k</Text>
                        <Text style={styles.statLabel}>Followers</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>450</Text>
                        <Text style={styles.statLabel}>Following</Text>
                    </View>
                </View>
            </View>

            <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>My Posts</Text>
            </View>
        </View>
    );

    const renderItem = useCallback(({ item }: { item: Post }) => (
        <PostCard item={item} onLike={handleLike} primaryColor={primaryColor} />
    ), [primaryColor]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.topBar}>
                <Text style={styles.headerTitle}></Text>
                <View style={styles.topBarRight}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Settings size={22} color="#1e293b" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={logout}>
                        <LogOut size={22} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>

            {isLoading && !posts ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={primaryColor} />
                </View>
            ) : (
                <FlashList
                    data={posts}
                    renderItem={renderItem}
                    ListHeaderComponent={renderHeader}
                    keyExtractor={(item, index) => item._id || index.toString()}

                    refreshControl={
                        <RefreshControl
                            refreshing={isManualRefreshing}
                            onRefresh={handleRefresh}
                            tintColor={primaryColor}
                            colors={[primaryColor]}
                        />
                    }
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No posts yet</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    loadingContainer: { paddingVertical: 40, justifyContent: 'center', alignItems: 'center' },

    // Top Bar
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#fff',
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
    topBarRight: { flexDirection: 'row', gap: 15 },
    iconButton: { padding: 4 },

    // Header Content
    header: { paddingBottom: 10 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20 },
    avatarContainer: { marginTop: 10 },
    avatarRing: {
        width: 88,
        height: 88,
        borderRadius: 44,
        borderWidth: 2,
        borderColor: Colors.light.primary,
        padding: 3,
        justifyContent: 'center',
        alignItems: 'center'
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 40,
        backgroundColor: Colors.light.primary,
        justifyContent: 'center',
        alignItems: 'center'
    },
    avatarText: { fontSize: 36, fontWeight: 'bold', color: '#fff' },

    editButton: {
        marginTop: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        backgroundColor: '#fff'
    },
    editButtonText: { fontSize: 14, fontWeight: '600', color: '#334155' },

    userInfo: { paddingHorizontal: 20, marginTop: 15 },
    name: { fontSize: 24, fontWeight: '800', color: '#1e293b' },
    handle: { fontSize: 16, color: '#64748b', marginTop: 2 },
    bio: { fontSize: 15, color: '#334155', marginTop: 12, lineHeight: 22 },

    metadata: { flexDirection: 'row', gap: 15, marginTop: 12 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 13, color: '#64748b' },

    statsContainer: {
        flexDirection: 'row',
        marginTop: 24,
        marginBottom: 20,
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        padding: 16,
        justifyContent: 'space-between'
    },
    statItem: { alignItems: 'center', flex: 1 },
    statNumber: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
    statLabel: { fontSize: 13, color: '#64748b', marginTop: 2 },
    statDivider: { width: 1, backgroundColor: '#e2e8f0', height: '80%' },

    sectionTitleContainer: { paddingHorizontal: 20, marginBottom: 10, marginTop: 10 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },

    listContent: {
        paddingBottom: 20,
    },

    emptyState: { padding: 40, alignItems: 'center' },
    emptyText: { color: '#94a3b8', fontSize: 16 }
});
