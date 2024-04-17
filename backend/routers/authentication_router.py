from typing import Annotated
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from pydantic import BaseModel
from utils.database import get_database

from models import User
from utils.auth import create_access_token, authenticate_active_user, get_password_hash

authentication_router = APIRouter(prefix="/auth")

class LoginRequest(BaseModel):
    email: Annotated[str, Query(max_length=60, regex=r"^[\w\.-]+@[\w\.-]+\.\w+$")]
    password: Annotated[str, Query(min_length=8)]

class RegisterRequest(BaseModel):
    username: Annotated[str, Query(max_length=50)]
    email: Annotated[str, Query(max_length=60, regex=r"^[\w\.-]+@[\w\.-]+\.\w+$")]
    password: Annotated[str, Query(min_length=8)]

@authentication_router.post("/login")
async def login(login_request: LoginRequest, db_session: Annotated[Session, Depends(get_database)]):
    """
    Login existing user and send back a JWK authentication token.
    """
    user = await authenticate_active_user(login_request.email, login_request.password, db_session)
    jwt_token = create_access_token(data={"sub": user.email})

    return Response(headers={"Authorization": f"Bearer {jwt_token}"})    
    
@authentication_router.post("/register")
async def register(register_request: RegisterRequest, db_session: Annotated[Session, Depends(get_database)]):
    """
    Register a new user.
    """
    user = db_session.query(User).filter(User.email == register_request.email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already in use")
    
    # Create the new user
    new_user = User(
        username = register_request.username,
        email = register_request.email,
        password = get_password_hash(register_request.password),
        create_date = datetime.now(),
        is_admin = False,
        is_active = True
    )
    
    db_session.add(new_user)
    db_session.commit()
    
    return Response(status_code=201)

    