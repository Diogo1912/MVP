import openai
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from .models import Prompt, KnowledgeBase
from documents.models import Document


class AIService:
    """Service for interacting with OpenAI GPT API"""
    
    def __init__(self):
        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
    
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
    
    def get_knowledge_base_context(self, max_documents=5):
        """Get context from knowledge base"""
        kb_entries = KnowledgeBase.objects.filter(is_active=True)[:max_documents]
        context_parts = []
        for entry in kb_entries:
            if entry.document.content_text:
                context_parts.append(f"Document: {entry.name}\n{entry.document.content_text[:1000]}")
        return "\n\n".join(context_parts)
    
    def chat_completion(self, messages, language='pl', use_knowledge_base=False, document_context=None):
        """Generate chat completion with GPT"""
        system_prompt = self.get_active_prompt('system', language) or _(
            "You are a helpful AI assistant for legal professionals. "
            "Provide accurate, professional legal assistance."
        )
        
        # Add knowledge base context if requested
        if use_knowledge_base:
            kb_context = self.get_knowledge_base_context()
            if kb_context:
                system_prompt += f"\n\nKnowledge Base:\n{kb_context}"
        
        # Add document context if provided
        if document_context:
            system_prompt += f"\n\nDocument Context:\n{document_context}"
        
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
        prompt = self.get_active_prompt('document_analysis', language) or _(
            "Analyze the following legal document and provide: "
            "1. Summary of key points\n"
            "2. Important legal terms\n"
            "3. Potential issues or concerns\n"
            "4. Recommendations\n\n"
            "Document:\n{document_text}"
        )
        
        messages = [{"role": "user", "content": prompt.format(document_text=document_text[:4000])}]
        
        return self.chat_completion(messages, language=language)
    
    def generate_document(self, document_type, context, language='pl'):
        """Generate a legal document draft"""
        prompt_name = f'document_generation_{document_type}'
        prompt = self.get_active_prompt(prompt_name, language) or _(
            "Generate a legal {document_type} based on the following context:\n\n{context}\n\n"
            "Please provide a professional, well-structured draft."
        )
        
        messages = [{"role": "user", "content": prompt.format(document_type=document_type, context=context)}]
        
        return self.chat_completion(messages, language=language)

