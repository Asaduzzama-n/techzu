import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Heart, MessageCircle, Share2 } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { Post } from '../types';
import CommentModal from './CommentModal';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
    item: Post;
    onLike: (postId: string) => void;
    primaryColor?: string;
}

const PostCard = React.memo(({ item, onLike, primaryColor = Colors.light.primary }: PostCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
    const CHAR_LIMIT = 800;
    const shouldTruncate = item.content.length > CHAR_LIMIT;

    const displayedContent = isExpanded || !shouldTruncate
        ? item.content
        : `${item.content.slice(0, CHAR_LIMIT)}...`;

    return (
        <View style={styles.postRow}>
            <View style={styles.postAvatarContainer}>
                <View style={[styles.postAvatar, { backgroundColor: primaryColor }]}>
                    <Text style={styles.avatarText}>{item.author.name?.[0] || 'U'}</Text>
                </View>
            </View>

            <View style={styles.postContentContainer}>
                <View style={styles.postHeaderLine}>
                    <Text style={styles.authorName}>{item.author.name}</Text>
                    <Text style={styles.timestamp}>
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

                <Text style={styles.contentText}>
                    {displayedContent}
                </Text>

                {shouldTruncate && !isExpanded && (
                    <TouchableOpacity onPress={() => setIsExpanded(true)} style={styles.readMoreButton}>
                        <Text style={[styles.readMoreText, { color: primaryColor }]}>Read more</Text>
                    </TouchableOpacity>
                )}

                <View style={styles.postFooter}>
                    <TouchableOpacity style={styles.interaction} onPress={() => onLike(item._id)}>
                        <Heart
                            size={18}
                            color={item.likes.length > 0 ? '#ef4444' : '#64748b'}
                            fill={item.likes.length > 0 ? '#ef4444' : 'none'}
                        />
                        <Text style={[styles.interactionText, item.likes.length > 0 && styles.activeHeartText]}>
                            {item.likes.length > 0 ? item.likes.length.toLocaleString() : '0'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.interaction}
                        onPress={() => setIsCommentModalVisible(true)}
                    >
                        <MessageCircle size={18} color="#64748b" />
                        <Text style={styles.interactionText}>{item.comments.length}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.interaction}>
                        <Share2 size={18} color="#64748b" />
                    </TouchableOpacity>
                </View>
            </View>

            <CommentModal
                isVisible={isCommentModalVisible}
                onClose={() => setIsCommentModalVisible(false)}
                postId={item._id}
                comments={item.comments}
                primaryColor={primaryColor}
            />
        </View>
    );
});

export default PostCard;

const styles = StyleSheet.create({
    postRow: {
        flexDirection: 'row',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        backgroundColor: '#fff'
    },
    postAvatarContainer: { marginRight: 15 },
    postAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
    },
    avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },

    postContentContainer: { flex: 1 },
    postHeaderLine: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6
    },
    authorName: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
    timestamp: { fontSize: 12, color: '#94a3b8' },
    contentText: { fontSize: 15, color: '#334155', lineHeight: 22, marginBottom: 12 },

    readMoreButton: { marginBottom: 12 },
    readMoreText: { fontSize: 14, fontWeight: '600' },

    postFooter: { flexDirection: 'row', gap: 20 },
    interaction: { flexDirection: 'row', alignItems: 'center' },
    interactionText: { marginLeft: 6, color: '#64748b', fontSize: 14, fontWeight: '500' },
    activeHeartText: { color: '#ef4444' }
});
