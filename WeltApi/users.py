from fastapi import APIRouter, Depends
from sqlalchemy import select

from auth import get_current_user
from database import db_dependency
from models import User

router = APIRouter(
    prefix='/users',
    tags=['users']
)

@router.get('/users-except-me', summary="Получение всех пользователей кроме текущего")
async def get_all_users_except_me(
    db: db_dependency,
    current_user: dict = Depends(get_current_user)
):
    # Исключаем текущего пользователя из выборки
    query = select(User).where(User.id != current_user.id)
    result = await db.execute(query)
    users = result.scalars().all()
    return users
