from typing import Dict
from fastapi import WebSocket, APIRouter
from fastapi.websockets import WebSocketDisconnect

from logsHandle import logger

active_connections: Dict[str, list] = {}

router = APIRouter(
    prefix='/sockets',
    tags=['sockets']
)

@router.websocket("/ws/chat/{chat_id}")
async def websocket_endpoint(websocket: WebSocket, chat_id: str):
    logger.info(f"WebSocket connection established for chat_id: {chat_id}")
    await websocket.accept()

    if chat_id not in active_connections:
        active_connections[chat_id] = []
    active_connections[chat_id].append(websocket)

    logger.info(f"Active connections: {active_connections}")

    try:
        while True:
            data = await websocket.receive_text()
            logger.info(f"Received message from chat_id {chat_id}: {data}")
    except WebSocketDisconnect:
        logger.info(f"WebSocket connection closed for chat_id: {chat_id}")
        active_connections[chat_id].remove(websocket)
        if not active_connections[chat_id]:
            del active_connections[chat_id]


async def notify_clients_about_new_message(chat_id: str):
    logger.info(f"Notifying clients for chat_id: {chat_id}")
    if chat_id in active_connections:
        for connection in active_connections[chat_id]:
            try:
                await connection.send_text("New message received")
                logger.debug(f"Notification sent to client in chat_id: {chat_id}")
            except Exception as e:
                logger.error(f"Error sending notification to client: {e}")
                active_connections[chat_id].remove(connection)
                if not active_connections[chat_id]:
                    del active_connections[chat_id]
    else:
        logger.warning(f"No active connections found for chat_id: {chat_id}")


async def notify_clients_about_message_deletion(chat_id: str, message_id: str):
    logger.info(f"Notifying clients about deletion of message with id: {message_id} in chat_id: {chat_id}")
    if chat_id in active_connections:
        for connection in active_connections[chat_id]:
            try:
                await connection.send_json({
                    "action": "delete",
                    "message_id": message_id  # Передаем ID удаленного сообщения
                })
                logger.debug(f"Deletion notification sent to client in chat_id: {chat_id}")
            except Exception as e:
                logger.error(f"Error sending deletion notification to client: {e}")
                active_connections[chat_id].remove(connection)
                if not active_connections[chat_id]:
                    del active_connections[chat_id]
    else:
        logger.warning(f"No active connections found for chat_id: {chat_id}")