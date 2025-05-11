import jwt 
import datetime 
import enum 

from rest_framework.exceptions import AuthenticationFailed

class JWT_KEY(enum.Enum):
    RANDOM_OF_ACCESS_KEY = (enum.auto(), 'access_secret', datetime.timedelta(seconds=120), 'HS256', '랜덤한 조합의 키')
    RANDOM_OF_REFRESH_KEY = (enum.auto(), 'refresh_secret', datetime.timedelta(days=2), 'HS256', '랜덤한 조합의 키')


def __create_token(id:int, key:JWT_KEY) -> str:
    payload = {
        'user_id':id,
        'exp': datetime.datetime.now(tz=datetime.timezone.utc) + key.value[2],
        'iat': datetime.datetime.now(tz=datetime.timezone.utc)
    }
    random_key = key.value[1]
    alg = key.value[3]
    
    return jwt.encode(
        payload, random_key, algorithm=alg
    )

def create_access_token(id):
    return __create_token(id, JWT_KEY.RANDOM_OF_ACCESS_KEY)

def create_refresh_token(id):
    return __create_token(id, JWT_KEY.RANDOM_OF_REFRESH_KEY)

def __decode_token(token, key):
    try:
        alg = key.value[3]
        print('alg: ', alg)
        random_key = key.value[1]
        print('random_key: ', random_key)
        payload = jwt.decode(token, random_key, algorithms=alg)
        print('payload: ', payload)
        return payload['user_id']
    except Exception as e:
        raise AuthenticationFailed(e)

def decode_access_token(token):
    return __decode_token(token, JWT_KEY.RANDOM_OF_ACCESS_KEY)

def decode_refresh_token(token):
    return __decode_token(token, JWT_KEY.RANDOM_OF_REFRESH_KEY)

