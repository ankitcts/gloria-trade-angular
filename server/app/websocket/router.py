import json
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from jose import JWTError, jwt

from app.config import settings
from .manager import ws_manager

logger = logging.getLogger(__name__)

router = APIRouter()


def _extract_user_id(token: str) -> str | None:
    """Decode a JWT access token and return the user_id (sub) claim."""
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        if payload.get("type") != "access":
            return None
        return payload.get("sub")
    except JWTError:
        return None


@router.websocket("")
async def ws_endpoint(
    websocket: WebSocket,
    token: str = Query(default=""),
):
    """Main WebSocket endpoint.

    Connect: ws://host/ws?token=<jwt_access_token>

    Messages from client:
      {"action": "subscribe", "channel": "quotes:RELIANCE"}
      {"action": "unsubscribe", "channel": "quotes:RELIANCE"}

    Messages from server:
      {"type": "quote_update", "channel": "quotes:RELIANCE", "data": {...}}
      {"type": "order_update", "data": {...}}
      {"type": "notification", "data": {...}}
    """
    user_id = _extract_user_id(token)
    if not user_id:
        await websocket.close(code=4001, reason="Unauthorized")
        return

    await ws_manager.connect(websocket, user_id)

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                continue

            action = msg.get("action")
            channel = msg.get("channel", "")

            if action == "subscribe" and channel:
                ws_manager.subscribe(websocket, channel)
                await websocket.send_json({"type": "subscribed", "channel": channel})

            elif action == "unsubscribe" and channel:
                ws_manager.unsubscribe(websocket, channel)
                await websocket.send_json({"type": "unsubscribed", "channel": channel})

            elif msg.get("type") == "ping":
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        pass
    except Exception as exc:
        logger.error(f"WebSocket error: {exc}")
    finally:
        ws_manager.disconnect(websocket, user_id)
