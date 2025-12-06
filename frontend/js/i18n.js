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
            google: "Sign in with Google",
            email: "Email",
            password: "Password",
            signin: "Sign In"
        },
        overview: {
            title: "Overview",
            total_documents: "Total Documents",
            active_cases: "Active Cases",
            ai_queries: "AI Queries",
            monthly_productivity: "Monthly Productivity",
            quick_upload: "Quick Upload"
        },
        chatbot: {
            title: "AI Chatbot",
            input_placeholder: "Type your message...",
            send: "Send",
            persona: "AI Persona",
            commercial_law: "Commercial Law",
            personal_law: "Personal Law",
            new_chat: "New Chat",
            attach: "Attach Document",
            welcome: "Hello! I'm your AI legal assistant. How can I help you today? I can analyze documents, draft legal texts, answer questions about commercial or personal law, and much more.",
            you: "You",
            typing: "GOLEXAI is typing...",
            regenerate: "Regenerate",
            copy: "Copy",
            download: "Download as Document"
        },
        documents: {
            title: "Documents & Cases",
            upload: "Upload Document",
            create_case: "Create Case",
            upload_title: "Upload Document",
            create_case_title: "Create New Case",
            edit_title: "Edit Document",
            document_name: "Document Name",
            file: "File",
            priority: "Priority",
            status: "Status",
            tags: "Tags",
            assign_case: "Assign to Case",
            filter_all: "All",
            filter_ai: "AI Generated",
            all_priorities: "All Priorities",
            all_statuses: "All Statuses",
            urgent: "Urgent",
            medium: "Medium",
            low: "Low",
            started: "Started",
            in_progress: "In Progress",
            done: "Done",
            search: "Search documents...",
            no_documents: "No documents found",
            analyze: "Analyze",
            download: "Download",
            edit: "Edit",
            delete: "Delete",
            expand: "Show Details",
            collapse: "Hide Details",
            created: "Created",
            modified: "Modified",
            size: "Size",
            type: "Type",
            case: "Case",
            analysis_result: "Analysis Result"
        },
        cases: {
            title: "Case Title",
            description: "Description"
        },
        analytics: {
            title: "Analytics",
            loading: "Loading analytics...",
            export: "Export Report",
            document_activity: "Document Activity",
            ai_usage: "AI Usage",
            case_progress: "Case Progress",
            time_saved: "Time Saved"
        },
        settings: {
            title: "Settings",
            profile: "Profile",
            preferences: "Preferences",
            gdpr: "GDPR & Privacy",
            notifications: "Notifications",
            profile_title: "Profile Settings",
            profile_desc: "Manage your account information and preferences",
            preferences_title: "Preferences",
            preferences_desc: "Customize your experience",
            gdpr_title: "GDPR & Data Management",
            gdpr_desc: "Manage your data and privacy settings",
            notifications_title: "Notifications",
            notifications_desc: "Manage how you receive notifications",
            account: "Account Actions",
            change_password: "Change Password",
            change_password_desc: "Update your account password",
            change: "Change",
            logout: "Logout",
            logout_desc: "Sign out of your account",
            language: "Language",
            interface_language: "Interface Language",
            interface_language_desc: "Choose your preferred language",
            ai_settings: "AI Settings",
            default_persona: "Default AI Persona",
            default_persona_desc: "Choose which legal specialty to use by default",
            data_export: "Data Export",
            export_data: "Export My Data",
            export_data_desc: "Download all your data in JSON format",
            export: "Export",
            data_deletion: "Data Deletion",
            delete_data: "Delete My Data",
            delete_data_desc: "Permanently delete all your data. This action cannot be undone.",
            delete: "Delete",
            email_notifications: "Email Notifications",
            email_notifications_desc: "Receive important updates via email",
            document_notifications: "Document Updates",
            document_notifications_desc: "Get notified when documents are processed",
            confirm_export: "Export all your data?",
            export_success: "Data exported successfully!",
            export_error: "Export failed",
            delete_confirmation: "Type 'DELETE_ALL_MY_DATA' to confirm deletion:",
            delete_success: "All your data has been deleted",
            delete_error: "Deletion failed",
            delete_wrong_confirmation: "Wrong confirmation. Deletion cancelled."
        },
        common: {
            cancel: "Cancel",
            save: "Save",
            confirm: "Confirm",
            loading: "Loading...",
            error: "Error",
            success: "Success"
        },
        toast: {
            document_uploaded: "Document uploaded successfully",
            document_analyzed: "Document analyzed successfully",
            document_deleted: "Document deleted",
            case_created: "Case created successfully",
            settings_saved: "Settings saved",
            error_occurred: "An error occurred"
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
            google: "Zaloguj się przez Google",
            email: "Email",
            password: "Hasło",
            signin: "Zaloguj się"
        },
        overview: {
            title: "Przegląd",
            total_documents: "Wszystkie dokumenty",
            active_cases: "Aktywne sprawy",
            ai_queries: "Zapytania AI",
            monthly_productivity: "Produktywność miesięczna",
            quick_upload: "Szybkie przesyłanie"
        },
        chatbot: {
            title: "Chatbot AI",
            input_placeholder: "Wpisz wiadomość...",
            send: "Wyślij",
            persona: "Persona AI",
            commercial_law: "Prawo handlowe",
            personal_law: "Prawo osobowe",
            new_chat: "Nowy czat",
            attach: "Dołącz dokument",
            welcome: "Cześć! Jestem Twoim asystentem prawnym AI. Jak mogę Ci dzisiaj pomóc? Mogę analizować dokumenty, przygotowywać teksty prawne, odpowiadać na pytania dotyczące prawa handlowego lub osobowego i wiele więcej.",
            you: "Ty",
            typing: "GOLEXAI pisze...",
            regenerate: "Wygeneruj ponownie",
            copy: "Kopiuj",
            download: "Pobierz jako dokument"
        },
        documents: {
            title: "Dokumenty i sprawy",
            upload: "Prześlij dokument",
            create_case: "Utwórz sprawę",
            upload_title: "Prześlij dokument",
            create_case_title: "Utwórz nową sprawę",
            edit_title: "Edytuj dokument",
            document_name: "Nazwa dokumentu",
            file: "Plik",
            priority: "Priorytet",
            status: "Status",
            tags: "Tagi",
            assign_case: "Przypisz do sprawy",
            filter_all: "Wszystkie",
            filter_ai: "Wygenerowane przez AI",
            all_priorities: "Wszystkie priorytety",
            all_statuses: "Wszystkie statusy",
            urgent: "Pilne",
            medium: "Średnie",
            low: "Niskie",
            started: "Rozpoczęte",
            in_progress: "W trakcie",
            done: "Zakończone",
            search: "Szukaj dokumentów...",
            no_documents: "Nie znaleziono dokumentów",
            analyze: "Analizuj",
            download: "Pobierz",
            edit: "Edytuj",
            delete: "Usuń",
            expand: "Pokaż szczegóły",
            collapse: "Ukryj szczegóły",
            created: "Utworzono",
            modified: "Zmodyfikowano",
            size: "Rozmiar",
            type: "Typ",
            case: "Sprawa",
            analysis_result: "Wynik analizy"
        },
        cases: {
            title: "Tytuł sprawy",
            description: "Opis"
        },
        analytics: {
            title: "Analityka",
            loading: "Ładowanie analityki...",
            export: "Eksportuj raport",
            document_activity: "Aktywność dokumentów",
            ai_usage: "Użycie AI",
            case_progress: "Postęp spraw",
            time_saved: "Zaoszczędzony czas"
        },
        settings: {
            title: "Ustawienia",
            profile: "Profil",
            preferences: "Preferencje",
            gdpr: "RODO i prywatność",
            notifications: "Powiadomienia",
            profile_title: "Ustawienia profilu",
            profile_desc: "Zarządzaj informacjami o koncie i preferencjami",
            preferences_title: "Preferencje",
            preferences_desc: "Dostosuj swoje doświadczenie",
            gdpr_title: "RODO i zarządzanie danymi",
            gdpr_desc: "Zarządzaj swoimi danymi i ustawieniami prywatności",
            notifications_title: "Powiadomienia",
            notifications_desc: "Zarządzaj sposobem otrzymywania powiadomień",
            account: "Akcje konta",
            change_password: "Zmień hasło",
            change_password_desc: "Zaktualizuj hasło do konta",
            change: "Zmień",
            logout: "Wyloguj",
            logout_desc: "Wyloguj się z konta",
            language: "Język",
            interface_language: "Język interfejsu",
            interface_language_desc: "Wybierz preferowany język",
            ai_settings: "Ustawienia AI",
            default_persona: "Domyślna persona AI",
            default_persona_desc: "Wybierz domyślną specjalizację prawną",
            data_export: "Eksport danych",
            export_data: "Eksportuj moje dane",
            export_data_desc: "Pobierz wszystkie dane w formacie JSON",
            export: "Eksportuj",
            data_deletion: "Usuwanie danych",
            delete_data: "Usuń moje dane",
            delete_data_desc: "Trwale usuń wszystkie swoje dane. Tej akcji nie można cofnąć.",
            delete: "Usuń",
            email_notifications: "Powiadomienia e-mail",
            email_notifications_desc: "Otrzymuj ważne aktualizacje przez e-mail",
            document_notifications: "Aktualizacje dokumentów",
            document_notifications_desc: "Otrzymuj powiadomienia o przetworzonych dokumentach",
            confirm_export: "Eksportować wszystkie dane?",
            export_success: "Dane wyeksportowane pomyślnie!",
            export_error: "Eksport nie powiódł się",
            delete_confirmation: "Wpisz 'DELETE_ALL_MY_DATA' aby potwierdzić usunięcie:",
            delete_success: "Wszystkie dane zostały usunięte",
            delete_error: "Usuwanie nie powiodło się",
            delete_wrong_confirmation: "Błędne potwierdzenie. Usuwanie anulowane."
        },
        common: {
            cancel: "Anuluj",
            save: "Zapisz",
            confirm: "Potwierdź",
            loading: "Ładowanie...",
            error: "Błąd",
            success: "Sukces"
        },
        toast: {
            document_uploaded: "Dokument przesłany pomyślnie",
            document_analyzed: "Dokument przeanalizowany pomyślnie",
            document_deleted: "Dokument usunięty",
            case_created: "Sprawa utworzona pomyślnie",
            settings_saved: "Ustawienia zapisane",
            error_occurred: "Wystąpił błąd"
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
        if (select.id === 'language-selector' || select.id === 'settings-language') {
            select.value = currentLanguage;
        }
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    
    // Language selector change
    document.querySelectorAll('.language-selector').forEach(select => {
        if (select.id === 'language-selector' || select.id === 'settings-language') {
            select.addEventListener('change', (e) => {
                setLanguage(e.target.value);
            });
        }
    });
});
