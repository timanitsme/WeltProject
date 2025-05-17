import os
import uuid
from datetime import timezone, datetime
from typing import Optional, List

from fastapi import APIRouter, HTTPException, Depends, Query, UploadFile, File, Form
from pydantic import BaseModel
from uuid import UUID, uuid4
from sqlalchemy import select, func
from starlette import status

from auth import get_current_user_with_roles, get_current_user
from database import db_dependency
from models import Role, Project, User, ProjectUser, Chat, RequestStatus, ChatParticipant, Request, TaskStatus, \
    TaskPriority, Task, TaskAssignment
from settings import BASE_URL

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
    id: int

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

@router.get('/all-roles', summary="Получение всех ролей")
async def get_all_roles(db: db_dependency, page: int = Query(0, ge=0, description="Номер страницы"), per_page: int = Query(10, ge=1, le=100, description="Количество элементов на странице")):
    offset = page * per_page

    query = select(Role).offset(offset).limit(per_page)
    result = await db.execute(query)
    roles = result.scalars().all()

    total_query = select(func.count()).select_from(Role)
    total_result = await db.execute(total_query)
    total_roles = total_result.scalar()

    return {
        "page": page,
        "per_page": per_page,
        "total_items": total_roles,
        "total_pages": (total_roles + per_page - 1) // per_page,
        "data": roles
    }

@router.get('/all-task-statuses', summary="Получение всех статусов задач")
async def get_all_task_statuses(db: db_dependency, current_user: dict = Depends(get_current_user_with_roles(["ADMIN", "MODERATOR"])), page: int = Query(0, ge=0, description="Номер страницы"), per_page: int = Query(10, ge=1, le=100, description="Количество элементов на странице")):
    offset = page * per_page

    query = select(TaskStatus).offset(offset).limit(per_page)
    result = await db.execute(query)
    task_statuses = result.scalars().all()

    total_query = select(func.count()).select_from(TaskStatus)
    total_result = await db.execute(total_query)
    total_task_statuses = total_result.scalar()

    return {
        "page": page,
        "per_page": per_page,
        "total_items": total_task_statuses,
        "total_pages": (total_task_statuses + per_page - 1) // per_page,
        "data": task_statuses
    }

class CreateRequestPayload(BaseModel):
    project_id: UUID
    subject: str
    description: str
    sender_id: UUID
    receiver_id: UUID

@router.post('/create-request', summary="Создание новой заявки")
async def create_request(
    payload: CreateRequestPayload,
    db: db_dependency,
    current_user: dict = Depends(get_current_user_with_roles(["ADMIN", "MODERATOR"]))
):
    project_id = payload.project_id
    subject = payload.subject
    description = payload.description
    sender_id = payload.sender_id
    receiver_id = payload.receiver_id

    sender_query = select(User).where(User.id == sender_id)
    sender_result = await db.execute(sender_query)
    sender = sender_result.scalar_one_or_none()
    if not sender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь-отправитель не найден"
        )

    receiver_query = select(User).where(User.id == receiver_id)
    receiver_result = await db.execute(receiver_query)
    receiver = receiver_result.scalar_one_or_none()
    if not receiver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь-получатель не найден"
        )

    status_query = select(RequestStatus).where(RequestStatus.title == "IN PROGRESS")
    status_result = await db.execute(status_query)
    request_status = status_result.scalar_one_or_none()
    if not request_status:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Статус 'IN PROGRESS' не найден"
        )

    new_request = Request(
        project_id=project_id,
        status_id=request_status.id,
        subject=subject,
        description=description,
        sender_id=sender_id,
        receiver_id=receiver_id
    )
    db.add(new_request)
    await db.commit()
    await db.refresh(new_request)

    chat = Chat(
        name="",
        is_group_chat=False,
        project_id=project_id,
        request_id=new_request.id
    )
    db.add(chat)
    await db.commit()
    await db.refresh(chat)

    participants = [sender_id, receiver_id]
    for participant_id in participants:
        participant = ChatParticipant(chat_id=chat.id, user_id=participant_id)
        db.add(participant)
    await db.commit()

    return {
        "id": new_request.id,
        "project_id": new_request.project_id,
        "status": {"id": request_status.id, "title": request_status.title},
        "subject": new_request.subject,
        "description": new_request.description,
        "sender_id": new_request.sender_id,
        "receiver_id": new_request.receiver_id,
        "chat_id": chat.id
    }

