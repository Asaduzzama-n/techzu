export type User = {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    profile?: string;
};

export type AuthData = {
    accessToken: string;
    refreshToken?: string;
    role: string;
    user?: User;
};

export type Post = {
    _id: string;
    author: {
        _id: string;
        name: string;
        profile?: string;
    };
    content: string;
    likes: string[];
    comments: Comment[];
    createdAt: string;
    updatedAt: string;
};

export type Comment = {
    _id: string;
    user: {
        _id: string;
        name: string;
        profile?: string;
    };
    content: string;
    createdAt: string;
};

export type ApiResponse<T> = {
    success: boolean;
    message: string;
    data: T;
    meta?: {
        page: number;
        limit: number;
        total: number;
    };
};

export type Notification = {
    _id: string;
    from: {
        _id: string;
        name: string;
        profile?: string;
    };
    to: string;
    title: string;
    body: string;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
};
