from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select, and_, or_

from auth import get_current_user
from database import db_dependency
from models import User, RequestStatus, Request, Chat, ChatParticipant
from starlette import status

router = APIRouter(
    prefix='/requests',
    tags=['requests']
)

class CreateRequestPayload(BaseModel):
    project_id: UUID
    subject: str
    description: str
    receiver_id: UUID

@router.post('/create-request', summary="Создание новой заявки")
async def create_request(
    payload: CreateRequestPayload,
    db: db_dependency,
    current_user: dict = Depends(get_current_user)
):
    project_id = payload.project_id
    subject = payload.subject
    description = payload.description
    sender_id = current_user.id
    receiver_id = payload.receiver_id

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

@router.get('/requests', summary="Получение всех заявок, где текущий пользователь - получатель")
async def get_requests(
    db: db_dependency,
    status_title: str = None,
    current_user: dict = Depends(get_current_user)
):
    receiver_id = current_user.id
    query = (
        select(
            Request.id,
            Request.project_id,
            Request.subject,
            Request.created_at,
            Request.description,
            RequestStatus.id.label("status_id"),
            RequestStatus.title.label("status_title"),
            Chat.id.label("chat_id"),
            User.id.label("sender_id"),
            User.avatar,
            User.first_name,
            User.last_name,
            User.email
        )
        .join(RequestStatus, Request.status_id == RequestStatus.id)
        .outerjoin(Chat, Request.id == Chat.request_id)
        .join(User, Request.sender_id == User.id)
        .where(Request.receiver_id == receiver_id)
    )

    if status_title:
        query = query.where(RequestStatus.title == status_title)

    result = await db.execute(query)
    requests = result.fetchall()

    formatted_requests = [
        {
            "id": request.id,
            "project_id": request.project_id,
            "subject": request.subject,
            "created_at": request.created_at,
            "description": request.description,
            "status": {
                "id": request.status_id,
                "title": request.status_title
            },
            "chat_id": request.chat_id,
            "sender": {
                "id": request.sender_id,
                "avatar": request.avatar,
                "first_name": request.first_name,
                "last_name": request.last_name,
                "email": request.email
            }
        }
        for request in requests
    ]

    return {"requests": formatted_requests}

@router.get('/requests/{request_id}', summary="Получение заявки по ID")
async def get_request_by_id(
    request_id: int,
    db: db_dependency,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.id

    query = (
        select(
            Request.id,
            Request.project_id,
            Request.subject,
            Request.created_at,
            Request.description,
            RequestStatus.id.label("status_id"),
            RequestStatus.title.label("status_title"),
            Chat.id.label("chat_id"),
            User.id.label("sender_id"),
            User.avatar,
            User.first_name,
            User.last_name,
            User.email
        )
        .join(RequestStatus, Request.status_id == RequestStatus.id)
        .outerjoin(Chat, Request.id == Chat.request_id)
        .join(User, Request.sender_id == User.id)
        .where(
            and_(
                Request.id == request_id,
                or_(
                    Request.sender_id == user_id,
                    Request.receiver_id == user_id                )
            )
        )
    )

    result = await db.execute(query)
    request_data = result.fetchone()

    if not request_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Заявка не найдена или у вас нет доступа к ней"
        )

    formatted_request = {
        "id": request_data.id,
        "project_id": request_data.project_id,
        "subject": request_data.subject,
        "created_at": request_data.created_at,
        "description": request_data.description,
        "status": {
            "id": request_data.status_id,
            "title": request_data.status_title
        },
        "chat_id": request_data.chat_id,
        "sender": {
            "id": request_data.sender_id,
            "avatar": request_data.avatar,
            "first_name": request_data.first_name,
            "last_name": request_data.last_name,
            "email": request_data.email
        }
    }

    return formatted_request


@router.get('/sent-requests', summary="Получение всех заявок, где текущий пользователь - отправитель")
async def get_sent_requests(
    db: db_dependency,
    current_user: dict = Depends(get_current_user)
):
    sender_id = current_user.id

    query = (
        select(
            Request.id,
            Request.project_id,
            Request.subject,
            Request.description,
            Request.created_at,
            RequestStatus.id.label("status_id"),
            RequestStatus.title.label("status_title"),
            Chat.id.label("chat_id"),
            User.id.label("receiver_id"),
            User.avatar,
            User.first_name,
            User.last_name,
            User.email
        )
        .join(RequestStatus, Request.status_id == RequestStatus.id)
        .outerjoin(Chat, Request.id == Chat.request_id)
        .join(User, Request.receiver_id == User.id)
        .where(Request.sender_id == sender_id)
    )

    result = await db.execute(query)
    requests = result.fetchall()

    formatted_requests = [
        {
            "id": request.id,
            "project_id": request.project_id,
            "subject": request.subject,
            "created_at": request.created_at,
            "description": request.description,
            "status": {
                "id": request.status_id,
                "title": request.status_title
            },
            "chat_id": request.chat_id,
            "sender": {
                "id": request.receiver_id,
                "avatar": request.avatar,
                "first_name": request.first_name,
                "last_name": request.last_name,
                "email": request.email
            }
        }
        for request in requests
    ]

    return {"requests": formatted_requests}


@router.patch('/requests/{request_id}/status', summary="Изменение статуса заявки")
async def update_request_status(
    request_id: int,
    new_status_title: str,
    db: db_dependency,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.id

    # Находим заявку
    request_query = (
        select(Request)
        .where(Request.id == request_id)
        .where(
            or_(
                Request.sender_id == user_id,
                Request.receiver_id == user_id
            )
        )
    )
    result = await db.execute(request_query)
    request = result.scalar_one_or_none()

    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Заявка не найдена или у вас нет доступа к ней"
        )

    status_query = select(RequestStatus).where(RequestStatus.title == new_status_title)
    status_result = await db.execute(status_query)
    new_status = status_result.scalar_one_or_none()

    if not new_status:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Статус '{new_status_title}' не найден"
        )

    request.status_id = new_status.id
    await db.commit()

    return {
        "id": request.id,
        "status": {
            "id": new_status.id,
            "title": new_status.title
        }
    }