@router.get('/all-task-priorities', summary="Получение всех приоритетов задач")
async def get_all_task_priorities(db: db_dependency, current_user: dict = Depends(get_current_user), page: int = Query(0, ge=0, description="Номер страницы"), per_page: int = Query(10, ge=1, le=100, description="Количество элементов на странице")):
    offset = page * per_page

    query = select(TaskPriority).offset(offset).limit(per_page)
    result = await db.execute(query)
    priorities = result.scalars().all()

    total_query = select(func.count()).select_from(TaskPriority)
    total_result = await db.execute(total_query)
    total_priorities = total_result.scalar()

    return {
        "page": page,
        "per_page": per_page,
        "total_items": total_priorities,
        "total_pages": (total_priorities + per_page - 1) // per_page,
        "data": priorities
    }

@router.get('/all-tasks', summary="Получение всех задач")
async def get_all_tasks(db: db_dependency, current_user: dict = Depends(get_current_user_with_roles(["ADMIN", "MODERATOR"])), page: int = Query(0, ge=0, description="Номер страницы"), per_page: int = Query(10, ge=1, le=100, description="Количество элементов на странице")):
    offset = page * per_page

    query = select(Task).offset(offset).limit(per_page)
    result = await db.execute(query)
    tasks = result.scalars().all()

    total_query = select(func.count()).select_from(Task)
    total_result = await db.execute(total_query)
    total_tasks = total_result.scalar()

    return {
        "page": page,
        "per_page": per_page,
        "total_items": total_tasks,
        "total_pages": (total_tasks + per_page - 1) // per_page,
        "data": tasks
    }


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

@router.delete('/delete-request-status', summary="Удаление статуса заявки по id")
async def delete_request_status(db: db_dependency, data: DeleteRoleRequest):
    query = select(RequestStatus).where(RequestStatus.id == data.id)
    result = await db.execute(query)
    request_status = result.scalar_one_or_none()
    if request_status is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Статуса заявки с таким id нет в базе данных"
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
async def create_project(db: db_dependency, title: str = Form(...),  icon: Optional[UploadFile] = File(None), current_user: dict = Depends(get_current_user_with_roles(["ADMIN", "MODERATOR"]))):
    query = select(Project).where(Project.title == title)
    result = await db.execute(query)
    project = result.scalar_one_or_none()
    if project is not None:
            raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Проект с таким названием уже есть в базе данных"
        )
    icon_path = None
    if icon:
        file_extension = icon.filename.split(".")[-1]
        file_name = f"{uuid4()}.{file_extension}"
        icon_path = f"static/projects/{file_name}"

        os.makedirs("static/projects", exist_ok=True)
        with open(icon_path, "wb") as f:
            content = await icon.read()
            f.write(content)

    project = Project(
        title=title,
        icon=icon_path
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
async def get_all_projects(db: db_dependency, current_user: dict = Depends(get_current_user_with_roles(["ADMIN", "MODERATOR"])), page: int = Query(0, ge=0, description="Номер страницы"), per_page: int = Query(10, ge=1, le=100, description="Количество элементов на странице")):
    offset = page * per_page
    query = select(Project).offset(offset).limit(per_page)
    result = await db.execute(query)
    projects = result.scalars().all()

    total_query = select(func.count()).select_from(Project)
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

@router.get('/all-requests', summary="Получение всех заявок")
async def get_all_requests(db: db_dependency, current_user: dict = Depends(get_current_user_with_roles(["ADMIN", "MODERATOR"])), page: int = Query(0, ge=0, description="Номер страницы"), per_page: int = Query(10, ge=1, le=100, description="Количество элементов на странице")):
    offset = page * per_page
    query = select(Request).offset(offset).limit(per_page)
    result = await db.execute(query)
    requests = result.scalars().all()

    total_query = select(func.count()).select_from(Request)
    total_result = await db.execute(total_query)
    total_requests = total_result.scalar()


    return {
        "page": page,
        "per_page": per_page,
        "total_items": total_requests,
        "total_pages": (total_requests + per_page - 1) // per_page,
        "data": requests
    }

@router.get('/all-chats-participants', summary="Получение всех участников чатов")
async def get_all_chats_participants(db: db_dependency, current_user: dict = Depends(get_current_user_with_roles(["ADMIN", "MODERATOR"])), page: int = Query(0, ge=0, description="Номер страницы"), per_page: int = Query(10, ge=1, le=100, description="Количество элементов на странице")):
    offset = page * per_page
    query = select(ChatParticipant).offset(offset).limit(per_page)
    result = await db.execute(query)
    chats_participants = result.scalars().all()

    total_query = select(func.count()).select_from(ChatParticipant)
    total_result = await db.execute(total_query)
    total_chats_participants = total_result.scalar()

    return {
        "page": page,
        "per_page": per_page,
        "total_items": total_chats_participants,
        "total_pages": (total_chats_participants + per_page - 1) // per_page,
        "data": chats_participants
    }

@router.get('/all-chats', summary="Получение всех чатов")
async def get_all_chats_participants(db: db_dependency, current_user: dict = Depends(get_current_user_with_roles(["ADMIN", "MODERATOR"])), page: int = Query(0, ge=0, description="Номер страницы"), per_page: int = Query(10, ge=1, le=100, description="Количество элементов на странице")):
    offset = page * per_page
    query = select(Chat).offset(offset).limit(per_page)
    result = await db.execute(query)
    chats = result.scalars().all()

    total_query = select(func.count()).select_from(Chat)
    total_result = await db.execute(total_query)
    total_chats = total_result.scalar()

    return {
        "page": page,
        "per_page": per_page,
        "total_items": total_chats,
        "total_pages": (total_chats + per_page - 1) // per_page,
        "data": chats
    }


@router.get('/all-users', summary="Получение всех пользователей")
async def get_all_users(db: db_dependency, current_user: dict = Depends(get_current_user_with_roles(["ADMIN", "MODERATOR"])), page: int = Query(0, ge=0, description="Номер страницы"), per_page: int = Query(10, ge=1, le=100, description="Количество элементов на странице")):
    offset = page * per_page

    query = select(User).offset(offset).limit(per_page)
    result = await db.execute(query)
    users = result.scalars().all()

    total_query = select(func.count()).select_from(User)
    total_result = await db.execute(total_query)
    total_users = total_result.scalar()

    users_data = [
        {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "role_id": user.role_id,
            "avatar": f"{BASE_URL}/{user.avatar}" if user.avatar else None
        }
        for user in users
    ]

    return {
        "page": page,
        "per_page": per_page,
        "total_items": total_users,
        "total_pages": (total_users + per_page - 1) // per_page,
        "data": users_data
    }


@router.delete('/delete-user', summary="Удаление пользователя по id")
async def delete_user(db: db_dependency, data: DeleteRoleRequest, current_user: dict = Depends(get_current_user_with_roles(["ADMIN", "MODERATOR"]))):
    query = select(User).where(User.id == data.id)
    result = await db.execute(query)
    role = result.scalar_one_or_none()
    if role is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователя с таким id нет в базе данных"
        )
    await db.delete(role)
    await db.commit()

