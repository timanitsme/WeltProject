from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select, func

from auth import get_current_user
from database import db_dependency
from models import User
from settings import BASE_URL

router = APIRouter(
    prefix='/users',
    tags=['users']
)

class UserResponse(BaseModel):
    id: UUID
    email: str
    first_name: str
    last_name: str
    avatar: str | None = None
    role_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

@router.get('/users-except-me', summary="Получение всех пользователей кроме текущего")
async def get_all_users_except_me(
    db: db_dependency,
    current_user: dict = Depends(get_current_user),
    page: int = Query(0, ge=0, description="Номер страницы"),
    per_page: int = Query(10, ge=1, le=100, description="Количество элементов на странице")
):
    offset = page * per_page

    query = (
        select(User)
        .where(User.id != current_user.id)
        .offset(offset)
        .limit(per_page)
    )
    result = await db.execute(query)
    users = result.scalars().all()

    total_query = (
        select(func.count())
        .select_from(User)
        .where(User.id != current_user.id)
    )
    total_result = await db.execute(total_query)
    total_users = total_result.scalar()

    users_data = [
        UserResponse.model_validate(user).model_dump()
        for user in users
    ]

    for user in users_data:
        if user["avatar"]:
            user["avatar"] = f"{BASE_URL}/{user['avatar']}"

    return {
        "page": page,
        "per_page": per_page,
        "total_items": total_users,
        "total_pages": (total_users + per_page - 1) // per_page,
        "data": users_data
    }

