// Main application logic for GOLEXAI
let currentConversationId = null;
let currentPersona = localStorage.getItem('ai_persona') || 'commercial';
let currentConversationCaseId = null; // Track case per conversation
let currentEditingDocumentId = null;
let currentEditingCaseId = null;
let currentPreviewDocumentId = null;
let currentAnalyticsRange = '7d';

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
    setupModals();
    setupSettingsNav();
    updateTime();
    setInterval(updateTime, 1000); // Update time every second
});

// =================== AUTH ===================

async function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (token) {
        API.setToken(token);
        try {
            // Verify token is still valid
            await API.getCurrentUser();
            showDashboard();
            loadDashboardData();
            loadUserProfile();
        } catch (error) {
            console.error('Auth check failed:', error);
            // Token is invalid, clear it and show login
            API.clearToken();
            showLogin();
        }
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
            const welcomeNameEl = document.getElementById('welcome-user-name');
            const settingsAvatarEl = document.getElementById('settings-avatar');
            const settingsNameEl = document.getElementById('settings-user-name');
            const settingsEmailEl = document.getElementById('settings-user-email');
            const settingsRoleEl = document.getElementById('settings-user-role');
            
            if (avatarEl) avatarEl.textContent = initial;
            if (nameEl) nameEl.textContent = userName;
            if (welcomeNameEl) welcomeNameEl.textContent = userName;
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

function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    const timeEl = document.getElementById('current-time');
    if (timeEl) {
        timeEl.textContent = timeString;
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
    
    // Chat case selector
    document.getElementById('chat-case-selector')?.addEventListener('change', function() {
        currentConversationCaseId = this.value || null;
    });
    
    // AI Settings
    document.getElementById('settings-temperature')?.addEventListener('input', function() {
        const value = (this.value / 100).toFixed(1);
        document.getElementById('temperature-value').textContent = value;
    });
    
    document.getElementById('save-ai-settings-btn')?.addEventListener('click', saveAISettings);
    
    // Load AI settings on startup
    loadAISettings();
    
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
        currentConversationCaseId = null;
        
        // Clear case selector
        const caseSelector = document.getElementById('chat-case-selector');
        if (caseSelector) caseSelector.value = '';
        
        // Clear active state from conversations
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
        });
        
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
    
    // User dropdown
    document.getElementById('profile-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = document.getElementById('user-dropdown');
        dropdown.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown && !e.target.closest('.user-dropdown-container')) {
            dropdown.classList.remove('active');
        }
        
        // Also close export menu
        const exportMenu = document.getElementById('export-menu');
        if (exportMenu && !e.target.closest('.export-dropdown')) {
            exportMenu.classList.remove('active');
        }
    });
    
    // Dropdown menu items
    document.querySelectorAll('.dropdown-item[data-section]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.currentTarget.dataset.section;
            showSection(section);
            document.getElementById('user-dropdown').classList.remove('active');
            
            // If going to specific settings tab
            const settingsTab = e.currentTarget.dataset.settingsTab;
            if (settingsTab) {
                setTimeout(() => {
                    document.querySelector(`.settings-nav-item[data-settings="${settingsTab}"]`)?.click();
                }, 100);
            }
        });
    });
    
    // Dropdown logout
    document.getElementById('dropdown-logout-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        API.clearToken();
        showLogin();
        showToast('success', 'Logged Out', 'You have been signed out');
    });
    
    // Analytics date range buttons
    document.querySelectorAll('.date-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.date-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentAnalyticsRange = btn.dataset.range;
            loadAnalytics();
        });
    });
    
    // Export report button
    document.getElementById('export-report-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('export-menu').classList.toggle('active');
    });
    
    // Export options
    document.querySelectorAll('.export-option').forEach(btn => {
        btn.addEventListener('click', async () => {
            const format = btn.dataset.format;
            try {
                await API.exportReport(format, currentAnalyticsRange);
                showToast('success', 'Export Complete', `Report exported as ${format.toUpperCase()}`);
            } catch (error) {
                showToast('error', 'Export Failed', error.message);
            }
            document.getElementById('export-menu').classList.remove('active');
        });
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
    
    // Edit case confirm
    document.getElementById('confirm-edit-case')?.addEventListener('click', async () => {
        if (!currentEditingCaseId) return;
        
        const title = document.getElementById('edit-case-title').value;
        const description = document.getElementById('edit-case-description').value;
        const priority = document.getElementById('edit-case-priority').value;
        const status = document.getElementById('edit-case-status').value;
        
        try {
            await API.updateCase(currentEditingCaseId, { title, description, priority, status });
            closeModal('edit-case-modal');
            showToast('success', 'Success', 'Case updated successfully');
            loadDocuments();
            closeCasePanel();
        } catch (error) {
            showToast('error', 'Error', error.message);
        }
    });
    
    // Delete case button
    document.getElementById('delete-case-btn')?.addEventListener('click', async () => {
        if (!currentEditingCaseId) return;
        
        if (confirm('Are you sure you want to delete this case? This cannot be undone.')) {
            try {
                await API.deleteCase(currentEditingCaseId);
                closeModal('edit-case-modal');
                showToast('success', 'Success', 'Case deleted successfully');
                loadDocuments();
                closeCasePanel();
            } catch (error) {
                showToast('error', 'Error', error.message);
            }
        }
    });
    
    // Close preview modal
    document.getElementById('close-preview-btn')?.addEventListener('click', () => {
        closeModal('preview-document-modal');
    });
    
    // Download from preview
    document.getElementById('download-preview-btn')?.addEventListener('click', () => {
        if (currentPreviewDocumentId) {
            API.downloadDocument(currentPreviewDocumentId);
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
        const analytics = await API.getAnalytics(currentAnalyticsRange);
        if (analytics) {
            const statDocs = document.getElementById('stat-documents');
            const statCases = document.getElementById('stat-cases');
            const statQueries = document.getElementById('stat-queries');
            const statProductivity = document.getElementById('stat-productivity');
            
            if (statDocs) statDocs.textContent = analytics.documents?.total || 0;
            if (statCases) statCases.textContent = analytics.cases?.active || 0;
            if (statQueries) statQueries.textContent = analytics.ai_usage?.queries || 0;
            if (statProductivity) statProductivity.textContent = analytics.documents?.in_range || 0;
            
            // Update analytics page metrics
            updateAnalyticsPage(analytics);
        }
        
        // Load recent activity
        await loadRecentActivity();
        
        // Load documents
        await loadDocuments();
        
        // Load conversations
        await loadConversations();
        
        // Load cases for chat selector
        await loadCasesForChatSelector();
    } catch (error) {
        console.error('Error loading dashboard:', error);
        // If auth error, redirect to login
        if (error.message?.includes('Authentication') || error.message?.includes('401')) {
            API.clearToken();
            showLogin();
        }
    }
}

async function loadAnalytics() {
    try {
        const analytics = await API.getAnalytics(currentAnalyticsRange);
        updateAnalyticsPage(analytics);
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

function updateAnalyticsPage(analytics) {
    if (!analytics) return;
    
    // Update metric cards
    const metricDocs = document.getElementById('metric-documents');
    const metricQueries = document.getElementById('metric-queries');
    const metricTime = document.getElementById('metric-time');
    const metricCompleted = document.getElementById('metric-completed');
    
    if (metricDocs) metricDocs.textContent = analytics.documents?.total || 0;
    if (metricQueries) metricQueries.textContent = analytics.ai_usage?.queries || 0;
    if (metricTime) metricTime.textContent = `${analytics.time_saved?.hours || 0}h`;
    if (metricCompleted) metricCompleted.textContent = analytics.cases?.by_status?.closed || 0;
    
    // Update donut chart
    updateDonutChart(analytics);
    
    // Update line chart
    updateActivityChart(analytics);
    
    // Update case status bars
    const statusOpen = document.getElementById('status-open');
    const statusProgress = document.getElementById('status-progress');
    const statusCompleted = document.getElementById('status-completed');
    
    const totalCases = analytics.cases?.total || 1;
    const openCount = analytics.cases?.by_status?.open || 0;
    const progressCount = analytics.cases?.by_status?.in_progress || 0;
    const closedCount = analytics.cases?.by_status?.closed || 0;
    
    if (statusOpen) statusOpen.textContent = openCount;
    if (statusProgress) statusProgress.textContent = progressCount;
    if (statusCompleted) statusCompleted.textContent = closedCount;
    
    // Update bars with animation
    const maxCases = Math.max(openCount, progressCount, closedCount, 1);
    document.querySelectorAll('.status-bar-fill.open').forEach(bar => {
        bar.style.width = `${(openCount / maxCases) * 100}%`;
    });
    document.querySelectorAll('.status-bar-fill.progress').forEach(bar => {
        bar.style.width = `${(progressCount / maxCases) * 100}%`;
    });
    document.querySelectorAll('.status-bar-fill.completed').forEach(bar => {
        bar.style.width = `${(closedCount / maxCases) * 100}%`;
    });
    
    // Update document types
    const typePdf = document.getElementById('type-pdf');
    const typeDocx = document.getElementById('type-docx');
    const typeAi = document.getElementById('type-ai');
    
    if (typePdf) typePdf.textContent = `${analytics.documents?.pdf_count || 0} files`;
    if (typeDocx) typeDocx.textContent = `${analytics.documents?.docx_count || 0} files`;
    if (typeAi) typeAi.textContent = `${analytics.documents?.ai_generated || 0} files`;
    
    // Update document type bars
    const maxDocs = Math.max(
        analytics.documents?.pdf_count || 0,
        analytics.documents?.docx_count || 0,
        analytics.documents?.ai_generated || 0,
        1
    );
    document.querySelectorAll('.doc-type-item').forEach((item, i) => {
        const fill = item.querySelector('.doc-type-fill');
        if (fill) {
            if (i === 0) fill.style.width = `${((analytics.documents?.pdf_count || 0) / maxDocs) * 100}%`;
            if (i === 1) fill.style.width = `${((analytics.documents?.docx_count || 0) / maxDocs) * 100}%`;
            if (i === 2) fill.style.width = `${((analytics.documents?.ai_generated || 0) / maxDocs) * 100}%`;
        }
    });
    
    // Update analytics activity feed
    const activityFeed = document.getElementById('analytics-activity');
    if (activityFeed && analytics.recent_activity) {
        if (analytics.recent_activity.length === 0) {
            activityFeed.innerHTML = '<p class="empty-state"><i class="fas fa-inbox"></i> Nothing to show</p>';
        } else {
            activityFeed.innerHTML = analytics.recent_activity.map(activity => `
                <div class="activity-item">
                    <div class="activity-icon ${activity.type}">
                        <i class="fas fa-${activity.type === 'document' ? 'file-alt' : 'briefcase'}"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-text">${activity.action}: ${escapeHtml(activity.title)}</div>
                        <div class="activity-time">${formatDate(activity.time)}</div>
                    </div>
                </div>
            `).join('');
        }
    }
}

function updateDonutChart(analytics) {
    const queries = analytics.ai_usage?.queries || 0;
    const analyzed = analytics.ai_usage?.documents_analyzed || 0;
    const generated = analytics.ai_usage?.documents_generated || 0;
    const total = queries + analyzed + generated;
    
    // Update total
    const donutTotal = document.getElementById('donut-total');
    if (donutTotal) donutTotal.textContent = total;
    
    if (total === 0) {
        // Show empty state
        document.getElementById('donut-queries')?.setAttribute('stroke-dasharray', '0 251.2');
        document.getElementById('donut-analysis')?.setAttribute('stroke-dasharray', '0 251.2');
        document.getElementById('donut-generation')?.setAttribute('stroke-dasharray', '0 251.2');
        
        document.getElementById('percent-queries').textContent = '0%';
        document.getElementById('percent-analysis').textContent = '0%';
        document.getElementById('percent-generation').textContent = '0%';
        return;
    }
    
    const circumference = 2 * Math.PI * 40; // 251.2
    
    // Calculate percentages
    const queriesPercent = (queries / total) * 100;
    const analyzedPercent = (analyzed / total) * 100;
    const generatedPercent = (generated / total) * 100;
    
    // Calculate dash arrays
    const queriesDash = (queriesPercent / 100) * circumference;
    const analyzedDash = (analyzedPercent / 100) * circumference;
    const generatedDash = (generatedPercent / 100) * circumference;
    
    // Update donut segments
    const donutQueries = document.getElementById('donut-queries');
    const donutAnalysis = document.getElementById('donut-analysis');
    const donutGeneration = document.getElementById('donut-generation');
    
    if (donutQueries) {
        donutQueries.setAttribute('stroke-dasharray', `${queriesDash} ${circumference}`);
        donutQueries.setAttribute('stroke-dashoffset', '0');
    }
    
    if (donutAnalysis) {
        donutAnalysis.setAttribute('stroke-dasharray', `${analyzedDash} ${circumference}`);
        donutAnalysis.setAttribute('stroke-dashoffset', `-${queriesDash}`);
    }
    
    if (donutGeneration) {
        donutGeneration.setAttribute('stroke-dasharray', `${generatedDash} ${circumference}`);
        donutGeneration.setAttribute('stroke-dashoffset', `-${queriesDash + analyzedDash}`);
    }
    
    // Update percentages
    document.getElementById('percent-queries').textContent = `${Math.round(queriesPercent)}%`;
    document.getElementById('percent-analysis').textContent = `${Math.round(analyzedPercent)}%`;
    document.getElementById('percent-generation').textContent = `${Math.round(generatedPercent)}%`;
}

function updateActivityChart(analytics) {
    const data = analytics.documents_by_day || [];
    if (data.length === 0) {
        // Show empty state
        const labelsContainer = document.getElementById('chart-date-labels');
        if (labelsContainer) {
            labelsContainer.innerHTML = '<span style="width: 100%; text-align: center; color: var(--text-muted);">No data for this period</span>';
        }
        return;
    }
    
    // Determine how many points to show based on range - fewer points = cleaner chart
    const maxPoints = currentAnalyticsRange === '7d' ? 7 : currentAnalyticsRange === '30d' ? 8 : 10;
    const step = Math.max(1, Math.ceil(data.length / maxPoints));
    let sampledData = [];
    
    // Sample evenly but always include first and last
    for (let i = 0; i < data.length; i += step) {
        sampledData.push(data[i]);
    }
    // Always include the last data point
    if (sampledData[sampledData.length - 1] !== data[data.length - 1]) {
        sampledData.push(data[data.length - 1]);
    }
    
    // Ensure we have at least 2 points for a line
    if (sampledData.length < 2 && data.length >= 2) {
        sampledData = [data[0], data[data.length - 1]];
    }
    
    const chartWidth = 380;
    const chartHeight = 140;
    const paddingX = 20;
    const paddingY = 20;
    const chartInnerWidth = chartWidth - paddingX * 2;
    const chartInnerHeight = chartHeight - paddingY * 2;
    
    // Find max value for scaling (minimum of 1 to avoid division by zero)
    const allValues = sampledData.flatMap(d => [d.uploaded || 0, d.generated || 0]);
    const maxValue = Math.max(...allValues, 1);
    
    // Helper function to calculate point coordinates
    const getPoint = (value, index) => {
        const x = paddingX + (index / Math.max(sampledData.length - 1, 1)) * chartInnerWidth;
        const y = paddingY + chartInnerHeight - (value / maxValue) * chartInnerHeight;
        return { x, y };
    };
    
    // Generate smooth curve points for uploaded documents
    const uploadedPoints = sampledData.map((d, i) => {
        const pt = getPoint(d.uploaded || 0, i);
        return `${pt.x},${pt.y}`;
    }).join(' ');
    
    // Generate points for generated documents
    const generatedPoints = sampledData.map((d, i) => {
        const pt = getPoint(d.generated || 0, i);
        return `${pt.x},${pt.y}`;
    }).join(' ');
    
    // Create area path for uploaded (fill under the line)
    const firstPt = getPoint(sampledData[0].uploaded || 0, 0);
    const lastPt = getPoint(sampledData[sampledData.length - 1].uploaded || 0, sampledData.length - 1);
    const uploadedAreaPath = `M${firstPt.x},${paddingY + chartInnerHeight} L${uploadedPoints.split(' ').join(' L')} L${lastPt.x},${paddingY + chartInnerHeight} Z`;
    
    // Update SVG viewBox for proper aspect ratio
    const svg = document.getElementById('activity-chart-svg');
    if (svg) {
        svg.setAttribute('viewBox', `0 0 ${chartWidth} ${chartHeight}`);
    }
    
    // Update SVG elements
    document.getElementById('chart-area-uploaded')?.setAttribute('d', uploadedAreaPath);
    document.getElementById('chart-line-uploaded')?.setAttribute('points', uploadedPoints);
    document.getElementById('chart-line-generated')?.setAttribute('points', generatedPoints);
    
    // Only add dots on days with activity (not zero values)
    const dotsContainer = document.getElementById('chart-dots-uploaded');
    if (dotsContainer) {
        dotsContainer.innerHTML = sampledData
            .map((d, i) => {
                const value = d.uploaded || 0;
                if (value === 0) return ''; // Don't show dot for zero
                const pt = getPoint(value, i);
                return `<circle cx="${pt.x}" cy="${pt.y}" r="5" fill="#D4A574" stroke="white" stroke-width="2"/>`;
            })
            .filter(s => s)
            .join('');
    }
    
    // Only add dots for generated documents with activity
    const genDotsContainer = document.getElementById('chart-dots-generated');
    if (genDotsContainer) {
        genDotsContainer.innerHTML = sampledData
            .map((d, i) => {
                const value = d.generated || 0;
                if (value === 0) return ''; // Don't show dot for zero
                const pt = getPoint(value, i);
                return `<circle cx="${pt.x}" cy="${pt.y}" r="5" fill="#3b82f6" stroke="white" stroke-width="2"/>`;
            })
            .filter(s => s)
            .join('');
    }
    
    // Update date labels - show evenly spaced labels
    const labelsContainer = document.getElementById('chart-date-labels');
    if (labelsContainer) {
        const numLabels = Math.min(7, sampledData.length);
        const labelStep = Math.max(1, Math.floor((sampledData.length - 1) / (numLabels - 1)));
        const labelIndices = [];
        for (let i = 0; i < sampledData.length; i += labelStep) {
            labelIndices.push(i);
        }
        // Always include last index
        if (!labelIndices.includes(sampledData.length - 1)) {
            labelIndices.push(sampledData.length - 1);
        }
        
        labelsContainer.innerHTML = labelIndices.map(i => {
            const d = sampledData[i];
            const date = new Date(d.date);
            return `<span>${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>`;
        }).join('');
    }
}

async function loadRecentActivity() {
    try {
        const [documents, cases, conversations] = await Promise.all([
            API.getDocuments(),
            API.getCases(),
            API.getConversations()
        ]);
        
        const activities = [];
        
        // Add documents
        if (documents.results) {
            documents.results.slice(0, 3).forEach(doc => {
                activities.push({
                    type: 'document',
                    icon: 'file-alt',
                    text: `Uploaded "${doc.title}"`,
                    time: doc.created_at
                });
            });
        }
        
        // Add cases
        if (cases.results) {
            cases.results.slice(0, 3).forEach(c => {
                activities.push({
                    type: 'case',
                    icon: 'briefcase',
                    text: `Created case "${c.title}"`,
                    time: c.created_at
                });
            });
        }
        
        // Add conversations
        if (conversations.results) {
            conversations.results.slice(0, 3).forEach(conv => {
                activities.push({
                    type: 'conversation',
                    icon: 'comments',
                    text: `Started conversation "${conv.title || 'Untitled'}"`,
                    time: conv.created_at
                });
            });
        }
        
        // Sort by time (most recent first)
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));
        
        const container = document.getElementById('recent-activity');
        if (!container) return;
        
        if (activities.length === 0) {
            container.innerHTML = '<p class="empty-state"><i class="fas fa-inbox"></i> Nothing to show</p>';
            return;
        }
        
        container.innerHTML = activities.slice(0, 10).map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    <i class="fas fa-${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-text">${escapeHtml(activity.text)}</div>
                    <div class="activity-time">${formatDate(activity.time)}</div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading recent activity:', error);
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
        const [documents, cases] = await Promise.all([
            API.getDocuments(),
            API.getCases()
        ]);
        
        const container = document.getElementById('documents-list');
        
        let html = '';
        
        // Add cases first
        if (cases.results && cases.results.length > 0) {
            html += '<h3 style="margin: 1.5rem 0 1rem; color: var(--text-primary);">Cases</h3>';
            html += cases.results.map(caseItem => createCaseCard(caseItem)).join('');
        }
        
        // Add documents
        if (documents.results && documents.results.length > 0) {
            html += '<h3 style="margin: 1.5rem 0 1rem; color: var(--text-primary);">Documents</h3>';
            html += documents.results.map(doc => createDocumentCard(doc)).join('');
        }
        
        if (!html) {
            container.innerHTML = `<p class="text-muted">${t('documents.no_documents')}</p>`;
            return;
        }
        
        container.innerHTML = html;
        
        // Add event listeners
        setupDocumentCardEvents();
    } catch (error) {
        console.error('Error loading documents:', error);
    }
}

function createCaseCard(caseItem) {
    const priorityClass = caseItem.priority || 'medium';
    const statusBadge = caseItem.status === 'open' ? 'Open' : 
                       caseItem.status === 'in_progress' ? 'In Progress' : 'Closed';
    const statusClass = caseItem.status || 'open';
    
    return `
        <div class="document-card case-card" data-case-id="${caseItem.id}">
            <div class="document-card-header">
                <div class="document-info">
                    <div class="document-icon case-icon">
                        <i class="fas fa-briefcase"></i>
                    </div>
                    <div>
                        <h4>${escapeHtml(caseItem.title)}</h4>
                        <p class="document-meta">
                            <span class="badge badge-${priorityClass}">${caseItem.priority}</span>
                            <span class="badge badge-${statusClass}">${statusBadge}</span>
                        </p>
                    </div>
                </div>
            </div>
            ${caseItem.description ? `<p class="document-description">${escapeHtml(caseItem.description)}</p>` : ''}
            <div class="document-card-footer">
                <span class="document-date">${formatDate(caseItem.created_at)}</span>
                <span class="document-doc-count">${caseItem.document_count || 0} documents</span>
            </div>
        </div>
    `;
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
                    <button class="btn btn-sm btn-outline preview-btn" data-id="${doc.id}" title="Preview">
                        <i class="fas fa-eye"></i>
                    </button>
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
    
    // Preview
    document.querySelectorAll('.preview-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            previewDocument(btn.dataset.id);
        });
    });
    
    // Analyze
    document.querySelectorAll('.analyze-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
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
    
    // Case card click to open panel
    document.querySelectorAll('.case-card').forEach(card => {
        card.addEventListener('click', () => {
            const caseId = card.dataset.caseId;
            if (caseId) {
                openCasePanel(caseId);
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
        const response = await API.sendChatMessage(message, currentConversationId, null, currentPersona, currentConversationCaseId);
        currentConversationId = response.conversation_id;
        
        // Remove typing indicator
        document.getElementById(typingId)?.remove();
        
        const aiContent = response.message.content;
        
        // Check if AI generated a document (contains document-like content)
        const isDocumentGeneration = detectDocumentGeneration(message, aiContent);
        
        if (isDocumentGeneration) {
            // Auto-save the document
            const docTitle = extractDocumentTitle(message, aiContent);
            
            try {
                const docResponse = await API.generateDocument(aiContent, docTitle, 'docx', currentConversationCaseId);
                const savedDoc = docResponse.document;
                
                // Show document preview widget in chat
                messagesContainer.innerHTML += `
                    <div class="message ai-message animate-fadeIn">
                        <div class="message-wrapper">
                            <div class="message-avatar">
                                <i class="fas fa-robot"></i>
                            </div>
                            <div class="message-content">
                                <strong>GOLEXAI</strong>
                                <p style="margin-bottom: 1rem;">I've generated your document:</p>
                                
                                <div class="document-preview-widget">
                                    <div class="doc-preview-header">
                                        <div class="doc-preview-icon">
                                            <i class="fas fa-file-word"></i>
                                        </div>
                                        <div class="doc-preview-info">
                                            <h4>${escapeHtml(docTitle)}</h4>
                                            <span class="doc-preview-meta">DOCX • Just now • Auto-saved</span>
                                        </div>
                                    </div>
                                    <div class="doc-preview-content">
                                        ${formatAIResponse(aiContent.substring(0, 500))}${aiContent.length > 500 ? '...' : ''}
                                    </div>
                                    <div class="doc-preview-actions">
                                        <button class="btn btn-primary" onclick="API.downloadDocument(${savedDoc.id})">
                                            <i class="fas fa-download"></i> Download DOCX
                                        </button>
                                        <button class="btn btn-secondary" onclick="previewDocument(${savedDoc.id})">
                                            <i class="fas fa-eye"></i> Full Preview
                                        </button>
                                        <button class="btn btn-outline copy-btn" onclick="copyToClipboard(this)" data-content="${escapeHtml(aiContent).replace(/"/g, '&quot;')}">
                                            <i class="fas fa-copy"></i> Copy Text
                                        </button>
                                    </div>
                                </div>
                                
                                <p style="margin-top: 1rem; font-size: 0.85rem; color: var(--text-muted);">
                                    <i class="fas fa-check-circle" style="color: var(--success);"></i> 
                                    Document saved to your Documents section
                                </p>
                            </div>
                        </div>
                    </div>
                `;
                
                showToast('success', 'Document Generated', `"${docTitle}" has been created and saved`);
                loadDocuments();
                
            } catch (docError) {
                // If auto-save fails, show regular response with save button
                showRegularAIResponse(messagesContainer, response, aiContent);
                showToast('warning', 'Note', 'Document generated but auto-save failed. Use Save button.');
            }
        } else {
            // Regular AI response (not a document)
            showRegularAIResponse(messagesContainer, response, aiContent);
        }
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
    } catch (error) {
        document.getElementById(typingId)?.remove();
        showToast('error', 'Error', 'Failed to send message: ' + error.message);
    }
}

function showRegularAIResponse(container, response, aiContent) {
    const formattedContent = formatAIResponse(aiContent);
    container.innerHTML += `
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
                        <button class="message-action-btn" onclick="saveAsDocument('${response.message.id}', this)">
                            <i class="fas fa-file-alt"></i> Save as Document
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function detectDocumentGeneration(userMessage, aiResponse) {
    // Keywords in user message that indicate document generation request
    const documentKeywords = [
        'generate', 'create', 'draft', 'write', 'prepare', 'make',
        'wygeneruj', 'stwórz', 'napisz', 'przygotuj', 'sporządź'
    ];
    
    // Keywords for updating/modifying documents
    const updateKeywords = [
        'update', 'change', 'modify', 'edit', 'revise', 'correct', 'fix',
        'zaktualizuj', 'zmień', 'popraw', 'edytuj',
        'give it', 'give me', 'daj mi',
        'as pdf', 'as docx', 'jako pdf', 'jako docx',
        'with the', 'with these', 'z tymi'
    ];
    
    const documentTypes = [
        'contract', 'agreement', 'umowa', 'kontrakt',
        'letter', 'list', 'pismo',
        'will', 'testament',
        'document', 'dokument',
        'lease', 'najem', 'dzierżawa',
        'nda', 'confidentiality', 'poufność',
        'employment', 'zatrudnienie', 'praca',
        'power of attorney', 'pełnomocnictwo',
        'invoice', 'faktura',
        'complaint', 'skarga', 'pozew',
        'motion', 'wniosek',
        'policy', 'regulamin',
        'terms', 'warunki',
        'sales', 'sprzedaż'
    ];
    
    const lowerMessage = userMessage.toLowerCase();
    const lowerResponse = aiResponse.toLowerCase();
    
    // Check if user asked to generate a document
    const hasDocKeyword = documentKeywords.some(kw => lowerMessage.includes(kw));
    const hasDocType = documentTypes.some(dt => lowerMessage.includes(dt));
    const hasUpdateKeyword = updateKeywords.some(kw => lowerMessage.includes(kw));
    
    // Check if response looks like a document (has structure)
    const hasDocumentStructure = 
        (aiResponse.includes('**') && aiResponse.split('**').length > 4) || // Has multiple bold headers
        (aiResponse.includes('§') || aiResponse.includes('Article') || aiResponse.includes('Artykuł')) ||
        (aiResponse.match(/\d+\.\d?\s/g)?.length > 2) || // Has numbered sections like 1. or 1.1
        (aiResponse.match(/^\d+\./gm)?.length > 3) || // Multiple lines starting with numbers
        (lowerResponse.includes('parties') && lowerResponse.includes('agreement')) ||
        (lowerResponse.includes('seller') && lowerResponse.includes('buyer')) ||
        (lowerResponse.includes('strony') && lowerResponse.includes('umow')) ||
        (lowerResponse.includes('this contract') || lowerResponse.includes('this agreement')) ||
        (lowerResponse.includes('in witness whereof') || lowerResponse.includes('executed'));
    
    // Detect if AI is refusing to create document (shouldn't show widget in this case)
    const isRefusal = lowerResponse.includes("i'm unable to") || 
                      lowerResponse.includes("i cannot") ||
                      lowerResponse.includes("as a text-based ai") ||
                      lowerResponse.includes("nie mogę");
    
    if (isRefusal) return false;
    
    // Trigger on: new doc request, update request with doc structure, or just doc structure with update keywords
    return (hasDocKeyword && hasDocType) || 
           (hasDocType && hasDocumentStructure) || 
           (hasUpdateKeyword && hasDocumentStructure) ||
           (hasDocumentStructure && aiResponse.length > 500); // Long structured response
}

function extractDocumentTitle(userMessage, aiContent) {
    // Try to extract title from first bold header in content
    const boldMatch = aiContent.match(/\*\*([^*]+)\*\*/);
    if (boldMatch && boldMatch[1].length < 100) {
        return boldMatch[1].trim();
    }
    
    // Try to extract from user message
    const typePatterns = [
        /(?:generate|create|draft|write|prepare|make|wygeneruj|stwórz|napisz)\s+(?:a\s+)?(?:an\s+)?(.+?)(?:\s+for|\s+between|\s+regarding|$)/i
    ];
    
    for (const pattern of typePatterns) {
        const match = userMessage.match(pattern);
        if (match && match[1]) {
            const title = match[1].trim();
            if (title.length > 3 && title.length < 100) {
                return title.charAt(0).toUpperCase() + title.slice(1);
            }
        }
    }
    
    // Default title with timestamp
    const now = new Date();
    return `Generated Document ${now.toLocaleDateString()}`;
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
    // Check if content is in data attribute (for document preview widget)
    let content = btn.dataset.content;
    
    // Otherwise get from formatted text
    if (!content) {
        const messageContent = btn.closest('.message-content');
        const formattedText = messageContent?.querySelector('.formatted-text');
        const previewContent = messageContent?.querySelector('.doc-preview-content');
        content = formattedText?.innerText || previewContent?.innerText || '';
    }
    
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

async function saveAsDocument(messageId, btnElement) {
    // Get content from the message
    const messageContent = btnElement.closest('.message-content');
    const formattedText = messageContent.querySelector('.formatted-text');
    const content = formattedText ? formattedText.innerText : '';
    
    if (!content) {
        showToast('error', 'Error', 'No content to save');
        return;
    }
    
    // Create a modal to save the document
    const title = prompt('Enter document title:');
    if (!title) return;
    
    try {
        const caseId = currentConversationCaseId || document.getElementById('chat-case-selector')?.value;
        const response = await API.generateDocument(content, title, 'docx', caseId);
        
        if (response.document) {
            showToast('success', 'Document Saved', `"${title}" has been saved to your documents`);
            await loadDocuments();
        }
    } catch (error) {
        showToast('error', 'Error', 'Failed to save document: ' + error.message);
    }
}

function loadAISettings() {
    // Load AI settings from localStorage
    const model = localStorage.getItem('ai_model') || 'gpt-4';
    const temperature = localStorage.getItem('ai_temperature') || '70';
    const verbosity = localStorage.getItem('ai_verbosity') || 'normal';
    const customPrompt = localStorage.getItem('ai_custom_prompt') || '';
    
    const modelSelect = document.getElementById('settings-ai-model');
    const tempSlider = document.getElementById('settings-temperature');
    const tempValue = document.getElementById('temperature-value');
    const verbositySelect = document.getElementById('settings-verbosity');
    const promptTextarea = document.getElementById('settings-custom-prompt');
    
    if (modelSelect) modelSelect.value = model;
    if (tempSlider) {
        tempSlider.value = temperature;
        if (tempValue) tempValue.textContent = (temperature / 100).toFixed(1);
    }
    if (verbositySelect) verbositySelect.value = verbosity;
    if (promptTextarea) promptTextarea.value = customPrompt;
}

function saveAISettings() {
    const model = document.getElementById('settings-ai-model')?.value;
    const temperature = document.getElementById('settings-temperature')?.value;
    const verbosity = document.getElementById('settings-verbosity')?.value;
    const customPrompt = document.getElementById('settings-custom-prompt')?.value;
    
    localStorage.setItem('ai_model', model);
    localStorage.setItem('ai_temperature', temperature);
    localStorage.setItem('ai_verbosity', verbosity);
    localStorage.setItem('ai_custom_prompt', customPrompt);
    
    showToast('success', 'Saved', 'AI settings saved successfully');
}

// =================== CASE PANEL ===================

let currentCaseId = null;

async function openCasePanel(caseId) {
    currentCaseId = caseId;
    const panel = document.getElementById('case-details-panel');
    
    try {
        const caseData = await API.getCase(caseId);
        
        document.getElementById('case-panel-title').textContent = caseData.title;
        document.getElementById('case-panel-description').textContent = caseData.description || 'No description';
        document.getElementById('case-panel-priority').textContent = caseData.priority;
        document.getElementById('case-panel-priority').className = `badge badge-${caseData.priority}`;
        document.getElementById('case-panel-status').textContent = caseData.status.replace('_', ' ');
        document.getElementById('case-panel-status').className = `badge badge-${caseData.status}`;
        
        // Store case data for editing
        panel.dataset.caseData = JSON.stringify(caseData);
        
        // Load documents for this case
        await loadCaseDocuments(caseId);
        
        panel.classList.add('active');
    } catch (error) {
        showToast('error', 'Error', 'Failed to load case details');
    }
}

function openEditCaseModal() {
    if (!currentCaseId) return;
    
    const panel = document.getElementById('case-details-panel');
    const caseData = JSON.parse(panel.dataset.caseData || '{}');
    
    currentEditingCaseId = currentCaseId;
    
    document.getElementById('edit-case-title').value = caseData.title || '';
    document.getElementById('edit-case-description').value = caseData.description || '';
    document.getElementById('edit-case-priority').value = caseData.priority || 'medium';
    document.getElementById('edit-case-status').value = caseData.status || 'open';
    
    openModal('edit-case-modal');
}

async function previewDocument(documentId) {
    currentPreviewDocumentId = documentId;
    
    try {
        const preview = await API.getDocumentPreview(documentId);
        
        document.getElementById('preview-doc-title').textContent = preview.title || 'Document';
        
        const meta = document.getElementById('preview-doc-meta');
        meta.innerHTML = `
            <div class="preview-meta-item">
                <span class="meta-label">Created:</span>
                <span class="meta-value">${formatDate(preview.created_at)}</span>
            </div>
            <div class="preview-meta-item">
                <span class="meta-label">Type:</span>
                <span class="meta-value">${preview.is_ai_generated ? 'AI Generated' : preview.file_type || 'Document'}</span>
            </div>
            <div class="preview-meta-item">
                <span class="meta-label">Status:</span>
                <span class="badge badge-${preview.status}">${preview.status}</span>
            </div>
            <div class="preview-meta-item">
                <span class="meta-label">Priority:</span>
                <span class="badge badge-${preview.priority}">${preview.priority}</span>
            </div>
        `;
        
        const content = document.getElementById('preview-doc-content');
        if (preview.content) {
            content.innerHTML = `<div class="preview-text">${formatAIResponse(preview.content)}</div>`;
        } else if (preview.analysis) {
            content.innerHTML = `
                <h4>Analysis</h4>
                <div class="preview-text">${formatAIResponse(preview.analysis)}</div>
            `;
        } else {
            content.innerHTML = '<p class="empty-state">No content available for preview. Download to view the file.</p>';
        }
        
        openModal('preview-document-modal');
    } catch (error) {
        showToast('error', 'Error', 'Failed to load document preview');
    }
}

function closeCasePanel() {
    document.getElementById('case-details-panel').classList.remove('active');
    currentCaseId = null;
}

async function loadCaseDocuments(caseId) {
    try {
        const documents = await API.getDocuments();
        const caseDocuments = documents.results?.filter(doc => doc.case === parseInt(caseId)) || [];
        
        const container = document.getElementById('case-panel-documents');
        
        if (caseDocuments.length === 0) {
            container.innerHTML = '<p class="empty-state"><i class="fas fa-file"></i> No documents</p>';
            return;
        }
        
        container.innerHTML = caseDocuments.map(doc => {
            const fileType = doc.file?.endsWith('.pdf') ? 'pdf' : doc.file?.endsWith('.docx') ? 'docx' : 'ai';
            return `
                <div class="case-doc-item">
                    <div class="case-doc-icon ${fileType}">
                        <i class="fas fa-file-${fileType === 'pdf' ? 'pdf' : fileType === 'docx' ? 'word' : 'alt'}"></i>
                    </div>
                    <div class="case-doc-info">
                        <div class="case-doc-name">${escapeHtml(doc.title)}</div>
                        <div class="case-doc-date">${formatDate(doc.created_at)}</div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading case documents:', error);
    }
}

function uploadToCasePanel() {
    if (!currentCaseId) return;
    
    // Pre-select the case in the upload modal
    document.getElementById('document-case').value = currentCaseId;
    closeCasePanel();
    openModal('upload-modal');
}

async function loadConversations() {
    try {
        const conversations = await API.getConversations();
        const container = document.getElementById('conversations-list');
        
        if (!container) return;
        
        if (!conversations.results || conversations.results.length === 0) {
            container.innerHTML = '<p class="empty-state"><i class="fas fa-comments"></i> No conversations yet</p>';
            return;
        }
        
        container.innerHTML = conversations.results.map(conv => `
            <div class="conversation-item ${conv.id === currentConversationId ? 'active' : ''}" data-id="${conv.id}">
                <div class="conversation-content">
                    <h4>${escapeHtml(conv.title || 'Conversation')}</h4>
                    <p>${formatDate(conv.updated_at)}</p>
                </div>
                <button class="delete-conversation-btn" data-id="${conv.id}" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
        
        // Add click events
        container.querySelectorAll('.conversation-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.delete-conversation-btn')) {
                    loadConversation(item.dataset.id);
                }
            });
        });
        
        // Add delete events
        container.querySelectorAll('.delete-conversation-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm('Delete this conversation?')) {
                    await deleteConversation(btn.dataset.id);
                }
            });
        });
    } catch (error) {
        console.error('Error loading conversations:', error);
    }
}

async function deleteConversation(id) {
    try {
        await API.deleteConversation(id);
        if (currentConversationId === parseInt(id)) {
            currentConversationId = null;
            document.getElementById('chat-messages').innerHTML = `
                <div class="message ai-message animate-fadeIn">
                    <div class="message-wrapper">
                        <div class="message-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="message-content">
                            <strong>GOLEXAI</strong>
                            <p data-i18n="chatbot.welcome">Hello! I'm your AI legal assistant. How can I help you today?</p>
                        </div>
                    </div>
                </div>
            `;
        }
        await loadConversations();
        showToast('success', 'Deleted', 'Conversation deleted successfully');
    } catch (error) {
        showToast('error', 'Error', 'Failed to delete conversation');
    }
}

async function loadCasesForChatSelector() {
    try {
        const cases = await API.getCases();
        const selector = document.getElementById('chat-case-selector');
        if (!selector) return;
        
        selector.innerHTML = '<option value="">No case assigned</option>';
        if (cases.results && cases.results.length > 0) {
            cases.results.forEach(c => {
                selector.innerHTML += `<option value="${c.id}">${escapeHtml(c.title)}</option>`;
            });
        }
    } catch (error) {
        console.error('Error loading cases for selector:', error);
    }
}

async function loadConversation(conversationId) {
    try {
        // Get conversation details
        const conversation = await API.getConversation(conversationId);
        currentConversationId = conversationId;
        currentConversationCaseId = conversation.case;
        
        // Update case selector if present
        const caseSelector = document.getElementById('chat-case-selector');
        if (caseSelector && conversation.case) {
            caseSelector.value = conversation.case;
        }
        
        // Update active state in sidebar
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.toggle('active', item.dataset.id == conversationId);
        });
        
        // Load messages
        const messages = conversation.messages || [];
        const messagesContainer = document.getElementById('chat-messages');
        messagesContainer.innerHTML = '';
        
        messages.forEach(msg => {
            if (msg.role === 'user') {
                messagesContainer.innerHTML += `
                    <div class="message user-message">
                        <div class="message-wrapper">
                            <div class="message-avatar">
                                <i class="fas fa-user"></i>
                            </div>
                            <div class="message-content">
                                <strong>${t('chatbot.you')}</strong>
                                <p>${escapeHtml(msg.content)}</p>
                            </div>
                        </div>
                    </div>
                `;
            } else if (msg.role === 'assistant') {
                const formattedContent = formatAIResponse(msg.content);
                messagesContainer.innerHTML += `
                    <div class="message ai-message">
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
                                    <button class="message-action-btn" onclick="saveAsDocument('${msg.id}', \`${escapeHtml(msg.content)}\`)">
                                        <i class="fas fa-file-alt"></i> Save as Document
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
        });
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } catch (error) {
        console.error('Error loading conversation:', error);
        showToast('error', 'Error', 'Failed to load conversation');
    }
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
