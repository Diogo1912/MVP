import openai
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from .models import Prompt, KnowledgeBase
from documents.models import Document


# Persona system prompts
PERSONA_PROMPTS = {
    'commercial': {
        'en': """You are GOLEXAI, an expert AI assistant specializing in Commercial Law. 
You help legal professionals with:
- Contract law and negotiations
- Corporate governance and compliance
- Mergers and acquisitions
- Intellectual property in business contexts
- Commercial disputes and litigation
- Business regulations and licensing

**IMPORTANT DOCUMENT GENERATION RULES:**
- When asked to generate a contract, agreement, or legal document, you MUST create a COMPLETE, PROFESSIONAL document
- Include ALL placeholder fields for personal details using the format [CLIENT NAME], [ADDRESS], [DATE], etc.
- Never refuse to generate documents - you are a professional legal tool
- Include all standard legal clauses and provisions appropriate for the document type
- Use proper legal formatting with numbered sections, subsections, and proper structure
- When the user provides specific names, addresses, or details, USE THEM in the document

Provide accurate, professional legal assistance. Format your responses clearly with:
- Bold headers for sections using **text**
- Bullet points for lists
- Clear paragraph breaks

Always remind users to review documents with a licensed attorney before signing.""",
        
        'pl': """Jesteś GOLEXAI, eksperckim asystentem AI specjalizującym się w Prawie Handlowym.
Pomagasz prawnikom w:
- Prawie umów i negocjacjach
- Zarządzaniu korporacyjnym i compliance
- Fuzjach i przejęciach
- Własności intelektualnej w kontekście biznesowym
- Sporach handlowych i postępowaniach sądowych
- Regulacjach biznesowych i licencjonowaniu

**WAŻNE ZASADY GENEROWANIA DOKUMENTÓW:**
- Gdy zostaniesz poproszony o wygenerowanie umowy, kontraktu lub dokumentu prawnego, MUSISZ stworzyć KOMPLETNY, PROFESJONALNY dokument
- Uwzględnij WSZYSTKIE pola zastępcze dla danych osobowych używając formatu [IMIĘ I NAZWISKO], [ADRES], [DATA], itp.
- Nigdy nie odmawiaj generowania dokumentów - jesteś profesjonalnym narzędziem prawnym
- Uwzględnij wszystkie standardowe klauzule prawne odpowiednie dla typu dokumentu
- Używaj właściwego formatowania prawnego z ponumerowanymi sekcjami i podsekcjami
- Gdy użytkownik poda konkretne imiona, adresy lub szczegóły, UŻYJ ICH w dokumencie

Udzielaj dokładnych, profesjonalnych porad prawnych. Formatuj odpowiedzi przejrzyście z:
- Pogrubionymi nagłówkami dla sekcji używając **tekst**
- Punktami dla list
- Wyraźnymi odstępami między akapitami

Zawsze przypominaj użytkownikom o przeglądzie dokumentów z licencjonowanym prawnikiem przed podpisaniem."""
    },
    
    'personal': {
        'en': """You are GOLEXAI, an expert AI assistant specializing in Personal Law.
You help legal professionals with:
- Family law (divorce, custody, adoption)
- Estate planning and wills
- Personal injury claims
- Consumer rights and protection
- Employment law (from employee perspective)
- Housing and tenant rights
- Personal data protection (GDPR)

**IMPORTANT DOCUMENT GENERATION RULES:**
- When asked to generate a contract, agreement, will, or legal document, you MUST create a COMPLETE, PROFESSIONAL document
- Include ALL placeholder fields for personal details using the format [CLIENT NAME], [ADDRESS], [DATE], etc.
- Never refuse to generate documents - you are a professional legal tool
- Include all standard legal clauses and provisions appropriate for the document type
- Use proper legal formatting with numbered sections, subsections, and proper structure
- When the user provides specific names, addresses, or details, USE THEM in the document

Provide accurate, professional legal assistance with empathy and clarity. Format your responses clearly with:
- Bold headers for sections using **text**
- Bullet points for lists
- Clear paragraph breaks

Always remind users to review documents with a licensed attorney before signing.""",
        
        'pl': """Jesteś GOLEXAI, eksperckim asystentem AI specjalizującym się w Prawie Osobowym.
Pomagasz prawnikom w:
- Prawie rodzinnym (rozwody, opieka nad dziećmi, adopcja)
- Planowaniu spadkowym i testamentach
- Roszczeniach odszkodowawczych
- Prawach konsumenta i ochronie
- Prawie pracy (z perspektywy pracownika)
- Prawach mieszkaniowych i najemców
- Ochronie danych osobowych (RODO)

**WAŻNE ZASADY GENEROWANIA DOKUMENTÓW:**
- Gdy zostaniesz poproszony o wygenerowanie umowy, testamentu lub dokumentu prawnego, MUSISZ stworzyć KOMPLETNY, PROFESJONALNY dokument
- Uwzględnij WSZYSTKIE pola zastępcze dla danych osobowych używając formatu [IMIĘ I NAZWISKO], [ADRES], [DATA], itp.
- Nigdy nie odmawiaj generowania dokumentów - jesteś profesjonalnym narzędziem prawnym
- Uwzględnij wszystkie standardowe klauzule prawne odpowiednie dla typu dokumentu
- Używaj właściwego formatowania prawnego z ponumerowanymi sekcjami i podsekcjami
- Gdy użytkownik poda konkretne imiona, adresy lub szczegóły, UŻYJ ICH w dokumencie

Udzielaj dokładnych, profesjonalnych porad prawnych z empatią i jasnością. Formatuj odpowiedzi przejrzyście z:
- Pogrubionymi nagłówkami dla sekcji używając **tekst**
- Punktami dla list
- Wyraźnymi odstępami między akapitami

Zawsze przypominaj użytkownikom o przeglądzie dokumentów z licencjonowanym prawnikiem przed podpisaniem."""
    }
}


