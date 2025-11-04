#!/usr/bin/env python
"""
Script to create test data for development
Run with: python manage.py shell < create_test_data.py
Or: python manage.py shell
>>> exec(open('create_test_data.py').read())
"""

from accounts.models import User
from cases.models import Case
from documents.models import Document
from ai_agent.models import Prompt, Conversation
from django.utils import timezone

# Create test users
if not User.objects.filter(email='admin@golexai.pl').exists():
    admin = User.objects.create_user(
        email='admin@golexai.pl',
        username='admin',
        password='admin123',
        role='admin',
        language='pl'
    )
    print(f"Created admin user: {admin.email}")

if not User.objects.filter(email='lawyer@golexai.pl').exists():
    lawyer = User.objects.create_user(
        email='lawyer@golexai.pl',
        username='lawyer',
        password='lawyer123',
        role='lawyer',
        language='pl'
    )
    print(f"Created lawyer user: {lawyer.email}")
else:
    lawyer = User.objects.get(email='lawyer@golexai.pl')

# Create test cases
if not Case.objects.exists():
    case1 = Case.objects.create(
        title='Sprawa o odszkodowanie',
        description='Sprawa dotycząca odszkodowania za wypadek komunikacyjny',
        priority='high',
        status='open',
        lawyer=lawyer
    )
    print(f"Created case: {case1.title}")

# Create test prompts
prompts_to_create = [
    {
        'name': 'system',
        'language': 'pl',
        'description': 'System prompt for AI assistant',
        'prompt_text': 'Jesteś pomocnym asystentem AI dla prawników. Dostarczaj dokładnej, profesjonalnej pomocy prawnej.',
        'version': 1,
        'is_active': True
    },
    {
        'name': 'document_analysis',
        'language': 'pl',
        'description': 'Prompt for document analysis',
        'prompt_text': 'Przeanalizuj następujący dokument prawny i podaj:\n1. Podsumowanie kluczowych punktów\n2. Ważne terminy prawne\n3. Potencjalne problemy lub obawy\n4. Rekomendacje\n\nDokument:\n{document_text}',
        'version': 1,
        'is_active': True
    },
    {
        'name': 'system',
        'language': 'en',
        'description': 'System prompt for AI assistant',
        'prompt_text': 'You are a helpful AI assistant for legal professionals. Provide accurate, professional legal assistance.',
        'version': 1,
        'is_active': True
    },
    {
        'name': 'document_analysis',
        'language': 'en',
        'description': 'Prompt for document analysis',
        'prompt_text': 'Analyze the following legal document and provide:\n1. Summary of key points\n2. Important legal terms\n3. Potential issues or concerns\n4. Recommendations\n\nDocument:\n{document_text}',
        'version': 1,
        'is_active': True
    },
]

for prompt_data in prompts_to_create:
    if not Prompt.objects.filter(name=prompt_data['name'], language=prompt_data['language'], version=prompt_data['version']).exists():
        Prompt.objects.create(**prompt_data)
        print(f"Created prompt: {prompt_data['name']} ({prompt_data['language']})")
    else:
        print(f"Prompt already exists: {prompt_data['name']} ({prompt_data['language']})")

print("\nTest data created successfully!")
print("\nTest users:")
print("Admin: admin@golexai.pl / admin123")
print("Lawyer: lawyer@golexai.pl / lawyer123")