@router.delete('/delete-task', summary="Удаление задачи по id")
async def delete_task(db: db_dependency, data: DeleteRoleRequest, current_user: dict = Depends(get_current_user_with_roles(["ADMIN", "MODERATOR"]))):
    query = select(Task).where(Task.id == data.id)
    result = await db.execute(query)
    task = result.scalar_one_or_none()
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Задачи с таким id нет в базе данных"
        )
    await db.delete(task)
    await db.commit()


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

@router.delete('/delete-request', summary="Удаление заявки по id")
async def delete_request(db: db_dependency, data: IdRequest):
    query = select(Request).where(Request.id == data.id)
    result = await db.execute(query)
    request = result.scalar_one_or_none()
    if request is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Заявки с таким id нет в базе данных"
        )
    await db.delete(request)
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

class CreateTaskRequest(BaseModel):
    title: str
    description: Optional[str] = None
    project_id: uuid.UUID
    status_id: uuid.UUID
    priority_id: uuid.UUID
    deadline: Optional[datetime] = None
    assignee_ids: Optional[List[uuid.UUID]] = []

@router.post("/create-task")
async def create_task(
    request: CreateTaskRequest,
    db: db_dependency,
    current_user: dict = Depends(get_current_user)
):
    # Проверка: существует ли проект
    project_result = await db.execute(select(Project).where(Project.id == request.project_id))
    project = project_result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Проект не найден")

    # Проверка: существует ли статус
    status_result = await db.execute(select(TaskStatus).where(TaskStatus.id == request.status_id))
    status_obj = status_result.scalar_one_or_none()
    if not status_obj:
        raise HTTPException(status_code=404, detail="Статус задачи не найден")

    # Проверка: существует ли приоритет
    priority_result = await db.execute(select(TaskPriority).where(TaskPriority.id == request.priority_id))
    priority_obj = priority_result.scalar_one_or_none()
    if not priority_obj:
        raise HTTPException(status_code=404, detail="Приоритет задачи не найден")

    deadline = request.deadline.astimezone(timezone.utc).replace(tzinfo=None)
    # Создаём задачу
    new_task = Task(
        title=request.title,
        description=request.description,
        project_id=request.project_id,
        status_id=request.status_id,
        priority_id=request.priority_id,
        deadline=deadline
    )
    db.add(new_task)
    await db.commit()
    await db.refresh(new_task)

    # Назначаем исполнителей
    for user_id in request.assignee_ids:
        user_result = await db.execute(select(User).where(User.id == user_id))
        user = user_result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail=f"Пользователь {user_id} не найден")

        task_assignment = TaskAssignment(
            task_id=new_task.id,
            user_id=user_id
        )
        db.add(task_assignment)

    await db.commit()

    return {"detail": "Задача успешно создана", "task_id": new_task.id}
