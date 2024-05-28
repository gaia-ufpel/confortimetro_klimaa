import smtplib, ssl
from threading import Lock
from typing import List
from settings import EMAIL_HOST, EMAIL_PORT, EMAIL_HOST_USER, EMAIL_HOST_PASSWORD

class SingletonMeta(type):
    _instances: List = []
    _lock: Lock = Lock()

    def __call__(cls, *args, **kwargs):
        with cls._lock:
            if cls not in cls._instances:
                cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]
    
    def __del__(cls):
        with cls._lock:
            if cls in cls._instances:
                del cls._instances[cls]

class EmailSender(metaclass=SingletonMeta):
    context: ssl.SSLContext = None
    server: smtplib.SMTP_SSL = None

    def __init__(self):
        self.context = ssl.create_default_context()
        self.server = smtplib.SMTP_SSL(EMAIL_HOST, EMAIL_PORT, context=self.context)
        self.server.login(EMAIL_HOST_USER, EMAIL_HOST_PASSWORD)

    def send_email(self, receiver_email, subject, message):
        self.server.sendmail(EMAIL_HOST_USER, receiver_email, f"Subject: {subject}\n\n{message}")

    def send_confirmation_email(self, receiver_email, token):
        subject = "Confirmação de Email"
        message = f"Confirme seu email clicando no link: https://localhost:8000/auth/confirm-email?token={token}"
        self.send_email(receiver_email, subject, message)

    def __del__(self):
        self.server.quit()
        super().__del__()