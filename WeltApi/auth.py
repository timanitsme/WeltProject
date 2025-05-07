import os
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy import select
from starlette import status
from uuid import UUID, uuid4

from database import db_dependency
from models import User, Role
from settings import JWT_SECRET_KEY, ALGORITHM
from utils import verify_password, create_refresh_token, create_access_token

router = APIRouter(
    prefix='/auth',
    tags=['auth']
)

bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
oauth2_bearer = OAuth2PasswordBearer(tokenUrl='auth/token')

class CreateUserRequest(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str
    role_id: UUID

class SignUpUserRequest(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class CurrentUser(BaseModel):
    id: UUID
    email: str
    first_name: str
    last_name: str
    role_id: UUID
    role: str
    avatar: Optional[str] = None

@router.post('/signup', summary="Создание нового пользователя")
async def create_user(db: db_dependency, first_name: str = Form(...), last_name: str = Form(...), email: str = Form(...), password: str = Form(...), role_id: UUID = Form(...),  avatar: Optional[UploadFile] = File(None)):
    query = select(User).where(User.email == email)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    if user is not None:
            raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с указанным email уже есть в базе данных"
        )

    avatar_path = None
    if avatar:
        file_extension = avatar.filename.split(".")[-1]
        file_name = f"{uuid4()}.{file_extension}"
        avatar_path = f"static/avatars/{file_name}"

        os.makedirs("static/avatars", exist_ok=True)
        with open(avatar_path, "wb") as f:
            content = await avatar.read()
            f.write(content)

    user = User(
        first_name=first_name,
        last_name=last_name,
        email=email,
        password=bcrypt_context.hash(password),
        role_id=role_id,
        avatar = avatar_path
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)


@router.post('/login', summary="Авторизация пользователя", response_model=Token)
async def login(db: db_dependency, form_data: OAuth2PasswordRequestForm = Depends()):
    query = select(User).where(User.email == form_data.username)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Некорректный email или пароль"
        )

    hashed_pass = user.password
    if not verify_password(form_data.password, hashed_pass):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Некорректный email или пароль"
        )

    return {
        "access_token": create_access_token(user.email),
        "refresh_token": create_refresh_token(user.email),
        "token_type": "bearer",
    }

class RefreshTokenRequest(BaseModel):
    refresh_token: str


@router.post('/refresh', summary="Обновление токена", response_model=Token)
async def refresh_token(data: RefreshTokenRequest, db: db_dependency):
    try:
        payload = jwt.decode(data.refresh_token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Неверный refresh token",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    query = select(User).where(User.email == email)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пользователь не найден",
            headers={"WWW-Authenticate": "Bearer"},
        )

    new_access_token = create_access_token(user.email)
    return {
        "access_token": new_access_token,
        "refresh_token": data.refresh_token,
        "token_type": "bearer",
    }


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

async def get_current_user(db: db_dependency, token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Неверный токен",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный токен",
            headers={"WWW-Authenticate": "Bearer"},
        )

    query = select(User.id, User.email, User.first_name, User.last_name, User.role_id, Role.title.label("role"), User.avatar) \
        .join(Role, User.role_id == Role.id) \
        .where(User.email == email)

    result = await db.execute(query)
    user = result.fetchone()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пользователь не найден",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return CurrentUser(**user._asdict())

def get_current_user_with_roles(allowed_roles: list):
    async def dependency(current_user: dict = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"У вас нет прав доступа. Разрешенные роли: {', '.join(allowed_roles)}",
            )
        return current_user

    return dependency

@router.get('/me', summary="Получение текущего пользователя")
async def read_users_me(current_user: dict = Depends(get_current_user), response_model=CurrentUser):
    return current_user