// Bot API Client for Admin Dashboard
// Communicates with the WhatsApp bot backend

const BOT_API_URL = process.env.NEXT_PUBLIC_BOT_API_URL || 'http://localhost:3001';
const BOT_API_KEY = process.env.NEXT_PUBLIC_BOT_API_KEY || '';

interface BotApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

class BotApiClient {
    private baseUrl: string;
    private apiKey: string;

    constructor() {
        this.baseUrl = BOT_API_URL;
        this.apiKey = BOT_API_KEY;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'X-API-Key': this.apiKey,
            ...options.headers,
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `API request failed: ${response.statusText}`);
            }

            return data;
        } catch (error) {
            console.error('Bot API request failed:', error);
            throw error;
        }
    }

    // =============================================
    // ANALYTICS
    // =============================================

    async getAnalyticsStats() {
        return this.request<{
            success: boolean;
            stats: {
                totalUsers: number;
                activeUsers: number;
                totalMessages: number;
                todayMessages: number;
            };
        }>('/api/analytics/stats');
    }

    async getIntentDistribution() {
        return this.request<{
            success: boolean;
            intents: Array<{ intent: string; count: number }>;
        }>('/api/analytics/intents/distribution');
    }

    // =============================================
    // BROADCASTS
    // =============================================

    async sendBroadcast(data: {
        title: string;
        message: string;
        target: 'All Users' | 'Active Users' | 'VIP Only';
    }) {
        return this.request<{
            success: boolean;
            broadcast: {
                id: string;
                title: string;
                message: string;
                target: string;
                target_count: number;
                delivered_count: number;
                status: string;
            };
        }>('/api/broadcast', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getBroadcastHistory(limit = 50) {
        return this.request<{
            success: boolean;
            broadcasts: Array<any>;
        }>(`/api/broadcast/history?limit=${limit}`);
    }

    // =============================================
    // BOT STATUS & CONTROL
    // =============================================

    async getBotStatus() {
        return this.request<{
            success: boolean;
            whatsapp: {
                isReady: boolean;
                clientInfo?: {
                    pushname: string;
                    platform: string;
                };
            };
            queue: {
                pending: number;
                active: number;
            };
        }>('/status');
    }

    async getQRCode() {
        return this.request<{
            success: boolean;
            qrCode?: string;
            isReady: boolean;
            message?: string;
        }>('/qr');
    }

    async clearSession() {
        return this.request<{
            success: boolean;
            message: string;
        }>('/session/clear', {
            method: 'POST',
        });
    }

    // =============================================
    // SETTINGS
    // =============================================

    async getSettings() {
        return this.request<{
            success: boolean;
            settings: Record<string, string>;
        }>('/api/settings');
    }

    async updateSettings(settings: Record<string, any>) {
        return this.request<{
            success: boolean;
            message: string;
        }>('/api/settings', {
            method: 'PUT',
            body: JSON.stringify({ settings }),
        });
    }

    // =============================================
    // USERS
    // =============================================

    async getUsers(params?: {
        status?: string;
        search?: string;
        limit?: number;
        offset?: number;
    }) {
        const queryParams = new URLSearchParams(params as any);
        return this.request<{
            success: boolean;
            users: Array<any>;
            total: number;
        }>(`/api/users?${queryParams}`);
    }

    // =============================================
    // CONTACTS
    // =============================================

    async getContacts() {
        return this.request<{
            success: boolean;
            contacts: Array<any>;
        }>('/api/contacts');
    }

    async addContact(contact: {
        name: string;
        phone: string;
        email?: string;
        role: string;
    }) {
        return this.request<{
            success: boolean;
            contact: any;
        }>('/api/contacts', {
            method: 'POST',
            body: JSON.stringify(contact),
        });
    }

    async updateContact(id: string, contact: Partial<{
        name: string;
        phone: string;
        email: string;
        role: string;
        status: string;
    }>) {
        return this.request<{
            success: boolean;
            contact: any;
        }>(`/api/contacts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(contact),
        });
    }

    async deleteContact(id: string) {
        return this.request<{
            success: boolean;
            message: string;
        }>(`/api/contacts/${id}`, {
            method: 'DELETE',
        });
    }

    // =============================================
    // INGEST / TRAINING
    // =============================================

    async ingestFile(file: File, metadata?: { description?: string }) {
        const formData = new FormData();
        formData.append('file', file);
        if (metadata?.description) {
            formData.append('description', metadata.description);
        }

        const url = `${this.baseUrl}/admin/ingest/file`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'X-API-Key': this.apiKey,
                    // Don't set Content-Type - browser will set it with boundary for multipart
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `File upload failed: ${response.statusText}`);
            }

            return data;
        } catch (error) {
            console.error('File ingest failed:', error);
            throw error;
        }
    }

    async ingestUrl(url: string, metadata?: { description?: string }) {
        return this.request<{
            success: boolean;
            jobId: string;
            message: string;
        }>('/admin/ingest/url', {
            method: 'POST',
            body: JSON.stringify({ url, ...metadata }),
        });
    }

    async getIngestJobStatus(jobId: string) {
        return this.request<{
            success: boolean;
            status: {
                jobId: string;
                status: string;
                progress?: number;
                error?: string;
            };
        }>(`/admin/ingest/status/${jobId}`);
    }

    async listIngestJobs() {
        return this.request<{
            success: boolean;
            jobs: Array<{
                jobId: string;
                status: string;
                createdAt: string;
                completedAt?: string;
            }>;
        }>('/admin/ingest/jobs');
    }
}

// Export singleton instance
export const botApi = new BotApiClient();
export default botApi;
