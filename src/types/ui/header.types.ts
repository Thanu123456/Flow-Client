export interface HeaderProps {
    onMenuClick?: () => void;
    collapsed?: boolean;
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    isRead: boolean;
    createdAt: string;
}

export interface UserProfile {
    id: string;
    fullName: string;
    email: string;
    profileImageUrl?: string;
    role: string;
}