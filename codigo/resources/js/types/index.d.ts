export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    permissions: number;
}

export interface Document {
    id: number;
    name: string;
    description: string;
    priority: number;
    date_approved?: string;
    date_submitted: string;
    url: string;
    status: number;
    user_id: number;
}

export interface DashboardProps {
    documents?: Document[];
    permissions?: string[];
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
};
