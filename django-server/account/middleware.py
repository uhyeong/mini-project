from django.utils.deprecation import MiddlewareMixin
from account.utils import validate_access_token, expired_token

class TokenValidationMiddleware(MiddlewareMixin):
  def process_request(self, request):
    token = request.headers.get('Authorization')
    if token and not validate_access_token(token):
      expired_token(request)