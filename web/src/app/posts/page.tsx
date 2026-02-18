'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
    HeartIcon,
    ChatBubbleLeftIcon,
    PhotoIcon,
    PaperAirplaneIcon,
    TrashIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3699';

interface Comment {
    userId: string;
    content: string;
    createdAt: string;
}

interface Post {
    _id: string;
    userId: string;
    content: string;
    photos: string[];
    likes: string[];
    comments: Comment[];
    visibility: string;
    createdAt: string;
}

export default function PostsPage() {
    const router = useRouter();
    const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostPhotos, setNewPostPhotos] = useState<string[]>([]);
    const [isPosting, setIsPosting] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [commentText, setCommentText] = useState<Record<string, string>>({});
    const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (token) {
            fetchPosts();
        }
    }, [token]);

    const fetchPosts = async () => {
        try {
            const res = await fetch(`${API_URL}/api/v1/posts/feed`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setPosts(data.posts);
            }
        } catch (error) {
            console.error('Failed to fetch posts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim()) return;

        setIsPosting(true);
        try {
            const res = await fetch(`${API_URL}/api/v1/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    content: newPostContent,
                    photos: newPostPhotos,
                }),
            });

            const data = await res.json();
            if (data.success) {
                setPosts(prev => [data.post, ...prev]);
                setNewPostContent('');
                setNewPostPhotos([]);
            }
        } catch (error) {
            console.error('Failed to create post:', error);
        } finally {
            setIsPosting(false);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;

        setIsUploadingPhoto(true);
        try {
            const formData = new FormData();
            formData.append('image', e.target.files[0]);

            const res = await fetch(`${API_URL}/api/v1/media/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            const data = await res.json();
            if (data.status === 'success') {
                setNewPostPhotos(prev => [...prev, data.data.url]);
            }
        } catch (error) {
            console.error('Photo upload failed:', error);
        } finally {
            setIsUploadingPhoto(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleLike = async (postId: string) => {
        try {
            const res = await fetch(`${API_URL}/api/v1/posts/${postId}/like`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await res.json();
            if (data.success) {
                setPosts(prev => prev.map(p => {
                    if (p._id === postId) {
                        const userId = user?.id || '';
                        if (data.liked) {
                            return { ...p, likes: [...p.likes, userId] };
                        } else {
                            return { ...p, likes: p.likes.filter(id => id !== userId) };
                        }
                    }
                    return p;
                }));
            }
        } catch (error) {
            console.error('Like failed:', error);
        }
    };

    const handleComment = async (postId: string) => {
        const content = commentText[postId]?.trim();
        if (!content) return;

        try {
            const res = await fetch(`${API_URL}/api/v1/posts/${postId}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ content }),
            });

            const data = await res.json();
            if (data.success) {
                setPosts(prev => prev.map(p => {
                    if (p._id === postId) {
                        return { ...p, comments: [...p.comments, data.comment] };
                    }
                    return p;
                }));
                setCommentText(prev => ({ ...prev, [postId]: '' }));
            }
        } catch (error) {
            console.error('Comment failed:', error);
        }
    };

    const handleDeletePost = async (postId: string) => {
        if (!confirm('Delete this post?')) return;

        try {
            const res = await fetch(`${API_URL}/api/v1/posts/${postId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await res.json();
            if (data.success) {
                setPosts(prev => prev.filter(p => p._id !== postId));
            }
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const toggleComments = (postId: string) => {
        setExpandedComments(prev => {
            const next = new Set(prev);
            if (next.has(postId)) next.delete(postId);
            else next.add(postId);
            return next;
        });
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = (now.getTime() - date.getTime()) / 1000;

        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen bg-[#F0F2F4] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF4458]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F0F2F4] text-[#21262E] pb-20">
            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-[#21262E]">Posts</h1>
                    <button
                        onClick={() => router.push('/discover')}
                        className="px-4 py-2 text-sm bg-[#FF4458]/10 text-[#FF4458] rounded-xl hover:bg-[#E8E6EA] transition"
                    >
                        Back to Discover
                    </button>
                </div>

                {/* Шинэ нийтлэл үүсгэх */}
                <div className="bg-white border border-[#E8E6EA] rounded-2xl p-6 mb-8 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#FD267A] to-[#FF6036] flex items-center justify-center text-white font-bold shrink-0">
                            {user?.firstName?.[0] || '?'}
                        </div>
                        <div className="flex-1">
                            <textarea
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                placeholder="What's on your mind?"
                                rows={3}
                                maxLength={2000}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[#21262E] placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#FF4458] text-lg"
                            />

                            {/* Нэмсэн зургууд */}
                            {newPostPhotos.length > 0 && (
                                <div className="flex gap-2 mt-3 flex-wrap">
                                    {newPostPhotos.map((photo, i) => (
                                        <div key={i} className="relative">
                                            <img src={photo} alt="" className="w-20 h-20 object-cover rounded-xl border border-[#E8E6EA]" />
                                            <button
                                                onClick={() => setNewPostPhotos(prev => prev.filter((_, idx) => idx !== i))}
                                                className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF4458] rounded-full flex items-center justify-center text-white"
                                            >
                                                <XMarkIcon className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                                <div className="flex gap-2">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handlePhotoUpload}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploadingPhoto}
                                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-[#FF4458] hover:bg-[#FF4458]/10 rounded-xl transition disabled:opacity-50"
                                    >
                                        {isUploadingPhoto ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-[#FF4458]"></div>
                                        ) : (
                                            <PhotoIcon className="w-5 h-5" />
                                        )}
                                        Photo
                                    </button>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-400">
                                        {newPostContent.length}/2000
                                    </span>
                                    <button
                                        onClick={handleCreatePost}
                                        disabled={isPosting || !newPostContent.trim()}
                                        className="px-6 py-2 bg-linear-to-r from-[#FD267A] to-[#FF6036] hover:shadow-lg hover:shadow-gray-200 rounded-full text-white text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isPosting ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                                        ) : (
                                            <PaperAirplaneIcon className="w-4 h-4" />
                                        )}
                                        Post
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Нийтлэлүүдийн жагсаалт */}
                {posts.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-gray-500 text-lg mb-2">No posts yet</p>
                        <p className="text-gray-400 text-sm">Be the first to share something!</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {posts.map((post) => {
                            const isLiked = post.likes.includes(user?.id || '');
                            const showComments = expandedComments.has(post._id);
                            const isOwner = post.userId === user?.id;

                            return (
                                <div key={post._id} className="bg-white border border-[#E8E6EA] rounded-2xl overflow-hidden shadow-sm">
                                    {/* Post header */}
                                    <div className="flex items-center justify-between p-4 pb-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#FD267A] to-[#FF6036] flex items-center justify-center text-white font-bold">
                                                {post.userId.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-[#21262E]">{isOwner ? user?.firstName : 'User'}</p>
                                                <p className="text-xs text-gray-400">{formatTime(post.createdAt)}</p>
                                            </div>
                                        </div>
                                        {isOwner && (
                                            <button
                                                onClick={() => handleDeletePost(post._id)}
                                                className="p-2 text-gray-400 hover:text-[#FF4458] transition"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Post content */}
                                    <div className="p-4">
                                        <p className="text-gray-600 whitespace-pre-wrap">{post.content}</p>
                                    </div>

                                    {/* Post photos */}
                                    {post.photos.length > 0 && (
                                        <div className={`grid ${post.photos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-1`}>
                                            {post.photos.map((photo, i) => (
                                                <img
                                                    key={i}
                                                    src={photo}
                                                    alt=""
                                                    className="w-full h-64 object-cover"
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Like & Comment buttons */}
                                    <div className="flex items-center gap-6 px-4 py-3 border-t border-gray-200">
                                        <button
                                            onClick={() => handleLike(post._id)}
                                            className={`flex items-center gap-2 text-sm transition ${
                                                isLiked ? 'text-[#FF4458]' : 'text-gray-400 hover:text-[#FF4458]'
                                            }`}
                                        >
                                            {isLiked ? (
                                                <HeartSolidIcon className="w-5 h-5" />
                                            ) : (
                                                <HeartIcon className="w-5 h-5" />
                                            )}
                                            {post.likes.length > 0 && post.likes.length}
                                        </button>
                                        <button
                                            onClick={() => toggleComments(post._id)}
                                            className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#FF4458] transition"
                                        >
                                            <ChatBubbleLeftIcon className="w-5 h-5" />
                                            {post.comments.length > 0 && post.comments.length}
                                        </button>
                                    </div>

                                    {/* Comments section */}
                                    {showComments && (
                                        <div className="border-t border-gray-200 px-4 py-3">
                                            {/* Existing comments */}
                                            {post.comments.length > 0 && (
                                                <div className="space-y-3 mb-3">
                                                    {post.comments.map((comment, i) => (
                                                        <div key={i} className="flex gap-2">
                                                            <div className="w-7 h-7 rounded-full bg-[#E8E6EA] flex items-center justify-center text-xs font-bold shrink-0 text-[#FF4458]">
                                                                {comment.userId.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 flex-1">
                                                                <p className="text-sm text-gray-600">{comment.content}</p>
                                                                <p className="text-xs text-gray-400 mt-1">{formatTime(comment.createdAt)}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* New comment input */}
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={commentText[post._id] || ''}
                                                    onChange={(e) => setCommentText(prev => ({ ...prev, [post._id]: e.target.value }))}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleComment(post._id)}
                                                    placeholder="Write a comment..."
                                                    maxLength={500}
                                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#21262E] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF4458]"
                                                />
                                                <button
                                                    onClick={() => handleComment(post._id)}
                                                    disabled={!commentText[post._id]?.trim()}
                                                    className="px-3 py-2 bg-linear-to-r from-[#FD267A] to-[#FF6036] hover:shadow-lg hover:shadow-gray-200 rounded-xl transition disabled:opacity-50 text-white"
                                                >
                                                    <PaperAirplaneIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
