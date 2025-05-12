from django.shortcuts import render
from .models import Message, Session, PhilosophyData
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from .utils.extract_keyword import get_keyword
from .utils.vectorizer import OpenAI_vectorizer
from .utils.llm import chat_with_philosophy
from account.models import CustomUser
# Create your views here.
from account.token import decode_access_token
# 예시 API에요!
# @api_view(['GET'])
# def show_all_messages(request):
#     messages = Message.objects.all()    # 모든 메시지를 가져옵니다.
#     return render(request, 'chatbot/chatbot.html', context={'messages': messages})
def chatbot_page(request):
    access_token = request.COOKIES.get('access_token')
    is_authenticated = access_token is not None
    username = None
    if access_token:
        try:
            user_id = decode_access_token(access_token)  # 여기서 SignatureExpired 발생 가능
            user = CustomUser.objects.filter(id=user_id).first()
            if user:
                is_authenticated = True
                username = user.username
        except Exception as e:
            print(f"Token decode error: {e}")
            # 만료되었거나 유효하지 않은 토큰 → 무효처리
            response = render(request, 'chatbot/chatbot2.html', {
                'is_authenticated': False,
                'username': None,
            })
            response.delete_cookie('access_token')  # 토큰 삭제
            return response
    return render(request, 'chatbot/chatbot2.html', {'is_authenticated': is_authenticated,'username': username,})

@api_view(['POST'])
def chat_api(request):
    message = request.data.get('message')
    session_id = request.data.get('session_id')

    if session_id:
        session = Session.objects.get(id=session_id)
        Message.objects.create(text=message, sender='user', session_id=session)

    # 여기서 실제 OpenAI 처리
    response = chat_with_philosophy(message)
    #response = message

    if session_id:
        Message.objects.create(text=response, sender='bot', session_id=session)

    return Response({"response": response})
@api_view(['GET'])
def list_sessions(request):
    token = request.COOKIES.get('access_token')
    user = None
    
    if token:
        user_id = decode_access_token(token)
        user = CustomUser.objects.filter(id=user_id).first()
    if not user:
        return Response({'error': 'Unauthorized'}, status=401)
    sessions = Session.objects.filter(user_id=user).order_by('-created_at')
    data = [
        {
            'id': session.id,
            'title': session.title,
            'created_at': session.created_at,
        }
        for session in sessions
    ]
    return Response(data)

@api_view(['POST'])
def create_session(request):
    token = request.COOKIES.get('access_token')
    title = request.data.get('title')
    if not title:
        title = f"New session {timezone.now().strftime('%Y-%m-%d %H:%M')}"
    if token:
        user_id = decode_access_token(token)
        user = CustomUser.objects.filter(id=user_id).first()
    session = Session.objects.create(title=title,user_id=user)
    
    return Response({
        'id': session.id,
        'title': session.title,
        'created_at': session.created_at,
    })


@api_view(['GET'])
def get_messages_by_session(request, session_id):
    messages = Message.objects.filter(session_id=session_id).order_by('created_at')
    data = [
        {
            'id': m.id,
            'sender': m.sender,
            'text': m.text,
            'created_at': m.created_at,
        }
        for m in messages
    ]
    return Response(data)

@api_view(['POST'])
def delete_session(request, session_id):
    try:
        session = Session.objects.get(id=session_id)
        session.delete()
        return Response({'success': True})
    except Session.DoesNotExist:
        return Response({'error': 'Session not found'}, status=404)


@api_view(['POST'])
def add_philosophy_data(request):
    author = request.data.get('author')
    quote = request.data.get('quote')
    quote_keywords = get_keyword(quote)
    quote_emb = OpenAI_vectorizer(quote)
    keywords_emb = OpenAI_vectorizer(quote_keywords)
    new_data = PhilosophyData.objects.create(
        author=author,
        quote=quote,
        quote_keywords=quote_keywords,
        quote_emb=quote_emb,
        keywords_emb=keywords_emb,
    )
    return Response({'success': True, 'quote': new_data.quote})