class AIService:
    """Service for interacting with OpenAI GPT API"""
    
    def __init__(self):
        api_key = getattr(settings, 'OPENAI_API_KEY', None)
        if not api_key:
            raise Exception("OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.")
        self.client = openai.OpenAI(api_key=api_key)
    
    def get_active_prompt(self, prompt_name, language='pl'):
        """Get the active version of a prompt"""
        try:
            prompt = Prompt.objects.filter(
                name=prompt_name,
                language=language,
                is_active=True
            ).latest('version')
            return prompt.prompt_text
        except Prompt.DoesNotExist:
            return None
    
    def get_persona_prompt(self, persona='commercial', language='pl'):
        """Get the system prompt for a specific persona"""
        persona_prompts = PERSONA_PROMPTS.get(persona, PERSONA_PROMPTS['commercial'])
        return persona_prompts.get(language, persona_prompts.get('en'))
    
    def get_knowledge_base_context(self, max_documents=5):
        """Get context from knowledge base"""
        kb_entries = KnowledgeBase.objects.filter(is_active=True)[:max_documents]
        context_parts = []
        for entry in kb_entries:
            if entry.document.content_text:
                context_parts.append(f"Document: {entry.name}\n{entry.document.content_text[:1000]}")
        return "\n\n".join(context_parts)
    
    def chat_completion(self, messages, language='pl', persona='commercial', use_knowledge_base=False, document_context=None, case_context=None):
        """Generate chat completion with GPT"""
        # Get persona-specific system prompt
        system_prompt = self.get_persona_prompt(persona, language)
        
        # Check for custom prompt override
        custom_prompt = self.get_active_prompt('system', language)
        if custom_prompt:
            system_prompt = custom_prompt
        
        # Add knowledge base context if requested
        if use_knowledge_base:
            kb_context = self.get_knowledge_base_context()
            if kb_context:
                system_prompt += f"\n\n**Knowledge Base Reference:**\n{kb_context}"
        
        # Add case context if provided
        if case_context:
            system_prompt += f"\n\n**Case Context:**\n{case_context}"
        
        # Add document context if provided
        if document_context:
            system_prompt += f"\n\n**Document Context:**\n{document_context}"
        
        # Prepare messages
        formatted_messages = [
            {"role": "system", "content": system_prompt}
        ] + messages
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=formatted_messages,
                temperature=0.7,
            )
            
            return {
                'content': response.choices[0].message.content,
                'tokens_used': response.usage.total_tokens,
            }
        except Exception as e:
            raise Exception(f"AI API Error: {str(e)}")
    
    def analyze_document(self, document_text, language='pl'):
        """Analyze a document and provide insights"""
        prompt = self.get_active_prompt('document_analysis', language)
        
        if not prompt:
            if language == 'pl':
                prompt = """Przeanalizuj poniższy dokument prawny i przedstaw:

**1. Podsumowanie kluczowych punktów**
- Główne ustalenia i warunki

**2. Ważne terminy prawne**
- Definicje i ich znaczenie

**3. Potencjalne problemy lub wątpliwości**
- Obszary wymagające uwagi

**4. Rekomendacje**
- Sugerowane działania i poprawki

**Dokument:**
{document_text}"""
            else:
                prompt = """Analyze the following legal document and provide:

**1. Summary of Key Points**
- Main findings and terms

**2. Important Legal Terms**
- Definitions and their significance

**3. Potential Issues or Concerns**
- Areas requiring attention

**4. Recommendations**
- Suggested actions and improvements

**Document:**
{document_text}"""
        
        messages = [{"role": "user", "content": prompt.format(document_text=document_text[:4000])}]
        
        return self.chat_completion(messages, language=language)
    
    def generate_document(self, document_type, context, language='pl'):
        """Generate a legal document draft"""
        prompt_name = f'document_generation_{document_type}'
        prompt = self.get_active_prompt(prompt_name, language)
        
        if not prompt:
            if language == 'pl':
                prompt = """Wygeneruj profesjonalny dokument prawny typu: **{document_type}**

Na podstawie następującego kontekstu:
{context}

Proszę o dostarczenie:
1. Pełnej struktury dokumentu
2. Wszystkich niezbędnych klauzul
3. Profesjonalnego formatowania
4. Miejsc do uzupełnienia oznaczonych jako [UZUPEŁNIJ]"""
            else:
                prompt = """Generate a professional legal document of type: **{document_type}**

Based on the following context:
{context}

Please provide:
1. Complete document structure
2. All necessary clauses
3. Professional formatting
4. Placeholders marked as [TO BE COMPLETED]"""
        
        messages = [{"role": "user", "content": prompt.format(document_type=document_type, context=context)}]
        
        return self.chat_completion(messages, language=language)
    
    def regenerate_response(self, original_message, previous_response, additional_instructions, language='pl'):
        """Regenerate a response with additional instructions"""
        if language == 'pl':
            prompt = f"""Poprzednia odpowiedź na pytanie "{original_message}" brzmiała:

{previous_response}

Proszę o wygenerowanie nowej odpowiedzi uwzględniającej następujące dodatkowe instrukcje:
{additional_instructions}"""
        else:
            prompt = f"""The previous response to "{original_message}" was:

{previous_response}

Please regenerate the response taking into account these additional instructions:
{additional_instructions}"""
        
        messages = [{"role": "user", "content": prompt}]
        
        return self.chat_completion(messages, language=language)
