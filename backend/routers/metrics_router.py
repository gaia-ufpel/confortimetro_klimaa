from typing import Annotated
from datetime import datetime
from pydantic import BaseModel
from fastapi import APIRouter, Depends, Header, HTTPException, Response
from sqlalchemy.orm import Session

from models import Device, Location, Metric, MetricType
from utils.auth import get_current_active_user
from utils.database import get_database

metrics_router = APIRouter(prefix="/metrics")

class MetricsRequest(BaseModel):
    date_time: datetime
    serial_number_device: str
    campus: str
    building: str
    room: str
    name_metric_type: str
    value: float


@metrics_router.get("/")
async def get_metrics(db_session: Annotated[Session, Depends(get_database)], authorization: Annotated[str | None, Header()] = None):
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.split(" ")[-1]
    _ = await get_current_active_user(token, db_session)

    metrics = db_session.query(Device).all()

    return metrics

@metrics_router.post("/")
async def post_metrics(metrics_request: MetricsRequest, db_session: Annotated[Session, Depends(get_database)], authorization: Annotated[str | None, Header()] = None):
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.split(" ")[-1]
    _ = await get_current_active_user(token, db_session)

    location = db_session.query(Location).filter(Location.campus == metrics_request.campus, Location.building == metrics_request.building, Location.room == metrics_request.room).first()
    if not location:
        raise HTTPException(status_code=400, detail="Location not found, please create it first.")
    
    metric_type = db_session.query(MetricType).filter(MetricType.name == metrics_request.name_metric_type).first()
    if not metric_type:
        raise HTTPException(status_code=400, detail="Metric type not found, please create it first.")

    metric = Metric(
        date_time = metrics_request.date_time,
        serial_number_device = metrics_request.serial_number_device,
        id_location = location.id,
        name_metric_type = metrics_request.name_metric_type,
        value = metrics_request.value
    )

    db_session.add(metric)
    db_session.commit()

    return Response(status_code=200)

@metrics_router.get("/{campus}/{building}/{room}")
async def get_metrics_by_location(campus: str, building: str, room: str, db_session: Annotated[Session, Depends(get_database)], authorization: Annotated[str | None, Header()] = None):
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.split(" ")[-1]
    _ = await get_current_active_user(token, db_session)

    metrics = db_session.query(Metric).join(Location).filter(campus=campus, building=building, room=room).all()

    return metrics

@metrics_router.get("/{serial_number}")
async def get_metrics_by_serial_numebr(serial_number: str, db_session: Annotated[Session, Depends(get_database)], authorization: Annotated[str | None, Header()] = None):
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.split(" ")[-1]
    _ = await get_current_active_user(token, db_session)

    metrics = db_session.query(Metric).filter(serial_number = serial_number).all()

    return metrics