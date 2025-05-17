from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import select, func

from auth import get_current_user
from database import db_dependency
from models import Project, ProjectUser
from settings import BASE_URL

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

    projects_data = [
        {
            "id": project.id,
            "title": project.title,
            "icon": f"{BASE_URL}/{project.icon}" if project.icon else None,
        }
        for project in projects
    ]
    return projects_data

@router.get('/my-projects-paginated', summary="Получение всех проектов пользователя с пагинацией")
async def get_my_projects_paginated(
    db: db_dependency,
    current_user: dict = Depends(get_current_user),
    page: int = Query(0, ge=0, description="Номер страницы"),
    per_page: int = Query(10, ge=1, le=100, description="Количество элементов на странице")
):
    offset = page * per_page

    query = (
        select(Project)
        .join(ProjectUser)
        .where(ProjectUser.user_id == current_user.id)
        .offset(offset)
        .limit(per_page)
    )
    result = await db.execute(query)
    projects = result.scalars().all()

    total_query = (
        select(func.count())
        .select_from(Project)
        .join(ProjectUser)
        .where(ProjectUser.user_id == current_user.id)
    )
    total_result = await db.execute(total_query)
    total_projects = total_result.scalar()

    projects_data = [
        {
            "id": project.id,
            "title": project.title,
            "icon": f"{BASE_URL}/{project.icon}" if project.icon else None,
        }
        for project in projects
    ]

    return {
        "page": page,
        "per_page": per_page,
        "total_items": total_projects,
        "total_pages": (total_projects + per_page - 1) // per_page,
        "data": projects_data
    }

