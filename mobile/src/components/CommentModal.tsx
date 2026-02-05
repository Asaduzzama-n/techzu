import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { X, Send } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { Comment } from '../types';
import { useComment } from '../hooks/useComment';
import { formatDistanceToNow } from 'date-fns';

interface CommentModalProps {
    isVisible: boolean;
    onClose: () => void;
    postId: string;
    comments: Comment[];
    primaryColor?: string;
}

export default function CommentModal({
    isVisible,
    onClose,
    postId,
    comments,
    primaryColor = Colors.light.primary
}: CommentModalProps) {
    const [newComment, setNewComment] = useState('');
    const { mutate: addComment, isPending } = useComment();

    const handleSend = () => {
        if (!newComment.trim()) return;

        addComment(
            { postId, content: newComment.trim() },
            {
                onSuccess: () => {
                    setNewComment('');
                }
            }
        );
    };

    const renderCommentItem = ({ item }: { item: Comment }) => (
        <View style={styles.commentItem}>
            <View style={[styles.avatar, { backgroundColor: primaryColor }]}>
                <Text style={styles.avatarText}>{item.user?.name?.[0] || 'U'}</Text>
            </View>
            <View style={styles.commentContent}>
                <View style={styles.commentHeader}>
                    <Text style={styles.userName}>{item.user?.name}</Text>
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
                <Text style={styles.text}>{item.content}</Text>
            </View>
        </View>
    );

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Comments</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    {/* Comments List */}
                    <FlashList
                        data={comments}
                        renderItem={renderCommentItem}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No comments yet. Be the first to comment!</Text>
                            </View>
                        )}
                    />

                    {/* Input Area */}
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
                    >
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Add a comment..."
                                value={newComment}
                                onChangeText={setNewComment}
                                multiline
                            // maxHeight={100}
                            />
                            <TouchableOpacity
                                onPress={handleSend}
                                style={[
                                    styles.sendButton,
                                    { backgroundColor: newComment.trim() ? primaryColor : '#e2e8f0' }
                                ]}
                                disabled={!newComment.trim() || isPending}
                            >
                                {isPending ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Send size={20} color="#fff" />
                                )}
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '80%',
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
    },
    closeButton: {
        padding: 4,
    },
    listContent: {
        padding: 20,
        flexGrow: 1,
    },
    commentItem: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    commentContent: {
        flex: 1,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    userName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1e293b',
    },
    time: {
        fontSize: 12,
        color: '#94a3b8',
    },
    text: {
        fontSize: 14,
        color: '#334155',
        lineHeight: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 40,
    },
    emptyText: {
        color: '#64748b',
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    input: {
        flex: 1,
        backgroundColor: '#f8fafc',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginRight: 10,
        color: '#1e293b',
        fontSize: 14,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
