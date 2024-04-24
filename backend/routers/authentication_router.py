from typing import Annotated
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, Response, Header, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from utils.database import get_database

from models import User
from utils.auth import create_access_token, authenticate_active_user, get_current_user, is_active, is_admin, get_password_hash, oauth2_scheme

authentication_router = APIRouter(prefix="/auth")

class LoginRequest(BaseModel):
    email: Annotated[str, Query(max_length=60, regex=r"^[\w\.-]+@[\w\.-]+\.\w+$")]
    password: Annotated[str, Query(min_length=8)]

class RegisterRequest(BaseModel):
    username: Annotated[str, Query(max_length=50)]
    email: Annotated[str, Query(max_length=60, regex=r"^[\w\.-]+@[\w\.-]+\.\w+$")]
    password: Annotated[str, Query(min_length=8)]
    is_admin: Annotated[bool, Query(default=False)]
    is_active: Annotated[bool, Query(default=False)]
    has_write_access: Annotated[bool, Query(default=False)]

@authentication_router.post("/login")
async def login(login_request: LoginRequest, db_session: Annotated[Session, Depends(get_database)]):
    """
    Login existing user and send back a JWK authentication token.
    """
    user = await authenticate_active_user(login_request.email, login_request.password, db_session)
    jwt_token = create_access_token(
        {
            "username": user.username
        }
    )

    return Response(headers={"Authorization": f"Bearer {jwt_token}"})    
    
@authentication_router.post("/register")
async def register(token: Annotated[str, oauth2_scheme],
                   register_request: RegisterRequest, 
                   db_session: Annotated[Session, Depends(get_database)]):
    """
    Register a new user.
    """
    _ = is_admin(is_active(get_current_user(token, db_session)))

    user = db_session.query(User).filter(User.username == register_request.username).first()
    if user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already in use")
    
    # Create the new user
    new_user = User(
        username = register_request.username,
        email = register_request.email,
        password = get_password_hash(register_request.password),
        create_date = datetime.now(),
        is_admin = register_request.is_admin,
        is_active = register_request.is_active,
        has_write_access = register_request.has_write_access or register_request.is_admin
    )
    
    db_session.add(new_user)
    db_session.commit()
    
    return Response(status_code=status.HTTP_200_OK)

    