// Main application logic for GOLEXAI
let currentConversationId = null;
let currentPersona = localStorage.getItem('ai_persona') || 'commercial';
let currentEditingDocumentId = null;

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
    setupModals();
    setupSettingsNav();
});

// =================== AUTH ===================

function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (token) {
        API.setToken(token);
        showDashboard();
        loadDashboardData();
        loadUserProfile();
    } else {
        showLogin();
    }
}

function showLogin() {
    document.getElementById('login-screen').classList.add('active');
    document.getElementById('dashboard').classList.remove('active');
    document.getElementById('navbar').style.display = 'none';
}

function showDashboard() {
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('dashboard').classList.add('active');
    document.getElementById('navbar').style.display = 'block';
}

async function loadUserProfile() {
    try {
        const user = await API.getCurrentUser();
        if (user) {
            const initial = (user.first_name?.[0] || user.email?.[0] || 'U').toUpperCase();
            const userName = user.first_name || user.email?.split('@')[0] || 'User';
            
            const avatarEl = document.getElementById('user-avatar');
            const nameEl = document.getElementById('user-name');
            const settingsAvatarEl = document.getElementById('settings-avatar');
            const settingsNameEl = document.getElementById('settings-user-name');
            const settingsEmailEl = document.getElementById('settings-user-email');
            const settingsRoleEl = document.getElementById('settings-user-role');
            
            if (avatarEl) avatarEl.textContent = initial;
            if (nameEl) nameEl.textContent = userName;
            if (settingsAvatarEl) settingsAvatarEl.textContent = initial;
            if (settingsNameEl) settingsNameEl.textContent = user.first_name && user.last_name 
                ? `${user.first_name} ${user.last_name}` 
                : userName;
            if (settingsEmailEl) settingsEmailEl.textContent = user.email || '';
            if (settingsRoleEl) settingsRoleEl.textContent = user.role || 'Lawyer';
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
        // Don't crash - just log the error
    }
}

// =================== EVENT LISTENERS ===================

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.currentTarget.getAttribute('data-section');
            showSection(section);
        });
    });
    
    // Mobile menu
    document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
        document.getElementById('nav-menu').classList.toggle('mobile-open');
    });
    
    // Toggle between login and register forms
    document.getElementById('show-register')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('login-form-container').style.display = 'none';
        document.getElementById('register-form-container').style.display = 'block';
    });
    
    document.getElementById('show-login')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('register-form-container').style.display = 'none';
        document.getElementById('login-form-container').style.display = 'block';
    });
    
    // Email login
    document.getElementById('email-login-btn')?.addEventListener('click', async () => {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        if (!email || !password) {
            showToast('error', 'Error', 'Please enter email and password');
            return;
        }
        
        try {
            await API.login({ email, password });
            showDashboard();
            loadDashboardData();
            loadUserProfile();
            showToast('success', 'Welcome!', 'Successfully logged in');
        } catch (error) {
            showToast('error', 'Login Failed', error.message);
        }
    });
    
    // Registration
    document.getElementById('register-btn')?.addEventListener('click', async () => {
        const email = document.getElementById('register-email').value;
        const firstName = document.getElementById('register-firstname').value;
        const lastName = document.getElementById('register-lastname').value;
        const password = document.getElementById('register-password').value;
        const password2 = document.getElementById('register-password2').value;
        
        if (!email || !password || !password2) {
            showToast('error', 'Error', 'Please fill in all required fields');
            return;
        }
        
        if (password !== password2) {
            showToast('error', 'Error', 'Passwords do not match');
            return;
        }
        
        if (password.length < 6) {
            showToast('error', 'Error', 'Password must be at least 6 characters');
            return;
        }
        
        try {
            await API.register({
                email,
                first_name: firstName,
                last_name: lastName,
                password,
                password2
            });
            showToast('success', 'Account Created!', 'You can now sign in');
            
            // Switch to login form and pre-fill email
            document.getElementById('register-form-container').style.display = 'none';
            document.getElementById('login-form-container').style.display = 'block';
            document.getElementById('login-email').value = email;
        } catch (error) {
            showToast('error', 'Registration Failed', error.message);
        }
    });
    
    // Logout
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        API.clearToken();
        showLogin();
        showToast('success', 'Logged Out', 'You have been signed out');
    });
    
    // Chat
    document.getElementById('send-btn')?.addEventListener('click', sendMessage);
    document.getElementById('chat-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Auto-resize chat input
    document.getElementById('chat-input')?.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 200) + 'px';
    });
    
    // Persona selector (pills in chat input)
    document.querySelectorAll('.persona-pill').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.persona-pill').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPersona = btn.dataset.persona;
            localStorage.setItem('ai_persona', currentPersona);
        });
    });
    
    // Initialize persona pills on load
    const savedPersona = localStorage.getItem('ai_persona') || 'commercial';
    document.querySelectorAll('.persona-pill').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.persona === savedPersona);
    });
    
    // New chat
    document.getElementById('new-chat-btn')?.addEventListener('click', () => {
        currentConversationId = null;
        document.getElementById('chat-messages').innerHTML = `
            <div class="message ai-message animate-fadeIn">
                <div class="message-wrapper">
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <strong>GOLEXAI</strong>
                        <p>${t('chatbot.welcome')}</p>
                    </div>
                </div>
            </div>
        `;
    });
    
    // Document upload button
    document.getElementById('upload-doc-btn')?.addEventListener('click', () => {
        openModal('upload-modal');
        loadCasesForSelect();
    });
    
    document.getElementById('quick-upload-btn')?.addEventListener('click', () => {
        openModal('upload-modal');
        loadCasesForSelect();
    });
    
    // Create case button
    document.getElementById('create-case-btn')?.addEventListener('click', () => {
        openModal('case-modal');
    });
    
    // Document filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterDocuments();
        });
    });
    
    document.getElementById('priority-filter')?.addEventListener('change', filterDocuments);
    document.getElementById('status-filter')?.addEventListener('change', filterDocuments);
    document.getElementById('document-search')?.addEventListener('input', filterDocuments);
    
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
                showToast('success', t('common.success'), t('settings.export_success'));
            } catch (error) {
                showToast('error', t('common.error'), t('settings.export_error'));
            }
        }
    });
    
    document.getElementById('delete-data-btn')?.addEventListener('click', async () => {
        const confirmation = prompt(t('settings.delete_confirmation'));
        if (confirmation === 'DELETE_ALL_MY_DATA') {
            try {
                await API.deleteUserData(confirmation);
                showToast('success', t('common.success'), t('settings.delete_success'));
                API.clearToken();
                showLogin();
            } catch (error) {
                showToast('error', t('common.error'), t('settings.delete_error'));
            }
        } else if (confirmation) {
            showToast('error', t('common.error'), t('settings.delete_wrong_confirmation'));
        }
    });
    
    // Settings language change
    document.getElementById('settings-language')?.addEventListener('change', (e) => {
        setLanguage(e.target.value);
        API.updateUserProfile({ language: e.target.value });
    });
    
    // Attach document buttons
    document.getElementById('attach-doc-btn')?.addEventListener('click', () => {
        document.getElementById('file-input').click();
    });
    
    document.getElementById('inline-attach-btn')?.addEventListener('click', () => {
        document.getElementById('file-input').click();
    });
}

