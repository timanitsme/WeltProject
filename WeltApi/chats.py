from datetime import datetime
from typing import Optional, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select, true, exists, and_, or_, func
from starlette import status

from auth import get_current_user
from database import db_dependency
from models import Chat, ChatParticipant, Message, User
from my_websockets import notify_clients_about_new_message, notify_clients_about_message_deletion

router = APIRouter(
    prefix='/chats',
    tags=['chats']
)


@router.get('/my-chats', summary="Получение всех чатов пользователя")
async def get_my_chats(db: db_dependency, search_query: str = "", current_user: dict = Depends(get_current_user)):
    current_user_id = current_user.id

    subquery_last_message = (
        select(
            Message.chat_id,
            Message.text.label("last_message_text"),
            Message.sent_at.label("last_message_time"),
            Message.sender_id.label("last_message_sender_id")
        )
        .where(Message.chat_id == Chat.id)
        .order_by(Message.sent_at.desc())
        .limit(1)
        .lateral("last_message")
    )

    query = (
        select(
            Chat.id,
            Chat.name,
            Chat.is_group_chat,
            ChatParticipant.user_id,
            subquery_last_message.c.last_message_text,
            subquery_last_message.c.last_message_time,
            subquery_last_message.c.last_message_sender_id
        )
        .join(ChatParticipant, Chat.id == ChatParticipant.chat_id)
        .outerjoin(subquery_last_message, true())
        .where(
            and_(
                ChatParticipant.user_id == current_user_id,
                Chat.request_id.is_(None)
            )
        )
    )

    result = await db.execute(query)
    chats = result.fetchall()

    formatted_chats = []

    for chat in chats:
        chat_id = chat.id
        is_group_chat = chat.is_group_chat

        participants_query = (
            select(User.id, User.first_name, User.last_name, User.avatar)
            .join(ChatParticipant, User.id == ChatParticipant.user_id)
            .where(ChatParticipant.chat_id == chat_id)
        )
        participants_result = await db.execute(participants_query)
        participants = participants_result.fetchall()

        if is_group_chat:
            chat_name = chat.name
        else:
            other_participants = [p for p in participants if p.id != current_user_id]
            if len(other_participants) == 0:
                chat_name = f"{current_user.first_name} {current_user.last_name}"
            else:
                other_participant = other_participants[0]
                chat_name = f"{other_participant.first_name} {other_participant.last_name}"

        icons = [p.avatar for p in participants if p.avatar and p.id != current_user_id]
        if not is_group_chat:
            chat_icons = icons[:1]
        else:
            chat_icons = icons[:3]

        last_message = {
            "text": chat.last_message_text,
            "sent_at": chat.last_message_time,
            "sender_id": chat.last_message_sender_id,
        } if chat.last_message_text else None

        formatted_chats.append({
            "id": chat_id,
            "name": chat_name,
            "is_group_chat": is_group_chat,
            "icons": chat_icons,
            "last_message": last_message,
        })

    if search_query:
        formatted_chats = [
            chat for chat in formatted_chats
            if search_query.lower() in chat["name"].lower()
        ]

    # Получаем пользователей, с которыми нет чатов
    users_without_chats_query = (
        select(User.id, User.first_name, User.last_name, User.avatar)
        .where(
            and_(
                User.id != current_user_id,
                or_(
                    ~exists().where(ChatParticipant.user_id == User.id),
                    ~exists().where(
                        and_(
                            ChatParticipant.chat_id == Chat.id,
                            Chat.is_group_chat == False,
                            ChatParticipant.user_id == current_user_id,
                            exists().where(
                                and_(
                                    ChatParticipant.chat_id == Chat.id,
                                    ChatParticipant.user_id == User.id
                                )
                            )
                        )
                    )
                )
            )
        )
    )

    if search_query:
        users_without_chats_query = users_without_chats_query.where(
            or_(
                User.first_name.ilike(f"%{search_query}%"),
                User.last_name.ilike(f"%{search_query}%")
            )
        )

    users_without_chats_result = await db.execute(users_without_chats_query)
    users_without_chats = users_without_chats_result.fetchall()

    formatted_users_without_chats = [
        {
            "id": user.id,
            "name": f"{user.first_name} {user.last_name}",
            "icons": user.avatar,
            "has_chat": False,
        }
        for user in users_without_chats
    ]

    return {
        "chats": formatted_chats,
        "users_without_chats": formatted_users_without_chats,
    }

