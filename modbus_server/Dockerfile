FROM python:3.10-slim

RUN apt-get update && apt-get install -y libpq-dev gcc

#RUN apt-get install -y cron

WORKDIR /usr/local/src

COPY requirements.txt .

COPY src .

RUN python -m pip install -r requirements.txt

ENTRYPOINT ["python", "main.py"]