

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from uuid import UUID
from sqlalchemy import select
from starlette import status

from auth import get_current_user_with_roles, get_current_user
from database import db_dependency
from models import Role, Project, User, ProjectUser, Chat, RequestStatus

router = APIRouter(
    prefix='/admin',
    tags=['admin']
)

class CreateRoleRequest(BaseModel):
    title: str

class CreateProjectRequest(BaseModel):
    title: str

class DeleteRoleRequest(BaseModel):
    id: UUID

class CreateRequestStatusRequest(BaseModel):
    title: str

class IdRequest(BaseModel):
    id: UUID

@router.post('/create-role', summary="Создание новой роли")
async def create_role(db: db_dependency, data: CreateRoleRequest):
    query = select(Role).where(Role.title == data.title)
    result = await db.execute(query)
    role = result.scalar_one_or_none()
    if role is not None:
            raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Роль с таким названием уже есть в базе данных"
        )
    role = Role(
        title=data.title,
    )
    db.add(role)
    await db.commit()
    await db.refresh(role)

@router.delete('/delete-role', summary="Удаление роли по id")
async def delete_role(db: db_dependency, data: DeleteRoleRequest):
    query = select(Role).where(Role.id == data.id)
    result = await db.execute(query)
    role = result.scalar_one_or_none()
    if role is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Роли с таким id нет в базе данных"
        )
    await db.delete(role)
    await db.commit()


@router.get('/all-roles', summary="Получение всех ролей")
async def get_all_roles(db: db_dependency):
    query = select(Role)
    result = await db.execute(query)
    roles = result.scalars().all()
    return roles


@router.post('/create-request-status', summary="Создание нового статуса заявки")
async def create_request_status(db: db_dependency, data: CreateRequestStatusRequest):
    query = select(RequestStatus).where(RequestStatus.title == data.title)
    result = await db.execute(query)
    request_status = result.scalar_one_or_none()
    if request_status is not None:
            raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Статус с таким названием уже есть в базе данных"
        )
    request_status = RequestStatus(
        title=data.title,
    )
    db.add(request_status)
    await db.commit()
    await db.refresh(request_status)

@router.delete('/delete-request-status', summary="Удаление роли по id")
async def delete_request_status(db: db_dependency, data: IdRequest):
    query = select(RequestStatus).where(RequestStatus.id == data.id)
    result = await db.execute(query)
    request_status = result.scalar_one_or_none()
    if request_status is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Роли с таким id нет в базе данных"
        )
    await db.delete(request_status)
    await db.commit()


@router.get('/all-request-statuses', summary="Получение всех статусов заявок")
async def get_all_request_statuses(db: db_dependency):
    query = select(RequestStatus)
    result = await db.execute(query)
    request_statuses = result.scalars().all()
    return request_statuses



@router.post('/create-project', summary="Создание нового проекта")
async def create_project(db: db_dependency, data: CreateProjectRequest, current_user: dict = Depends(get_current_user_with_roles(["ADMIN", "MODERATOR"]))):
    query = select(Project).where(Project.title == data.title)
    result = await db.execute(query)
    project = result.scalar_one_or_none()
    if project is not None:
            raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Проект с таким названием уже есть в базе данных"
        )
    project = Project(
        title=data.title,
        icon=""
    )
    db.add(project)
    await db.commit()
    await db.refresh(project)

    project_user = ProjectUser(
        project_id=project.id,
        user_id=current_user.id
    )
    db.add(project_user)
    await db.commit()
    await db.refresh(project_user)

class AddUserToProjectRequest(BaseModel):
    project_id: UUID
    user_id: UUID

@router.post('/add-user-to-project', summary="Добавление пользователя в проект")
async def add_user_to_project(
    db: db_dependency,
    data: AddUserToProjectRequest,
    current_user: dict = Depends(get_current_user_with_roles(["ADMIN", "MODERATOR"]))
):
    project_query = select(Project).where(Project.id == data.project_id)
    project_result = await db.execute(project_query)
    project = project_result.scalar_one_or_none()

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Проект не найден"
        )

    user_query = select(User).where(User.id == data.user_id)
    user_result = await db.execute(user_query)
    user = user_result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден"
        )

    existing_relation_query = select(ProjectUser).where(
        ProjectUser.project_id == data.project_id,
        ProjectUser.user_id == data.user_id
    )
    existing_relation_result = await db.execute(existing_relation_query)
    existing_relation = existing_relation_result.scalar_one_or_none()

    if existing_relation is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь уже добавлен в проект"
        )

    project_user = ProjectUser(
        project_id=data.project_id,
        user_id=data.user_id
    )
    db.add(project_user)
    await db.commit()
    await db.refresh(project_user)

    return {"message": "Пользователь успешно добавлен в проект"}


@router.get('/all-projects', summary="Получение всех проектов")
async def get_all_projects(db: db_dependency, current_user: dict = Depends(get_current_user_with_roles(["ADMIN", "MODERATOR"]))):
    query = select(Project)
    result = await db.execute(query)
    projects = result.scalars().all()
    return projects


@router.get('/all-users', summary="Получение всех пользователей")
async def get_all_users(db: db_dependency, current_user: dict = Depends(get_current_user_with_roles(["ADMIN", "MODERATOR"]))):
    query = select(User)
    result = await db.execute(query)
    users = result.scalars().all()
    return users


@router.delete('/delete-project', summary="Удаление проекта по id")
async def delete_project(db: db_dependency, data: DeleteRoleRequest):
    query = select(Project).where(Project.id == data.id)
    result = await db.execute(query)
    role = result.scalar_one_or_none()
    if role is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Проекта с таким id нет в базе данных"
        )
    await db.delete(role)
    await db.commit()


@router.delete('/delete-chat', summary="Удаление чата по id")
async def delete_chat(db: db_dependency, data: DeleteRoleRequest, current_user: dict = Depends(get_current_user_with_roles(["ADMIN", "MODERATOR"]))):
    query = select(Chat).where(Chat.id == data.id)
    result = await db.execute(query)
    chat = result.scalar_one_or_none()
    if chat is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Чата с таким id нет в базе данных"
        )
    await db.delete(chat)
    await db.commit()


