import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, ScrollView, Platform } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState, useCallback } from 'react';
import api from '../../lib/api/client';
import { Post, ApiResponse } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { usePosts } from '../../hooks/usePosts';
import { Bell, Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { registerForPushNotificationsAsync } from '../../utils/notifications';
import Colors from '@/constants/Colors';
import PostCard from '@/components/PostCard';



const FeedHeader = React.memo(({ searchInput, setSearchInput }: { searchInput: string, setSearchInput: (text: string) => void }) => (
  <View style={styles.headerContainer}>
    <View style={styles.searchContainer}>
      <Search size={20} color="#94a3b8" style={styles.searchIcon} />
      <TextInput
        placeholder="Search by content.."
        placeholderTextColor="#94a3b8"
        style={styles.searchInput}
        value={searchInput}
        onChangeText={setSearchInput}
        autoCorrect={false}
        autoCapitalize="none"
      />
    </View>
  </View>
));

export default function FeedScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const { data: posts, isLoading, isFetching, refetch } = usePosts(searchQuery);

  const primaryColor = Colors.light.primary;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (isAuthenticated) {
      registerForPushNotificationsAsync();
    }
  }, [isAuthenticated]);

  const handleLike = async (postId: string) => {
    try {
      await api.post(`/posts/${postId}/like`);
      refetch(); // Refetch after like (background)
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleRefresh = async () => {
    setIsManualRefreshing(true);
    await refetch();
    setIsManualRefreshing(false);
  };

  const renderItem = useCallback(({ item }: { item: Post }) => (
    <PostCard item={item} onLike={handleLike} primaryColor={primaryColor} />
  ), [primaryColor]);

  if (isLoading && !posts) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={primaryColor} /></View>;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.push('/profile')}
          style={styles.profileButton}
        >
          <View style={[styles.profileRing, { borderColor: primaryColor }]}>
            <View style={styles.profileInitial}>
              <Text style={styles.profileInitialText}>{user?.name?.[0] || 'U'}</Text>
            </View>
          </View>
        </TouchableOpacity>
        <Text style={styles.activeTitle}>Feed</Text>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => router.push('/notifications')}
        >
          <Bell size={22} color="#475569" />
        </TouchableOpacity>
      </View>

      <FlashList
        ListHeaderComponent={<FeedHeader searchInput={searchInput} setSearchInput={setSearchInput} />}
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item, index) => item._id || index.toString()}
        refreshControl={
          <RefreshControl
            refreshing={isManualRefreshing}
            onRefresh={handleRefresh}
            tintColor={primaryColor}
            colors={[primaryColor]}
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: Platform.OS === 'android' ? 10 : 0,
    backgroundColor: '#fff',
  },
  activeTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b' },
  profileButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  profileRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  profileInitial: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    backgroundColor: '#ffb94f',
    justifyContent: 'center',
    alignItems: 'center'
  },
  profileInitialText: { color: '#fff', fontWeight: 'bold' },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center'
  },

  // Header / Search
  headerContainer: { backgroundColor: '#fff' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginTop: 15,
    marginBottom: 10,
    height: 50
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: '#1e293b', fontSize: 16 },

  // List
  listContainer: { paddingBottom: 100 },
});
