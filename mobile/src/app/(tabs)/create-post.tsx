import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import api from '../../lib/api/client';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useAuthStore } from '../../store/authStore';
import { X, Image as ImageIcon, Video, BarChart2, Globe } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import { ApiResponse, Post } from '@/types';

export default function CreatePostScreen() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const handleCreate = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      await api.post<ApiResponse<Post>>('/posts', { content });

      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['posts'] });

      setContent('');
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
    } catch (err) {
      console.error('Create post error:', err);
      Alert.alert('Error', 'Failed to publish post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)');
            }
          }}
          style={styles.closeButton}
        >
          <X size={24} color="#64748b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity
          style={[styles.postHeaderButton, !content.trim() && styles.disabledPostButton]}
          onPress={handleCreate}
          disabled={loading || !content.trim()}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.postHeaderText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* User Info Section */}
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.[0] || 'U'}</Text>
            </View>
            <View>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
              <View style={styles.privacyBadge}>
                <Globe size={12} color="#64748b" />
                <Text style={styles.privacyText}>Public</Text>
              </View>
            </View>
          </View>

          {/* Input Area */}
          <TextInput
            style={styles.input}
            placeholder="What's on your mind?"
            placeholderTextColor="#94a3b8"
            multiline
            autoFocus
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
          />
        </ScrollView>

        {/* Attachment Bar */}
        <View style={styles.attachmentBar}>
          <Text style={styles.addText}>Add to your post</Text>
          <View style={styles.attachmentIcons}>
            <TouchableOpacity style={styles.attachmentButton}>
              <ImageIcon size={22} color={Colors.light.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.attachmentButton}>
              <Video size={22} color="#ef4444" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.attachmentButton}>
              <BarChart2 size={22} color="#10b981" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  closeButton: { padding: 4 },
  postHeaderButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center'
  },
  disabledPostButton: { backgroundColor: '#e2e8f0' },
  postHeaderText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  scrollContent: { padding: 20 },
  userInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  userName: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 2 },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start'
  },
  privacyText: { fontSize: 12, color: '#64748b', marginLeft: 4, fontWeight: '600' },

  input: {
    fontSize: 18,
    color: '#1e293b',
    minHeight: 200,
    lineHeight: 26,
  },

  attachmentBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 90,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#fff'
  },
  addText: { fontSize: 15, fontWeight: '600', color: '#64748b' },
  attachmentIcons: { flexDirection: 'row', gap: 12 },
  attachmentButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center'
  }
});
