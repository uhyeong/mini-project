FROM python:3.13-slim

RUN apt update && apt install -y curl nginx

COPY ./django-server /app
COPY ./requirements.txt /app/requirements.txt
COPY ./run.sh /app/run.sh

COPY ./nginx-server/default.conf /etc/nginx/conf.d/default.conf

WORKDIR /app

RUN pip install -r requirements.txt

RUN chmod +x run.sh
CMD ["./run.sh"]