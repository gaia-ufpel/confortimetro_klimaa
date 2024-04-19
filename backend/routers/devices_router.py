from typing import Annotated
from pydantic import BaseModel
from fastapi import APIRouter, Depends, Header, HTTPException, Response
from sqlalchemy.orm import Session

from models import Device, Location
from utils.auth import get_current_user, is_active, is_admin, has_write_access
from utils.database import get_database

devices_router = APIRouter(prefix="/devices")

class DeviceRequest(BaseModel):
    serial_number: str
    model: str
    campus: str
    building: str
    room: str

@devices_router.get("/")
async def get_devices(db_session: Annotated[Session, Depends(get_database)], authorization: Annotated[str | None, Header()] = None):
    """
    List all devices.
    """
    _ = is_active(await get_current_user(authorization, db_session))
    
    devices = db_session.query(Device).all()

    return devices

@devices_router.post("/")
async def post_devices(device_request: DeviceRequest, db_session: Annotated[Session, Depends(get_database)], authorization: Annotated[str | None, Header()] = None):
    """
    Create a new device.
    """
    _ = has_write_access(is_active(await get_current_user(authorization, db_session)))

    location = db_session.query(Location).filter(Location.campus == device_request.campus, Location.building == device_request.building, Location.room == device_request.room).first()
    if not location:
        raise HTTPException(status_code=400, detail="Location not found, please create it first.")

    device = Device(
        serial_number = device_request.serial_number,
        model = device_request.model,
        id_location = location.id
    )

    db_session.add(device)
    db_session.commit()

    return Response(status_code=200)

@devices_router.get("/{serial_number}")
async def get_device_by_serial_number(serial_number: str, db_session: Annotated[Session, Depends(get_database)], authorization: Annotated[str | None, Header()] = None):
    """
    Get a device by its serial number.
    """
    _ = is_active(await get_current_user(authorization, db_session))

    device = db_session.query(Device).filter(Device.serial_number == serial_number).first()
    
    return device

@devices_router.get("/{campus}/{building}/{room}")
async def get_devices_by_location(campus: str, building: str, room: str, db_session: Annotated[Session, Depends(get_database)], authorization: Annotated[str | None, Header()] = None):
    """
    Get all devices in a location.
    """
    _ = is_active(await get_current_user(authorization, db_session))

    devices = db_session.query(Device).join(Location).filter(Location.campus == campus, Location.building == building, Location.room == room).all()
    
    return devices