// Internationalization support for English and Polish
const translations = {
    en: {
        nav: {
            overview: "Overview",
            chatbot: "AI Chatbot",
            documents: "Documents",
            analytics: "Analytics",
            settings: "Settings",
            logout: "Logout"
        },
        login: {
            title: "Welcome to GOLEXAI",
            subtitle: "AI-powered legal tech platform",
            google: "Sign in with Google"
        },
        overview: {
            title: "Overview",
            total_documents: "Total Documents",
            active_cases: "Active Cases",
            ai_queries: "AI Queries",
            monthly_productivity: "Monthly Productivity"
        },
        chatbot: {
            title: "AI Chatbot",
            input_placeholder: "Type your message...",
            send: "Send"
        },
        documents: {
            title: "Documents & Cases",
            upload: "Upload Document",
            create_case: "Create Case"
        },
        analytics: {
            title: "Analytics",
            loading: "Loading analytics..."
        },
        settings: {
            title: "Settings",
            gdpr: "GDPR & Data Management",
            export_data: "Export My Data",
            delete_data: "Delete My Data",
            language: "Language",
            confirm_export: "Export all your data?",
            export_success: "Data exported successfully!",
            export_error: "Export failed",
            delete_confirmation: "Type 'DELETE_ALL_MY_DATA' to confirm deletion:",
            delete_success: "All your data has been deleted",
            delete_error: "Deletion failed",
            delete_wrong_confirmation: "Wrong confirmation. Deletion cancelled."
        }
    },
    pl: {
        nav: {
            overview: "Przegląd",
            chatbot: "Chatbot AI",
            documents: "Dokumenty",
            analytics: "Analityka",
            settings: "Ustawienia",
            logout: "Wyloguj"
        },
        login: {
            title: "Witaj w GOLEXAI",
            subtitle: "Platforma prawnicza oparta na AI",
            google: "Zaloguj się przez Google"
        },
        overview: {
            title: "Przegląd",
            total_documents: "Wszystkie dokumenty",
            active_cases: "Aktywne sprawy",
            ai_queries: "Zapytania AI",
            monthly_productivity: "Produktywność miesięczna"
        },
        chatbot: {
            title: "Chatbot AI",
            input_placeholder: "Wpisz wiadomość...",
            send: "Wyślij"
        },
        documents: {
            title: "Dokumenty i sprawy",
            upload: "Prześlij dokument",
            create_case: "Utwórz sprawę"
        },
        analytics: {
            title: "Analityka",
            loading: "Ładowanie analityki..."
        },
        settings: {
            title: "Ustawienia",
            gdpr: "RODO i zarządzanie danymi",
            export_data: "Eksportuj moje dane",
            delete_data: "Usuń moje dane",
            language: "Język",
            confirm_export: "Eksportować wszystkie dane?",
            export_success: "Dane wyeksportowane pomyślnie!",
            export_error: "Eksport nie powiódł się",
            delete_confirmation: "Wpisz 'DELETE_ALL_MY_DATA' aby potwierdzić usunięcie:",
            delete_success: "Wszystkie dane zostały usunięte",
            delete_error: "Usuwanie nie powiodło się",
            delete_wrong_confirmation: "Błędne potwierdzenie. Usuwanie anulowane."
        }
    }
};

let currentLanguage = localStorage.getItem('language') || 'pl';

function t(key) {
    const keys = key.split('.');
    let value = translations[currentLanguage];
    for (const k of keys) {
        value = value?.[k];
    }
    return value || key;
}

function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    updateUI();
}

function updateUI() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
    
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });
    
    // Update language selector
    document.querySelectorAll('.language-selector').forEach(select => {
        select.value = currentLanguage;
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    
    // Language selector change
    document.querySelectorAll('.language-selector').forEach(select => {
        select.addEventListener('change', (e) => {
            setLanguage(e.target.value);
        });
    });
});