// =================== MODALS ===================

function setupModals() {
    // Close modal buttons
    document.querySelectorAll('.modal-close, [id^="cancel-"]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal-overlay').forEach(modal => {
                modal.classList.remove('active');
            });
        });
    });
    
    // Close on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    });
    
    // Upload confirm
    document.getElementById('confirm-upload')?.addEventListener('click', async () => {
        const fileInput = document.getElementById('file-input');
        const file = fileInput.files[0];
        const name = document.getElementById('document-name').value;
        const priority = document.getElementById('document-priority').value;
        const status = document.getElementById('document-status').value;
        const tags = document.getElementById('document-tags').value;
        const caseId = document.getElementById('document-case').value;
        
        if (!file) {
            showToast('error', t('common.error'), 'Please select a file');
            return;
        }
        
        try {
            await uploadDocument(file, name || file.name, priority, status, tags, caseId);
            closeModal('upload-modal');
            showToast('success', t('common.success'), t('toast.document_uploaded'));
        } catch (error) {
            showToast('error', t('common.error'), error.message);
        }
    });
    
    // Create case confirm
    document.getElementById('confirm-case')?.addEventListener('click', async () => {
        const title = document.getElementById('case-title').value;
        const description = document.getElementById('case-description').value;
        const priority = document.getElementById('case-priority').value;
        const status = document.getElementById('case-status').value;
        
        if (!title) {
            showToast('error', t('common.error'), 'Please enter a case title');
            return;
        }
        
        try {
            await API.createCase({ title, description, priority, status });
            closeModal('case-modal');
            showToast('success', t('common.success'), t('toast.case_created'));
            loadDocuments();
        } catch (error) {
            showToast('error', t('common.error'), error.message);
        }
    });
    
    // Edit document confirm
    document.getElementById('confirm-edit')?.addEventListener('click', async () => {
        if (!currentEditingDocumentId) return;
        
        const name = document.getElementById('edit-document-name').value;
        const priority = document.getElementById('edit-document-priority').value;
        const status = document.getElementById('edit-document-status').value;
        const tags = document.getElementById('edit-document-tags').value;
        
        try {
            await API.updateDocument(currentEditingDocumentId, { 
                title: name, 
                priority, 
                status, 
                tags: tags.split(',').map(t => t.trim()).filter(t => t)
            });
            closeModal('edit-document-modal');
            showToast('success', t('common.success'), t('settings.settings_saved'));
            loadDocuments();
        } catch (error) {
            showToast('error', t('common.error'), error.message);
        }
    });
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// =================== SETTINGS NAV ===================

