# Роли
import uuid
from enum import Enum

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, String, Boolean, DateTime, func, ForeignKey, Integer

from database import Base


class Role(Base):
    __tablename__="roles"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)

# Проекты
class Project(Base):
    __tablename__="projects"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    icon = Column(String, nullable=True)


# Пользователи
class User(Base):
    __tablename__="users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=True)
    email = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=True)
    avatar = Column(String, nullable=True)
    created_at = Column(DateTime, default=func.now())
    role_id = Column(UUID, ForeignKey("roles.id", ondelete='SET DEFAULT'), nullable=False, default=0)

# Статусы заявок
class RequestStatus(Base):
    __tablename__="request_statuses"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)

# Заявки
class Request(Base):
    __tablename__="requests"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(UUID, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    status_id = Column(UUID, ForeignKey("request_statuses.id"))
    subject=Column(String, nullable=False)
    description=Column(String, nullable=False)
    sender_id=Column(UUID, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    receiver_id=Column(UUID, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=func.now())


# Статусы задач
class TaskStatus(Base):
    __tablename__ = "task_statuses"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)

class TaskPriority(Base):
    __tablename__ = "task_priorities"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)

class Task(Base):
    __tablename__ = "tasks"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    project_id = Column(UUID, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    status_id = Column(UUID, ForeignKey("task_statuses.id"), nullable=False)
    priority_id = Column(UUID, ForeignKey("task_priorities.id"), nullable=False)
    deadline = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class TaskAssignment(Base):
    __tablename__ = "task_assignments"
    task_id = Column(UUID, ForeignKey("tasks.id", ondelete="CASCADE"), primary_key=True)
    user_id = Column(UUID, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)

class ProjectUser(Base):
    __tablename__="projects_users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

class Chat(Base):
    __tablename__="chats"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False, default='')
    project_id = Column(UUID, ForeignKey("projects.id", ondelete="CASCADE"), nullable=True)
    request_id = Column(Integer, ForeignKey("requests.id", ondelete="CASCADE"), nullable=True)
    is_group_chat = Column(Boolean, default=False)

class ChatParticipant(Base):
    __tablename__="chat_participants"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chat_id = Column(UUID, ForeignKey("chats.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID, ForeignKey("users.id"), nullable=False)

class Message(Base):
    __tablename__="messages"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    text = Column(String, nullable=False)
    sender_id = Column(UUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    chat_id = Column(UUID, ForeignKey("chats.id", ondelete="CASCADE"), nullable=False)
    sent_at = Column(DateTime, default=func.now())

class MessageStatus(Base):
    __tablename__="message_statuses"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id = Column(UUID, ForeignKey("messages.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    id_read = Column(Boolean, default=False)

class MessageAttachment(Base):
    __tablename__="message_attachments"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    file_url=Column(String, nullable=False)
    file_name=Column(String, nullable=False)