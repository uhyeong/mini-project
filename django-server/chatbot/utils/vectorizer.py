import os
from openai import OpenAI
from django.conf import settings

# OpenAI API Key를 settings에서 가져옴
OPENAI_API_KEY = settings.OPENAI_API_KEY

def OpenAI_vectorizer(text:str):
    client = OpenAI(api_key=OPENAI_API_KEY)

    response = client.embeddings.create(
        input=text,
        model="text-embedding-3-small"
    )
    emb = response.data[0].embedding

    return emb