@router.get('/chat-messages/{chat_id}', summary="Получение всех сообщений чата")
async def get_chat_messages(
    chat_id: UUID,
    db: db_dependency,
    current_user: dict = Depends(get_current_user)
):
    current_user_id = current_user.id

    chat_query = select(Chat).where(Chat.id == chat_id)
    chat_result = await db.execute(chat_query)
    chat = chat_result.scalar_one_or_none()
    if chat is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Чат не найден"
        )

    participant_query = select(ChatParticipant).where(
        ChatParticipant.chat_id == chat_id,
        ChatParticipant.user_id == current_user_id
    )
    participant_result = await db.execute(participant_query)
    participant = participant_result.scalar_one_or_none()
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Вы не являетесь участником этого чата"
        )

    messages_query = (
        select(Message)
        .where(Message.chat_id == chat_id)
        .order_by(Message.sent_at.asc())
    )
    messages_result = await db.execute(messages_query)
    messages = messages_result.scalars().all()

    participants_query = (
        select(User.id, User.first_name, User.last_name)
        .join(ChatParticipant, User.id == ChatParticipant.user_id)
        .where(ChatParticipant.chat_id == chat_id)
    )
    participants_result = await db.execute(participants_query)
    participants = participants_result.fetchall()

    if chat.is_group_chat:
        chat_name = chat.name
    else:
        other_participants = [p for p in participants if p.id != current_user_id]
        if len(other_participants) == 0:
            chat_name = f"{current_user['first_name']} {current_user['last_name']}"
        else:
            other_participant = other_participants[0]
            chat_name = f"{other_participant.first_name} {other_participant.last_name}"

    formatted_messages = [
        {
            "id": message.id,
            "text": message.text,
            "sent_at": message.sent_at,
            "sender_id": message.sender_id,
            "sender_name": next(
                (f"{p.first_name} {p.last_name}" for p in participants if p.id == message.sender_id),
                "Неизвестный пользователь"
            ),
            "direction": "outgoing" if message.sender_id == current_user.id else "incoming"
        }
        for message in messages
    ]

    return {
        "chat_id": chat_id,
        "chat_name": chat_name,
        "messages": formatted_messages,
    }


class ChatCreate(BaseModel):
    name: str = ''
    project_id: Optional[UUID] = None
    request_id: Optional[int] = None
    is_group_chat: bool = False
    participants: Optional[List[UUID]] = []  # Список ID участников

class ChatResponse(BaseModel):
    id: UUID
    name: str
    project_id: Optional[UUID]
    request_id: Optional[int]
    is_group_chat: bool

    class Config:
        orm_mode = True


@router.post('/create-chat', summary="Создание нового чата")
async def create_chat(
    chat_data: ChatCreate,
    db: db_dependency,
    current_user: dict = Depends(get_current_user)
):
    chat = Chat(**chat_data.dict(exclude={"participants"}))
    db.add(chat)
    await db.commit()
    await db.refresh(chat)

    current_user_id = current_user.id

    participants = set(chat_data.participants or [])
    participants.add(current_user_id)

    for participant_id in participants:
        participant = ChatParticipant(chat_id=chat.id, user_id=participant_id)
        db.add(participant)
    await db.commit()

    return chat


class CreatePrivateChatRequest(BaseModel):
    user_id: UUID