function setupSettingsNav() {
    document.querySelectorAll('.settings-nav-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.settings-nav-item').forEach(i => i.classList.remove('active'));
            document.querySelectorAll('.settings-section').forEach(s => s.classList.remove('active'));
            
            item.classList.add('active');
            const settingsId = item.dataset.settings;
            document.getElementById(`settings-${settingsId}`).classList.add('active');
        });
    });
}

// =================== NAVIGATION ===================

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

// =================== DASHBOARD DATA ===================

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
        
        // Update persona badge
        updatePersonaBadge();
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function updatePersonaBadge() {
    const badge = document.getElementById('current-persona-badge');
    if (badge) {
        const isCommercial = currentPersona === 'commercial';
        badge.innerHTML = `
            <i class="fas fa-${isCommercial ? 'building' : 'user'}"></i>
            <span>${t(isCommercial ? 'chatbot.commercial_law' : 'chatbot.personal_law')}</span>
        `;
    }
    
    // Update persona selector buttons
    document.querySelectorAll('.persona-option').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.persona === currentPersona);
    });
}

// =================== DOCUMENTS ===================

async function loadDocuments() {
    try {
        const documents = await API.getDocuments();
        const container = document.getElementById('documents-list');
        
        if (!documents.results || documents.results.length === 0) {
            container.innerHTML = `<p class="text-muted">${t('documents.no_documents')}</p>`;
            return;
        }
        
        container.innerHTML = documents.results.map(doc => createDocumentCard(doc)).join('');
        
        // Add event listeners
        setupDocumentCardEvents();
    } catch (error) {
        console.error('Error loading documents:', error);
    }
}

