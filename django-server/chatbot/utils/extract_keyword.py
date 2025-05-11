from google.generativeai import configure, GenerativeModel
from django.conf import settings

# Gemini API Key를 settings에서 가져옴
GEMINI_API_KEY = settings.GEMINI_API_KEY

def get_keyword(text: str, num_keyword: int = 10):
    # API 키 설정
    configure(api_key=GEMINI_API_KEY)
    
    # Gemini 모델 초기화 (gemini-1.5-pro 또는 gemini-1.0-pro 모델 사용)
    model = GenerativeModel('models/gemini-2.0-flash')
    
    # 프롬프트 구성
    prompt = f"""다음 텍스트에서 키워드를 추출하시오.

추출할 키워드 개수: {num_keyword}

텍스트:
{text}

출력 형식: '키워드1 키워드2 키워드3'

**다음 지침을 반드시 준수하세요**:
1. 모든 키워드는 한국어 또는 영어로 추출
2. 출력 형식의 각 키워드는 띄어쓰기로 구분
"""
    
    # 모델에 프롬프트 전송하고 응답 받기
    response = model.generate_content(prompt)
    
    # 응답에서 키워드 추출
    keywords = response.text.strip()
    
    return keywords