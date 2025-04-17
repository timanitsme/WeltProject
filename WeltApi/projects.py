from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select

from auth import get_current_user
from database import db_dependency
from models import Project, ProjectUser

router = APIRouter(
    prefix='/projects',
    tags=['projects']
)




@router.get('/my-projects', summary="Получение всех проектов пользователя")
async def get_my_projects(db: db_dependency, current_user: dict = Depends(get_current_user)):
    query = (
        select(Project)
        .join(ProjectUser)
        .where(ProjectUser.user_id == current_user.id)
    )
    result = await db.execute(query)
    projects = result.scalars().all()
    return projects