function createDocumentCard(doc) {
    const fileType = doc.file?.endsWith('.pdf') ? 'pdf' : doc.file?.endsWith('.docx') ? 'docx' : 'other';
    const iconClass = fileType === 'pdf' ? 'fa-file-pdf' : fileType === 'docx' ? 'fa-file-word' : 'fa-file';
    const priority = doc.priority || 'medium';
    const status = doc.status || 'started';
    const tags = doc.tags || [];
    
    return `
        <div class="document-card" data-id="${doc.id}" data-type="${fileType}" data-priority="${priority}" data-status="${status}">
            <div class="document-card-header">
                <div class="document-info">
                    <div class="document-icon ${fileType}">
                        <i class="fas ${iconClass}"></i>
                    </div>
                    <div class="document-details">
                        <h3 class="document-title">${doc.title || 'Untitled Document'}</h3>
                        <div class="document-meta">
                            <span><i class="fas fa-clock"></i> ${formatDate(doc.created_at)}</span>
                            <span><i class="fas fa-file"></i> ${formatFileSize(doc.file_size || 0)}</span>
                        </div>
                        <div class="document-tags">
                            <span class="badge badge-${priority}">${t(`documents.${priority}`)}</span>
                            <span class="badge badge-${status.replace('-', '')}">${t(`documents.${status.replace('-', '_')}`)}</span>
                            ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>
                <div class="document-actions">
                    <button class="btn btn-sm btn-outline analyze-btn" data-id="${doc.id}" title="${t('documents.analyze')}">
                        <i class="fas fa-brain"></i>
                    </button>
                    <button class="btn btn-sm btn-outline download-btn" data-id="${doc.id}" title="${t('documents.download')}">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn btn-sm btn-outline edit-btn" data-id="${doc.id}" title="${t('documents.edit')}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline delete-btn" data-id="${doc.id}" title="${t('documents.delete')}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <button class="expand-btn" data-id="${doc.id}">
                <i class="fas fa-chevron-down"></i>
                <span>${t('documents.expand')}</span>
            </button>
            <div class="document-expanded">
                <div class="document-expanded-grid">
                    <div class="detail-item">
                        <label>${t('documents.created')}</label>
                        <span>${formatDate(doc.created_at)}</span>
                    </div>
                    <div class="detail-item">
                        <label>${t('documents.modified')}</label>
                        <span>${formatDate(doc.updated_at)}</span>
                    </div>
                    <div class="detail-item">
                        <label>${t('documents.size')}</label>
                        <span>${formatFileSize(doc.file_size || 0)}</span>
                    </div>
                    <div class="detail-item">
                        <label>${t('documents.type')}</label>
                        <span>${fileType.toUpperCase()}</span>
                    </div>
                    <div class="detail-item">
                        <label>${t('documents.case')}</label>
                        <span>${doc.case_title || 'Not assigned'}</span>
                    </div>
                    ${doc.analysis ? `
                    <div class="detail-item" style="grid-column: span 3;">
                        <label>${t('documents.analysis_result')}</label>
                        <span>${doc.analysis.substring(0, 200)}...</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

function setupDocumentCardEvents() {
    // Expand/collapse
    document.querySelectorAll('.expand-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.document-card');
            card.classList.toggle('expanded');
            const icon = btn.querySelector('i');
            const text = btn.querySelector('span');
            if (card.classList.contains('expanded')) {
                icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
                text.textContent = t('documents.collapse');
            } else {
                icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
                text.textContent = t('documents.expand');
            }
        });
    });
    
    // Analyze
    document.querySelectorAll('.analyze-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            try {
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                await analyzeDocument(id);
                btn.innerHTML = '<i class="fas fa-brain"></i>';
            } catch (error) {
                btn.innerHTML = '<i class="fas fa-brain"></i>';
            }
        });
    });
    
    // Download
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            API.downloadDocument(btn.dataset.id);
        });
    });
    
    // Edit
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            openEditModal(btn.dataset.id);
        });
    });
    
    // Delete
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to delete this document?')) {
                try {
                    await API.deleteDocument(btn.dataset.id);
                    showToast('success', t('common.success'), t('toast.document_deleted'));
                    loadDocuments();
                } catch (error) {
                    showToast('error', t('common.error'), error.message);
                }
            }
        });
    });
}

