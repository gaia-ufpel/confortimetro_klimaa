from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from utils import DATABASE_URL

engine = create_engine(DATABASE_URL)
session_factory = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_database():
    db = session_factory()
    try:
        yield db
    finally:
        db.close()