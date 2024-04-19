from typing import Annotated
from pydantic import BaseModel
from fastapi import APIRouter, Depends, Header, HTTPException, Response
from sqlalchemy.orm import Session

from models import Location
from utils.auth import get_current_user, is_active, is_admin, has_write_access
from utils.database import get_database

locations_router = APIRouter(prefix="/locations")

class LocationRequest(BaseModel):
    campus: str
    building: str
    room: str

@locations_router.get("/")
async def get_locations(db_session: Annotated[Session, Depends(get_database)], authorization: Annotated[str | None, Header()] = None):
    """
    Get all locations.
    """
    _ = is_active(await get_current_user(authorization, db_session))

    locations = db_session.query(Location).all()

    return locations

@locations_router.post("/")
async def post_locations(location_request: LocationRequest, db_session: Annotated[Session, Depends(get_database)], authorization: Annotated[str | None, Header()] = None):
    """
    Create a new location.
    """
    _ = has_write_access(is_active(await get_current_user(authorization, db_session)))

    if db_session.query(Location).filter(Location.campus == location_request.campus, Location.building == location_request.building, Location.room == location_request.room).first():
        raise HTTPException(status_code=400, detail="Location already exists")

    location = Location(
        campus = location_request.campus,
        building = location_request.building,
        room = location_request.room
    )

    db_session.add(location)
    db_session.commit()

    return Response(status_code=200)

@locations_router.get("/{location_id}")
async def get_location_by_id(location_id: int, db_session: Annotated[Session, Depends(get_database)], authorization: Annotated[str | None, Header()] = None):
    """
    Get a location by its ID.
    """
    _ = is_active(await get_current_user(authorization, db_session))

    location = db_session.query(Location).filter(Location.id == location_id).first()

    return location