function openEditModal(docId) {
    currentEditingDocumentId = docId;
    const card = document.querySelector(`.document-card[data-id="${docId}"]`);
    
    if (card) {
        document.getElementById('edit-document-name').value = card.querySelector('.document-title').textContent;
        document.getElementById('edit-document-priority').value = card.dataset.priority;
        document.getElementById('edit-document-status').value = card.dataset.status;
        document.getElementById('edit-document-tags').value = Array.from(card.querySelectorAll('.tag')).map(t => t.textContent).join(', ');
    }
    
    openModal('edit-document-modal');
}

function filterDocuments() {
    const typeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const priorityFilter = document.getElementById('priority-filter')?.value || '';
    const statusFilter = document.getElementById('status-filter')?.value || '';
    const searchTerm = document.getElementById('document-search')?.value.toLowerCase() || '';
    
    document.querySelectorAll('.document-card').forEach(card => {
        const matchesType = typeFilter === 'all' || card.dataset.type === typeFilter || 
            (typeFilter === 'ai-generated' && card.querySelector('.badge-ai'));
        const matchesPriority = !priorityFilter || card.dataset.priority === priorityFilter;
        const matchesStatus = !statusFilter || card.dataset.status === statusFilter;
        const matchesSearch = !searchTerm || card.querySelector('.document-title').textContent.toLowerCase().includes(searchTerm);
        
        card.style.display = matchesType && matchesPriority && matchesStatus && matchesSearch ? 'block' : 'none';
    });
}

async function uploadDocument(file, title, priority, status, tags, caseId) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('file_type', file.name.endsWith('.pdf') ? 'other' : 'other');
    formData.append('priority', priority);
    formData.append('status', status);
    if (tags) formData.append('tags', tags);
    if (caseId) formData.append('case', caseId);
    
    await API.uploadDocument(file, title, 'other', caseId);
    await loadDocuments();
}

async function loadCasesForSelect() {
    try {
        const cases = await API.getCases();
        const select = document.getElementById('document-case');
        select.innerHTML = '<option value="">None</option>';
        
        if (cases.results) {
            cases.results.forEach(c => {
                select.innerHTML += `<option value="${c.id}">${c.title}</option>`;
            });
        }
    } catch (error) {
        console.error('Error loading cases:', error);
    }
}

