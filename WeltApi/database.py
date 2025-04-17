from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base

import settings

# Асинхронный движок для работы с базой
engine = create_async_engine(settings.REAL_DATABASE_URL, future=True, echo=True)

# Сессия для взаимодействия с базой
async_session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

Base = declarative_base()

async def get_db():
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()

db_dependency = Annotated[AsyncSession, Depends(get_db)]
