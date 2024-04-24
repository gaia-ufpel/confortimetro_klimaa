from typing import Annotated
from pydantic import BaseModel
from fastapi import APIRouter, Depends, Header, HTTPException, Response
from sqlalchemy.orm import Session

from models import MetricType
from utils.auth import get_current_user, is_active, has_write_access, oauth2_scheme
from utils.database import get_database

metric_types_router = APIRouter(prefix="/metric_types")

class MetricTypeRequest(BaseModel):
    name: str
    description: str

@metric_types_router.get("/")
async def get_metric_types(token: Annotated[str, oauth2_scheme],
                           db_session: Annotated[Session, Depends(get_database)]):
    """
    List all metric types.
    """
    _ = is_active(get_current_user(token, db_session))

    metric_types = db_session.query(MetricType).all()

    return metric_types

@metric_types_router.post("/")
async def post_metric_types(token: Annotated[str, oauth2_scheme],
                            metric_type_request: MetricTypeRequest, 
                            db_session: Annotated[Session, Depends(get_database)]):
    """
    Create a new metric type.
    """
    _ = has_write_access(is_active(get_current_user(token, db_session)))

    metric_type = MetricType(
        name = metric_type_request.name,
        description = metric_type_request.description
    )

    db_session.add(metric_type)
    db_session.commit()

    return Response(status_code=200)

@metric_types_router.get("/{metric_type_name}")
async def get_metric_type_by_name(token: Annotated[str, oauth2_scheme],
                                  metric_type_name: str, 
                                  db_session: Annotated[Session, Depends(get_database)]):
    """
    Get a metric type by its name.
    """
    _ = is_active(get_current_user(token, db_session))

    metric_type = db_session.query(MetricType).filter(MetricType.name == metric_type_name).first()
    if not metric_type:
        raise HTTPException(status_code=404, detail="Metric type not found")

    return metric_type