from rest_framework.response import Response
from .token import decode_access_token, decode_refresh_token, create_access_token, create_refresh_token

def validate_access_token(request):
    try:
        access_token = request.COOKIES.get('access_token')
        if not access_token:
            return False
            
        payload = decode_access_token(access_token)
        return True
    except:
        return False

# access token 만료 시
def expired_token(request):
  # access token 만료 확인
  access_token = request.COOKIES.get('access_token')
  if access_token:
    # True일 경우 refresh token 제거
    response = Response()
    response.set_cookie(key='access_token', value='',httponly=True)
    response.set_cookie(key='refresh_token', value='', httponly=True)
    return response
  else:
    return None

# refresh token이 유효할 경우우 새로운 access token 발급 함수
def refresh_access_token(request):
  if request.method == 'POST':
    # refresh token 유효 확인
    refresh_token = request.COOKIES.get('refresh_token')
    if refresh_token:
    # True일 경우 새로운 access token 발급
      access_token = create_access_token(request.user.id)
      response = Response()
      response.set_cookie(key='access_token', value=access_token, httponly=True)
      return response
    else:
      return None