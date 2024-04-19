from typing import Annotated
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from fastapi import HTTPException, Depends, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext

from models import User
from utils import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from utils.database import get_database

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain text password against a hashed password.
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """
    Hash a plain text password.
    """
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """
    Create a JWT token.
    """
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt

async def authenticate_user(username: str, password: str, db_session: Annotated[Session, Depends(get_database)]) -> User:
    user = db_session.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username")
    if not verify_password(password, user.password):
        raise HTTPException(status_code=400, detail="Incorrect password")
    return user
    
async def authenticate_active_user(username: str, password: str, db_session: Annotated[Session, Depends(get_database)]) -> User:
    user = await authenticate_user(username, password, db_session)
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user

def get_current_user(token: Annotated[str | None, Depends(oauth2_scheme)], db_session: Annotated[Session, Depends(get_database)]) -> User:
    """
    Get the current user from the JWT token.
    """
    if token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"Authorization": "Bearer"},
        )
    token = token.split(" ")[-1]

    credentials_exception = HTTPException(
        status_code = status.HTTP_401_UNAUTHORIZED,
        detail = "Could not validate credentials",
        headers = {"Authorization": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("username")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db_session.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception

    return user

def is_active(user: User) -> User:
    """
    Check if the user is active.
    """
    if not user.is_active:
        raise HTTPException(status_code=400, detail="User is not active")
    
    return user

def is_admin(user: User) -> User:
    """
    Check if the user is an admin.
    """
    if not user.is_admin:
        raise HTTPException(status_code=400, detail="User is not an admin")
    
    return user

def has_write_access(user: User) -> User:
    """
    Check if the user has write access.
    """
    if not user.can_write:
        raise HTTPException(status_code=400, detail="User does not have write access")
    
    return user