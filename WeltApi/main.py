import logging
from typing import Annotated

import uvicorn
from fastapi import FastAPI, Depends, HTTPException
from fastapi.openapi.utils import status_code_ranges
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from starlette.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import admin
import auth
import chats
import projects
import my_websockets
import requests
import tasks
import users
from database import async_session

app = FastAPI(title="WeltAPI")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

origins = [
    'http://localhost:5173',
    'http://localhost:80',
    'http://localhost:8080',
]

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]

)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(chats.router)
app.include_router(projects.router)
app.include_router(my_websockets.router)
app.include_router(requests.router)
app.include_router(users.router)
app.include_router(tasks.router)
app.mount("/static", StaticFiles(directory="static"), name="static")

async def get_db():
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()

db_dependency = Annotated[AsyncSession, Depends(get_db)]
#user_dependency = Annotated[dict, Depends(get_current_user)]


@app.get("/", status_code=status.HTTP_200_OK)
async def user(user: None, db: db_dependency):
    if user is None:
        raise HTTPException(status_code=401, detail="Авторизация неуспешна")
    return {"User": user}

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)