@router.post('/create-private-chat', summary="Создание приватного чата между двумя участниками")
async def create_private_chat(
    data: CreatePrivateChatRequest,
    db: db_dependency,
    current_user: dict = Depends(get_current_user)
):
    current_user_id = current_user.id
    other_user_id = data.user_id

    existing_chat_query = (
        select(Chat.id)
        .join(ChatParticipant, Chat.id == ChatParticipant.chat_id)
        .where(
            and_(
                Chat.is_group_chat == False,
                ChatParticipant.user_id.in_([current_user_id, other_user_id])
            )
        )
        .group_by(Chat.id)
        .having(func.count(ChatParticipant.user_id) == 2)
    )

    result = await db.execute(existing_chat_query)
    existing_chat = result.scalar_one_or_none()

    if existing_chat:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Чат между этими пользователями уже существует"
        )

    chat = Chat(
        name="",
        is_group_chat=False,
        project_id=None,
        request_id=None
    )
    db.add(chat)
    await db.commit()
    await db.refresh(chat)

    participants = [current_user_id, other_user_id]
    for participant_id in participants:
        participant = ChatParticipant(chat_id=chat.id, user_id=participant_id)
        db.add(participant)
    await db.commit()

    return {
        "id": chat.id,
        "name": chat.name,
        "is_group_chat": chat.is_group_chat,
        "participants": participants
    }

class MessageResponse(BaseModel):
    id: UUID
    text: str
    sender_id: UUID
    chat_id: UUID
    sent_at: datetime
    direction: str

    class Config:
        orm_mode = True


class MessageCreate(BaseModel):
    text: str
    chat_id: UUID

@router.post('/send-message', response_model=MessageResponse, summary="Отправка сообщения в чат")
async def send_message(message_data: MessageCreate, db: db_dependency, current_user: dict = Depends(get_current_user)):
    message = Message(
        text=message_data.text,
        chat_id=message_data.chat_id,
        sender_id=current_user.id
    )
    db.add(message)
    await db.commit()
    await db.refresh(message)
    await notify_clients_about_new_message(f"{message.chat_id}")
    return {
        "id": message.id,
        "text": message.text,
        "sender_id": message.sender_id,
        "chat_id": message.chat_id,
        "sent_at": message.sent_at,
        "direction": "outgoing"
    }

@router.post('/add-user', summary="Добавление пользователя в чат")
async def add_user_to_chat(
    chat_id: UUID,
    user_id: UUID,
    db: db_dependency,
    current_user: dict = Depends(get_current_user)
):
    current_user_id = current_user.id

    # Проверяем, существует ли чат
    chat_query = select(Chat).where(Chat.id == chat_id)
    chat_result = await db.execute(chat_query)
    chat = chat_result.scalar_one_or_none()
    if chat is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Чат не найден"
        )

    user_query = select(User).where(User.id == user_id)
    user_result = await db.execute(user_query)
    user = user_result.scalar_one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден"
        )

    participant_query = select(ChatParticipant).where(
        ChatParticipant.chat_id == chat_id,
        ChatParticipant.user_id == current_user_id
    )
    participant_result = await db.execute(participant_query)
    current_user_is_participant = participant_result.scalar_one_or_none()
    if not current_user_is_participant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Вы не являетесь участником этого чата"
        )

    existing_participant_query = select(ChatParticipant).where(
        ChatParticipant.chat_id == chat_id,
        ChatParticipant.user_id == user_id
    )
    existing_participant_result = await db.execute(existing_participant_query)
    existing_participant = existing_participant_result.scalar_one_or_none()
    if existing_participant:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь уже является участником этого чата"
        )

    new_participant = ChatParticipant(chat_id=chat_id, user_id=user_id)
    db.add(new_participant)
    await db.commit()

    return {
        "message": f"Пользователь {user.first_name} {user.last_name} успешно добавлен в чат",
        "chat_id": chat_id,
        "user_id": user_id
    }

class DeleteMessageRequest(BaseModel):
    id: UUID

@router.delete('/delete-message', summary="Удаление сообщения по id")
async def delete_project(db: db_dependency, data: DeleteMessageRequest, current_user: dict = Depends(get_current_user)):
    query = select(Message).where(Message.id == data.id)
    result = await db.execute(query)
    message = result.scalar_one_or_none()

    if message is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Сообщения с таким id нет в базе данных"
        )

    if message.sender_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Вы не можете удалить это сообщение, так как вы не являетесь его отправителем"
        )
    await db.delete(message)
    await db.commit()
    await notify_clients_about_message_deletion(chat_id=message.chat_id, message_id=message.id)
    return {"message": "Сообщение успешно удалено"}