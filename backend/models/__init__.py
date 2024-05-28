from datetime import datetime
from typing import List, Optional
from sqlalchemy import Integer, String, ForeignKey, DateTime, Float, Boolean, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from utils.database import Base

class Device(Base):
    __tablename__ = "devices"

    serial_number: Mapped[str] = mapped_column(String(40), primary_key=True)
    model: Mapped[str] = mapped_column(String(30))
    id_location: Mapped[int] = mapped_column(ForeignKey("locations.id"))

class Location(Base):
    __tablename__ = "locations"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    campus: Mapped[str] = mapped_column(String(30))
    building: Mapped[str] = mapped_column(String(30))
    room: Mapped[str] = mapped_column(String(30))

class Metric(Base):
    __tablename__ = "metrics"

    id: Mapped[int] = mapped_column(Integer(), primary_key=True, autoincrement=True) # PK
    date_time: Mapped[datetime] = mapped_column(DateTime())
    serial_number_device: Mapped[str] = mapped_column(ForeignKey("devices.serial_number")) # FK
    id_location: Mapped[int] = mapped_column(ForeignKey("locations.id")) # FK
    name_metric_type: Mapped[int] = mapped_column(ForeignKey("metrictypes.name")) # FK
    value: Mapped[float] = mapped_column(Float())

class MetricType(Base):
    __tablename__ = "metrictypes"

    name: Mapped[str] = mapped_column(String(30), primary_key=True)# PK
    description: Mapped[str] = mapped_column(String(50))

class User(Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(60), primary_key=True)
    password: Mapped[str] = mapped_column(String(100))
    name: Mapped[str] = mapped_column(String(80))
    group: Mapped[str] = mapped_column(String(30), CheckConstraint("group IN ('student', 'professor', 'external community)"))
    create_date: Mapped[datetime] = mapped_column(DateTime())
    is_admin: Mapped[bool] = mapped_column(Boolean())
    is_active: Mapped[bool] = mapped_column(Boolean())
    has_write_access: Mapped[bool] = mapped_column(Boolean())


class ConfirmationToken(Base):
    __tablename__ = "confirmation_tokens"

    token: Mapped[str] = mapped_column(String(100), primary_key=True)
    date_expiration: Mapped[datetime] = mapped_column(DateTime())
    email: Mapped[str] = mapped_column(ForeignKey("users.email"))
