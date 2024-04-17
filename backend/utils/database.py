from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session, DeclarativeBase

import os

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    DATABASE_URL = "postgresql://gabriellb:gabriellb@localhost:5433/confortimetro_klimaa"

engine = create_engine(DATABASE_URL)
session_factory = sessionmaker(autocommit=False, autoflush=False, bind=engine)
#scoped_session_object = scoped_session(session_factory)

class Base(DeclarativeBase):
    pass

def get_database():
    #db = scoped_session_object.merge()
    db = session_factory()
    try:
        yield db
    finally:
        db.close()