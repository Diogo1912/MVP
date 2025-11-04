// Main application logic
let currentConversationId = null;

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (token) {
        API.setToken(token);
        showDashboard();
        loadDashboardData();
    } else {
        showLogin();
    }
}

function showLogin() {
    document.getElementById('login-screen').classList.add('active');
    document.getElementById('dashboard').classList.remove('active');
}

function showDashboard() {
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('dashboard').classList.add('active');
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.getAttribute('data-section');
            showSection(section);
        });
    });
    
    // Google login
    document.getElementById('google-login-btn')?.addEventListener('click', () => {
        // TODO: Implement Google OAuth
        alert('Google OAuth integration needed');
    });
    
    // Logout
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        API.clearToken();
        showLogin();
    });
    
    // Chat
    document.getElementById('send-btn')?.addEventListener('click', sendMessage);
    document.getElementById('chat-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    // Document upload
    document.getElementById('upload-doc-btn')?.addEventListener('click', () => {
        document.getElementById('file-input').click();
    });
    
    document.getElementById('file-input')?.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            await uploadDocument(file);
        }
    });
    
    // Settings - GDPR
    document.getElementById('export-data-btn')?.addEventListener('click', async () => {
        if (confirm(t('settings.confirm_export'))) {
            try {
                const data = await API.exportUserData();
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `golexai-data-export-${new Date().toISOString()}.json`;
                a.click();
                URL.revokeObjectURL(url);
                alert(t('settings.export_success'));
            } catch (error) {
                alert(t('settings.export_error') + ': ' + error.message);
            }
        }
    });
    
    document.getElementById('delete-data-btn')?.addEventListener('click', async () => {
        const confirmation = prompt(t('settings.delete_confirmation'));
        if (confirmation === 'DELETE_ALL_MY_DATA') {
            try {
                await API.deleteUserData(confirmation);
                alert(t('settings.delete_success'));
                API.clearToken();
                showLogin();
            } catch (error) {
                alert(t('settings.delete_error') + ': ' + error.message);
            }
        } else if (confirmation) {
            alert(t('settings.delete_wrong_confirmation'));
        }
    });
    
    // Settings language change
    document.getElementById('settings-language')?.addEventListener('change', (e) => {
        setLanguage(e.target.value);
        // Update user language preference
        API.updateUserProfile({ language: e.target.value });
    });
}

function showSection(sectionName) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.getElementById(`${sectionName}-section`)?.classList.add('active');
    
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionName) {
            link.classList.add('active');
        }
    });
}

async function loadDashboardData() {
    try {
        // Load overview stats
        const analytics = await API.getAnalytics();
        document.getElementById('stat-documents').textContent = analytics.documents?.total || 0;
        document.getElementById('stat-cases').textContent = analytics.cases?.active || 0;
        document.getElementById('stat-queries').textContent = analytics.ai_usage?.queries || 0;
        document.getElementById('stat-productivity').textContent = analytics.documents?.this_month || 0;
        
        // Load documents
        await loadDocuments();
        
        // Load conversations
        await loadConversations();
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function loadDocuments() {
    try {
        const documents = await API.getDocuments();
        const container = document.getElementById('documents-list');
        container.innerHTML = documents.results?.map(doc => `
            <div class="document-card">
                <h3>${doc.title}</h3>
                <p>${doc.file_type} • ${formatFileSize(doc.file_size)}</p>
                <button onclick="analyzeDocument(${doc.id})">Analyze</button>
            </div>
        `).join('') || '<p>No documents</p>';
    } catch (error) {
        console.error('Error loading documents:', error);
    }
}

async function uploadDocument(file) {
    try {
        const title = file.name;
        const fileType = file.name.endsWith('.pdf') ? 'other' : 'other';
        await API.uploadDocument(file, title, fileType, null);
        await loadDocuments();
        alert('Document uploaded successfully');
    } catch (error) {
        alert('Error uploading document: ' + error.message);
    }
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;
    
    const messagesContainer = document.getElementById('chat-messages');
    
    // Add user message
    messagesContainer.innerHTML += `
        <div class="message user-message">
            <p>${message}</p>
        </div>
    `;
    
    input.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    try {
        const response = await API.sendChatMessage(message, currentConversationId, null);
        currentConversationId = response.conversation_id;
        
        // Add AI response
        messagesContainer.innerHTML += `
            <div class="message ai-message">
                <p>${response.message.content}</p>
            </div>
        `;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } catch (error) {
        alert('Error sending message: ' + error.message);
    }
}

async function loadConversations() {
    try {
        const conversations = await API.getConversations();
        // TODO: Display conversations list
    } catch (error) {
        console.error('Error loading conversations:', error);
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

async function analyzeDocument(documentId) {
    try {
        const result = await API.analyzeDocument(documentId);
        alert('Analysis: ' + result.analysis);
    } catch (error) {
        alert('Error analyzing document: ' + error.message);
    }
}

