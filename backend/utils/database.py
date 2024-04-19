from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from utils import DATABASE_URL

engine = create_engine(DATABASE_URL)
session_factory = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_database():
    db = session_factory()
    try:
        yield db
    finally:
        db.close()