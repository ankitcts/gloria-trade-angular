import json
import logging
from collections import defaultdict

from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections grouped by channel and user."""

    def __init__(self):
        self._connections: dict[str, set[WebSocket]] = defaultdict(set)
        self._user_connections: dict[str, set[WebSocket]] = defaultdict(set)

    async def connect(self, websocket: WebSocket, user_id: str) -> None:
        await websocket.accept()
        self._user_connections[user_id].add(websocket)
        logger.info(f"WebSocket connected: user={user_id}")

    def disconnect(self, websocket: WebSocket, user_id: str) -> None:
        self._user_connections[user_id].discard(websocket)
        for channel_sockets in self._connections.values():
            channel_sockets.discard(websocket)
        logger.info(f"WebSocket disconnected: user={user_id}")

    def subscribe(self, websocket: WebSocket, channel: str) -> None:
        self._connections[channel].add(websocket)

    def unsubscribe(self, websocket: WebSocket, channel: str) -> None:
        self._connections[channel].discard(websocket)

    async def broadcast(self, channel: str, message: dict) -> None:
        payload = json.dumps(message)
        dead = []
        for ws in self._connections.get(channel, set()):
            try:
                await ws.send_text(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self._connections[channel].discard(ws)

    async def send_to_user(self, user_id: str, message: dict) -> None:
        payload = json.dumps(message)
        dead = []
        for ws in self._user_connections.get(user_id, set()):
            try:
                await ws.send_text(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self._user_connections[user_id].discard(ws)

    @property
    def active_connections(self) -> int:
        return sum(len(sockets) for sockets in self._user_connections.values())


ws_manager = ConnectionManager()
