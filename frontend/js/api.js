// API client for GOLEXAI backend
const API_BASE_URL = 'http://localhost:8000/api';

let authToken = localStorage.getItem('authToken');

class API {
    static setToken(token) {
        authToken = token;
        localStorage.setItem('authToken', token);
    }
    
    static clearToken() {
        authToken = null;
        localStorage.removeItem('authToken');
    }
    
    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };
        
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });
            
            if (response.status === 401) {
                API.clearToken();
                window.location.reload();
                return;
            }
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || data.detail || 'API Error');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
    
    // Auth
    static async login(credentials) {
        const data = await this.request('/auth/token/', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
        this.setToken(data.access);
        return data;
    }
    
    static async getCurrentUser() {
        return this.request('/auth/users/me/');
    }
    
    // Documents
    static async getDocuments() {
        return this.request('/documents/');
    }
    
    static async uploadDocument(file, title, fileType, caseId) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('file_type', fileType);
        if (caseId) formData.append('case', caseId);
        
        return fetch(`${API_BASE_URL}/documents/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
            body: formData,
        }).then(res => res.json());
    }
    
    static async analyzeDocument(documentId) {
        return this.request(`/documents/${documentId}/analyze/`, {
            method: 'POST',
        });
    }
    
    // Cases
    static async getCases() {
        return this.request('/cases/');
    }
    
    static async createCase(data) {
        return this.request('/cases/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    
    // AI Chat
    static async sendChatMessage(message, conversationId, documentId) {
        return this.request('/ai/chat/', {
            method: 'POST',
            body: JSON.stringify({
                message,
                conversation_id: conversationId,
                document_id: documentId,
            }),
        });
    }
    
    static async getConversations() {
        return this.request('/ai/conversations/');
    }
    
    // Analytics
    static async getAnalytics() {
        return this.request('/analytics/');
    }
    
    // User profile
    static async updateUserProfile(data) {
        return this.request('/auth/users/update_profile/', {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }
    
    // GDPR
    static async exportUserData() {
        return this.request('/auth/users/export_data/', {
            method: 'POST',
        });
    }
    
    static async deleteUserData(confirmation) {
        return this.request('/auth/users/delete_data/', {
            method: 'POST',
            body: JSON.stringify({ confirmation }),
        });
    }
    
    // Document actions
    static async downloadDocument(documentId) {
        const url = `${API_BASE_URL}/documents/${documentId}/download/`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `document-${documentId}`;
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
    }
    
    static async exportToDocx(documentId) {
        const url = `${API_BASE_URL}/documents/${documentId}/export_to_docx/`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `document-${documentId}.docx`;
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
    }
}

