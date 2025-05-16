import uuid
from datetime import datetime, timezone
from typing import Optional, List

from fastapi import APIRouter, HTTPException, status, Depends, Form
from pydantic import BaseModel
from sqlalchemy import select

from auth import get_current_user
from database import db_dependency
from models import TaskStatus, TaskPriority, Task, User, TaskAssignment, Project

router = APIRouter(
    prefix='/tasks',
    tags=['tasks']
)

class CreateTitleRequest(BaseModel):
    title: str

@router.post('/create-task-status', summary="Создание нового статуса задачи")
async def create_task_status(db: db_dependency, data: CreateTitleRequest):
    query = select(TaskStatus).where(TaskStatus.title == data.title)
    result = await db.execute(query)
    task_status = result.scalar_one_or_none()
    if task_status is not None:
            raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Статус задачи с таким названием уже есть в базе данных"
        )
    task_status = TaskStatus(
        title=data.title,
    )
    db.add(task_status)
    await db.commit()
    await db.refresh(task_status)


class CreateTaskRequest(BaseModel):
    title: str
    description: Optional[str] = None
    project_id: uuid.UUID
    status_id: uuid.UUID
    priority_id: uuid.UUID
    deadline: Optional[datetime] = None
    assignee_ids: Optional[List[uuid.UUID]] = []

@router.post("/create")
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

@router.get("/project/{project_id}")
async def get_tasks_by_project(db: db_dependency, project_id: uuid.UUID):
    statuses_result = await db.execute(select(TaskStatus))
    statuses = statuses_result.scalars().all()

    grouped_tasks = []

    for status in statuses:
        result = await db.execute(
            select(Task)
            .where(Task.project_id == project_id)
            .where(Task.status_id == status.id)
        )
        tasks = result.scalars().all()

        tasks_data = []
        for task in tasks:
            assignees_result = await db.execute(
                select(User).join(TaskAssignment).where(TaskAssignment.task_id == task.id)
            )
            assignees = assignees_result.scalars().all()

            priority_title = (
                await db.execute(
                    select(TaskPriority.title).where(TaskPriority.id == task.priority_id)
                )
            ).scalar_one()

            tasks_data.append({
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "priority": {
                    "id": task.priority_id,
                    "title": priority_title,
                },
                "deadline": task.deadline,
                "assignees": [
                    {"id": u.id, "name": f"{u.first_name} {u.last_name}", "avatar": u.avatar}
                    for u in assignees
                ],
            })

        grouped_tasks.append({
            "status": {
                "id": status.id,
                "title": status.title,
            },
            "tasks": tasks_data,
        })

    return grouped_tasks


@router.post('/create-task-priority', summary="Создание нового приоритета задачи")
async def create_task_priority(db: db_dependency, data: CreateTitleRequest):
    query = select(TaskPriority).where(TaskPriority.title == data.title)
    result = await db.execute(query)
    task_priority = result.scalar_one_or_none()
    if task_priority is not None:
            raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Приоритет задачи с таким названием уже есть в базе данных"
        )
    task_priority = TaskPriority(
        title=data.title,
    )
    db.add(task_priority)
    await db.commit()
    await db.refresh(task_priority)


class UpdateTaskStatusRequest(BaseModel):
    status_id: uuid.UUID

@router.put("/{task_id}/update-status")
async def update_task_status(
    db: db_dependency,
    task_id: uuid.UUID,
    data: UpdateTaskStatusRequest,
    current_user: dict = Depends(get_current_user)
):
    task_result = await db.execute(select(Task).where(Task.id == task_id))
    task = task_result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Задача не найдена")

    status_result = await db.execute(select(TaskStatus).where(TaskStatus.id == data.status_id))
    status = status_result.scalar_one_or_none()
    if not status:
        raise HTTPException(status_code=404, detail="Статус не найден")

    task.status_id = data.status_id
    await db.commit()
    await db.refresh(task)

    return {"detail": "Статус задачи обновлён", "task_id": task.id}
