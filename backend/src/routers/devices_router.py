from fastapi import APIRouter

devices_router = APIRouter(prefix="/devices")

@devices_router.get("/")
async def get_devices():
    pass

@devices_router.post("/")
async def post_devices():
    pass

@devices_router.get("/{serial_number}")
async def get_device_by_serial_number(serial_number: str):
    pass

@devices_router.get("/{campus}/{building}/{room}")
async def get_devices_by_location(campus: str, building: str, room: str):
    pass