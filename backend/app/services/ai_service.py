import json
import logging
from typing import Optional, Dict, Any

from openai import OpenAI
from anthropic import Anthropic

# System Prompt is aggressive as requested
SYSTEM_PROMPT = """
Você é um assistente de CRM para corretores de seguros. O usuário enviará um texto bruto extraído de uma apólice de seguro (PDF).
Sua missão é extrair as seguintes informações e retornar ESTRITAMENTE um JSON bruto.
Campos obrigatórios:
- name (Nome do segurado/cliente)
- email (E-mail do contato)
- phone (Telefone com DDD)
- value (Valor total do prêmio ou importância segurada principal, numérico float. Se houver vários, priorize o Prêmio Total)
- priority (Sugira uma prioridade 'high', 'medium', 'low' baseada no valor. Acima de 10k é high, acima de 5k medium, abaixo low)

Regras:
1. Retorne APENAS o JSON. Sem blocos de código markdown (```json). Sem explicações antes ou depois.
2. Se não encontrar um campo, retorne null.
3. Se o texto não parecer uma apólice, retorne um JSON com todos os campos null.
"""

def extract_lead_info(
    text: str, 
    provider: str, 
    api_key: str, 
    model: str
) -> Dict[str, Any]:
    """
    Extracts lead info from text using the specified AI provider.
    """
    try:
        if provider == "openai":
            client = OpenAI(api_key=api_key)
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"Texto da apólice:\n---\n{text[:15000]}"} # Limit context to avoid token issues
                ],
                temperature=0.1 # Low temperature for consistent data extraction
            )
            content = response.choices[0].message.content
        
        elif provider == "anthropic":
            client = Anthropic(api_key=api_key)
            response = client.messages.create(
                model=model,
                max_tokens=1024,
                system=SYSTEM_PROMPT,
                messages=[
                    {"role": "user", "content": f"Texto da apólice:\n---\n{text[:15000]}"}
                ],
                temperature=0.1
            )
            content = response.content[0].text
        
        elif provider == "groq":
             # Implementing Groq using OpenAI compatible client if needed, or dedicated.
             # User mentioned Groq in settings earlier, usually uses OpenAI SDK base_url
             client = OpenAI(
                 base_url="https://api.groq.com/openai/v1",
                 api_key=api_key
             )
             response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"Texto da apólice:\n---\n{text[:15000]}"}
                ],
                temperature=0.1
            )
             content = response.choices[0].message.content

        else:
            raise ValueError(f"Provedor IA não suportado: {provider}")

        # Clean up potential markdown formatting if the model disobeys
        cleaned_content = content.replace("```json", "").replace("```", "").strip()
        
        return json.loads(cleaned_content)

    except json.JSONDecodeError:
        logging.error(f"Erro ao decodificar JSON da IA: {content}")
        raise ValueError("A IA retornou um formato inválido. Tente novamente.")
    except Exception as e:
        logging.error(f"Erro na chamada da IA ({provider}): {str(e)}")
        raise ValueError(f"Erro ao processar com IA: {str(e)}")
