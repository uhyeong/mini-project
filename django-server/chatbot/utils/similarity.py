
from django.db import connection
from .vectorizer import OpenAI_vectorizer
from .extract_keyword import get_keyword

# 코사인 유사도 계산을 위한 Raw SQL
def get_high_similarity_quotes(text: str, ids: list, top_k: int=3):
    """
    텍스트와 특정 ID들에 해당하는 명언들 간의 유사도를 계산합니다.
    
    Args:
        text (str): 비교할 입력 텍스트
        ids (list): 비교할 명언들의 ID 리스트
        top_k (int, optional): 반환할 상위 결과 개수. None일 경우 모든 결과 반환
    
    Returns:
        list: 유사도 기준 정렬된 결과 딕셔너리 리스트
    """
    # Get the embedding for the input text
    text_emb = OpenAI_vectorizer(text)
    
    # ID 리스트가 비어있는 경우 빈 결과 반환
    if not ids:
        return []
    
    # ID 리스트를 문자열로 변환하여 SQL IN 절에 사용
    ids_str = ','.join(str(id) for id in ids)
    
    # SQL query to find similar quotes based on embedding similarity (only for specified IDs)
    query = f'''
        WITH cosine_sim AS (
            SELECT 
                id,
                quote,
                author,
                1 - (quote_emb <=> %s) AS similarity
            FROM public."chatbot_philosophydata"
            WHERE id IN ({ids_str})
        )
        SELECT id, quote, author, similarity
        FROM cosine_sim
        ORDER BY similarity DESC
    '''
    
    # top_k가 지정된 경우 LIMIT 추가
    if top_k is not None:
        query += f' LIMIT {top_k}'
    query += ';'
    
    # Execute raw SQL through Django ORM
    with connection.cursor() as cursor:
        text_emb_str = str(text_emb)
        cursor.execute(query, [text_emb_str])
        results = cursor.fetchall()
    
    # Convert results to list of dictionaries
    results = [
        {
            "id": id,
            "quote": quote,
            "author": author,
            "similarity": round(similarity, 2)
        } for id, quote, author, similarity in results
    ]
    
    return results

def get_high_similarity_keywords(text: str, top_k: int):
    # 키워드 추출
    keywords = get_keyword(text)

    # Get the embedding for the input text
    keywords_emb = OpenAI_vectorizer(keywords)
    
    # SQL query to find similar quotes based on embedding similarity
    query = f'''
        WITH cosine_sim AS (
            SELECT 
                id,
                quote,
                author,
                quote_keywords,
                1 - (keywords_emb <=> %s) AS similarity
            FROM public."chatbot_philosophydata"
        )
        SELECT id, quote, author, quote_keywords, similarity
        FROM cosine_sim
        ORDER BY similarity DESC
        LIMIT {top_k};
    '''
    
    # Execute raw SQL through Django ORM
    with connection.cursor() as cursor:
        keywords_emb_str = str(keywords_emb)
        cursor.execute(query, [keywords_emb_str])
        results = cursor.fetchall()
    
    # Convert results to list of dictionaries
    results = [
        {
            "id": id,
            "quote": quote,
            "author": author,
            "quote_keywords": quote_keywords,
            "similarity": round(similarity, 2)
        } for id, quote, author, quote_keywords, similarity in results
    ]
    
    return results
