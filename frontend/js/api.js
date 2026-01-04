// API client for GOLEXAI backend
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8000/api' 
    : '/api';

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
    
    static async request(endpoint, options = {}, skipAuthRedirect = false) {
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
            
            // Handle empty responses
            const text = await response.text();
            const data = text ? JSON.parse(text) : {};
            
            if (response.status === 401 && !skipAuthRedirect) {
                // Only clear token and redirect for protected routes, not login
                if (authToken) {
                    API.clearToken();
                    // Don't reload - just throw error so the app can handle it
                }
                throw new Error(data.detail || data.error || 'Authentication required');
            }
            
            if (!response.ok) {
                // Handle validation errors from Django REST Framework
                if (typeof data === 'object' && data !== null && !data.error && !data.detail) {
                    // DRF validation errors come as {field: [errors]}
                    const errorMessages = Object.entries(data)
                        .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
                        .join('; ');
                    throw new Error(errorMessages || 'Validation Error');
                }
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
        try {
            const data = await this.request('/auth/token/', {
                method: 'POST',
                body: JSON.stringify(credentials),
            }, true); // skipAuthRedirect = true for login
            if (data && data.access) {
                this.setToken(data.access);
            }
            return data;
        } catch (error) {
            throw new Error('Invalid email or password');
        }
    }
    
    static async register(userData) {
        return this.request('/auth/register/', {
            method: 'POST',
            body: JSON.stringify(userData),
        }, true); // skipAuthRedirect = true for registration
    }
    
    static async getCurrentUser() {
        return this.request('/auth/users/me/');
    }
    
    // Documents
    static async getDocuments() {
        return this.request('/documents/');
    }
    
    static async getDocument(id) {
        return this.request(`/documents/${id}/`);
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
    
    static async updateDocument(id, data) {
        return this.request(`/documents/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }
    
    static async deleteDocument(id) {
        return this.request(`/documents/${id}/`, {
            method: 'DELETE',
        });
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
    
    static async getCase(id) {
        return this.request(`/cases/${id}/`);
    }
    
    static async createCase(data) {
        return this.request('/cases/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    
    static async updateCase(id, data) {
        return this.request(`/cases/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }
    
    static async deleteCase(id) {
        return this.request(`/cases/${id}/`, {
            method: 'DELETE',
        });
    }
    
    // AI Chat
    static async sendChatMessage(message, conversationId, documentId, persona = 'commercial', caseId = null) {
        return this.request('/ai/chat/', {
            method: 'POST',
            body: JSON.stringify({
                message,
                conversation_id: conversationId,
                document_id: documentId,
                persona,
                case_id: caseId,
            }),
        });
    }
    
    static async getConversations() {
        return this.request('/ai/conversations/');
    }
    
    static async getConversation(id) {
        return this.request(`/ai/conversations/${id}/`);
    }
    
    static async getConversationMessages(id) {
        return this.request(`/ai/conversations/${id}/messages/`);
    }
    
    static async deleteConversation(id) {
        return this.request(`/ai/conversations/${id}/`, {
            method: 'DELETE',
        });
    }
    
    // Prompts
    static async getPrompts() {
        return this.request('/ai/prompts/');
    }
    
    static async getPrompt(id) {
        return this.request(`/ai/prompts/${id}/`);
    }
    
    static async createPrompt(data) {
        return this.request('/ai/prompts/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    
    static async updatePrompt(id, data) {
        return this.request(`/ai/prompts/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }
    
    // Analytics
    static async getAnalytics(range = '30d') {
        return this.request(`/analytics/?range=${range}`);
    }
    
    static async getAuditLogs() {
        return this.request('/analytics/audit-logs/');
    }
    
    static async exportReport(format = 'csv', range = '30d') {
        const url = `${API_BASE_URL}/analytics/export/?format=${format}&range=${range}`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });
        
        if (!response.ok) {
            throw new Error('Export failed');
        }
        
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `golexai_report.${format}`;
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
    }
    
    // Document preview
    static async getDocumentPreview(documentId) {
        return this.request(`/documents/${documentId}/preview/`);
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
        
        if (!response.ok) {
            throw new Error('Download failed');
        }
        
        const blob = await response.blob();
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `document-${documentId}`;
        
        if (contentDisposition) {
            const match = contentDisposition.match(/filename="?(.+)"?/);
            if (match) filename = match[1];
        }
        
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
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
        
        if (!response.ok) {
            throw new Error('Export failed');
        }
        
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `document-${documentId}.docx`;
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
    }
    
    // Generate document from AI
    static async generateDocument(content, title, type = 'docx', caseId = null) {
        return this.request('/ai/generate-document/', {
            method: 'POST',
            body: JSON.stringify({ content, title, type, case_id: caseId }),
        });
    }
}
