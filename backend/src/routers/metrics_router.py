from fastapi import APIRouter

metrics_router = APIRouter(prefix="/metrics")

@metrics_router.get("/")
async def get_metrics():
    pass

@metrics_router.post("/")
async def post_metrics():
    pass

@metrics_router.get("/{campus}/{building}/{room}")
async def get_metrics_by_location(campus: str, building: str, room: str):
    pass

@metrics_router.get("/{serial_number}")
async def get_metrics_by_serial_numebr(serial_number: str):
    pass