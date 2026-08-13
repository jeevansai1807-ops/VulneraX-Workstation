import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

# Keep track of active connections per scan_id
_active_connections: dict[str, list[WebSocket]] = {}

async def broadcast_scan_update(scan_id: str, event_type: str, data: dict):
    """
    Broadcast an update to all connected WebSockets for a specific scan_id.
    This should be called by the scan logic whenever it discovers something new.
    """
    if scan_id in _active_connections:
        dead_connections = []
        for ws in _active_connections[scan_id]:
            try:
                await ws.send_json({"event": event_type, "data": data})
            except Exception:
                dead_connections.append(ws)
                
        # Clean up dead connections
        for ws in dead_connections:
            _active_connections[scan_id].remove(ws)

@router.websocket("/ws/scan/{scan_id}")
async def websocket_scan_endpoint(websocket: WebSocket, scan_id: str):
    await websocket.accept()
    if scan_id not in _active_connections:
        _active_connections[scan_id] = []
    _active_connections[scan_id].append(websocket)
    
    try:
        # Keep connection open and listen for client disconnects
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        if scan_id in _active_connections and websocket in _active_connections[scan_id]:
            _active_connections[scan_id].remove(websocket)
        print(f"Client disconnected from scan {scan_id}")