// =================== CHAT ===================

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;
    
    const messagesContainer = document.getElementById('chat-messages');
    
    // Add user message
    messagesContainer.innerHTML += `
        <div class="message user-message animate-fadeIn">
            <div class="message-wrapper">
                <div class="message-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="message-content">
                    <strong>${t('chatbot.you')}</strong>
                    <p>${escapeHtml(message)}</p>
                </div>
            </div>
        </div>
    `;
    
    input.value = '';
    input.style.height = 'auto';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Show typing indicator
    const typingId = 'typing-' + Date.now();
    messagesContainer.innerHTML += `
        <div class="message ai-message" id="${typingId}">
            <div class="message-wrapper">
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <strong>GOLEXAI</strong>
                    <div class="typing-indicator">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            </div>
        </div>
    `;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    try {
        const response = await API.sendChatMessage(message, currentConversationId, null, currentPersona);
        currentConversationId = response.conversation_id;
        
        // Remove typing indicator
        document.getElementById(typingId)?.remove();
        
        // Add AI response with formatted text
        const formattedContent = formatAIResponse(response.message.content);
        messagesContainer.innerHTML += `
            <div class="message ai-message animate-fadeIn">
                <div class="message-wrapper">
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <strong>GOLEXAI</strong>
                        <div class="formatted-text">${formattedContent}</div>
                        <div class="message-actions">
                            <button class="message-action-btn copy-btn" onclick="copyToClipboard(this)">
                                <i class="fas fa-copy"></i> ${t('chatbot.copy')}
                            </button>
                            <button class="message-action-btn" onclick="regenerateResponse()">
                                <i class="fas fa-redo"></i> ${t('chatbot.regenerate')}
                            </button>
                            <button class="message-action-btn" onclick="downloadAsDocument('${response.message.id}')">
                                <i class="fas fa-file-download"></i> ${t('chatbot.download')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // If a document was generated, add it to documents section
        if (response.generated_document) {
            showToast('info', 'Document Created', 'A new document has been added to your Documents section');
            loadDocuments();
        }
        
    } catch (error) {
        document.getElementById(typingId)?.remove();
        showToast('error', 'Error', 'Failed to send message: ' + error.message);
    }
}

function formatAIResponse(content) {
    // Convert markdown-like formatting to HTML
    let formatted = escapeHtml(content);
    
    // Bold: **text** or __text__
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/__(.*?)__/g, '<strong>$1</strong>');
    
    // Italic: *text* or _text_
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Line breaks
    formatted = formatted.replace(/\n/g, '<br>');
    
    // Lists
    formatted = formatted.replace(/^- (.*)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    return formatted;
}

function copyToClipboard(btn) {
    const content = btn.closest('.message-content').querySelector('.formatted-text').innerText;
    navigator.clipboard.writeText(content).then(() => {
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => { btn.innerHTML = originalText; }, 2000);
    });
}

function regenerateResponse() {
    // Get the last user message and resend it
    const messages = document.querySelectorAll('.user-message');
    if (messages.length > 0) {
        const lastUserMessage = messages[messages.length - 1];
        const content = lastUserMessage.querySelector('p').textContent;
        document.getElementById('chat-input').value = content;
        sendMessage();
    }
}

function downloadAsDocument(messageId) {
    showToast('info', 'Coming Soon', 'Document download will be available soon');
}

async function loadConversations() {
    try {
        const conversations = await API.getConversations();
        const container = document.getElementById('conversations-list');
        
        if (!conversations.results || conversations.results.length === 0) {
            container.innerHTML = '<p class="text-muted" style="padding: 1rem; text-align: center; font-size: 0.8rem;">No conversations yet</p>';
            return;
        }
        
        container.innerHTML = conversations.results.map(conv => `
            <div class="conversation-item ${conv.id === currentConversationId ? 'active' : ''}" data-id="${conv.id}">
                <h4>${conv.title || 'Conversation'}</h4>
                <p>${formatDate(conv.updated_at)}</p>
            </div>
        `).join('');
        
        // Add click events
        container.querySelectorAll('.conversation-item').forEach(item => {
            item.addEventListener('click', () => loadConversation(item.dataset.id));
        });
    } catch (error) {
        console.error('Error loading conversations:', error);
    }
}

async function loadConversation(conversationId) {
    currentConversationId = conversationId;
    // TODO: Load conversation messages
}

// =================== DOCUMENT ANALYSIS ===================

async function analyzeDocument(documentId) {
    try {
        const result = await API.analyzeDocument(documentId);
        showToast('success', t('common.success'), t('toast.document_analyzed'));
        loadDocuments();
    } catch (error) {
        showToast('error', t('common.error'), error.message);
        throw error;
    }
}

// =================== UTILITIES ===================

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString(currentLanguage === 'pl' ? 'pl-PL' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// =================== TOAST NOTIFICATIONS ===================

function showToast(type, title, message) {
    const container = document.getElementById('toast-container');
    const toastId = 'toast-' + Date.now();
    
    const iconMap = {
        success: 'fa-check',
        error: 'fa-times',
        info: 'fa-info',
        warning: 'fa-exclamation'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.id = toastId;
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${iconMap[type]}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.closest('.toast').remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        document.getElementById(toastId)?.remove();
    }, 5000);
}
