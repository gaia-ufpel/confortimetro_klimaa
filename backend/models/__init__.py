from datetime import datetime
from typing import List, Optional
from sqlalchemy import Integer, String, ForeignKey, DateTime, Float, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from utils.database import Base

class Device(Base):
    __tablename__ = "devices"

    serial_number: Mapped[str] = mapped_column(String(40), primary_key=True)
    model: Mapped[str] = mapped_column(String(30))
    id_location: Mapped[int] = mapped_column(ForeignKey("locations.id"))

    location: Mapped["Location"] = relationship(back_populates="devices")

class Location(Base):
    __tablename__ = "locations"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    campus: Mapped[str] = mapped_column(String(30))
    building: Mapped[str] = mapped_column(String(30))
    room: Mapped[str] = mapped_column(String(30))

    devices: Mapped[List["Device"]] = relationship(back_populates="location")

class Metric(Base):
    __tablename__ = "metrics"

    id: Mapped[int] = mapped_column(Integer(), primary_key=True, autoincrement=True) # PK
    date_time: Mapped[datetime] = mapped_column(DateTime())
    serial_number_device: Mapped[str] = mapped_column(ForeignKey("devices.serial_number")) # FK
    id_location: Mapped[int] = mapped_column(ForeignKey("locations.id")) # FK
    name_metric_type: Mapped[int] = mapped_column(ForeignKey("metrictypes.name")) # FK
    value: Mapped[float] = mapped_column(Float())

    device: Mapped["Device"] = relationship(back_populates="metrics")
    location: Mapped["Location"] = relationship(back_populates="metrics")
    metric_type: Mapped["MetricType"] = relationship(back_populates="metrics")

class MetricType(Base):
    __tablename__ = "metrictypes"

    name: Mapped[str] = mapped_column(String(30), primary_key=True)# PK
    description: Mapped[str] = mapped_column(String(50))

class User(Base):
    __tablename__ = "users"

    username: Mapped[str] = mapped_column(String(50))
    email: Mapped[str] = mapped_column(String(60), primary_key=True)
    password: Mapped[str] = mapped_column(String(100))
    create_date: Mapped[datetime] = mapped_column(DateTime())
    is_admin: Mapped[bool] = mapped_column(Boolean())
    is_active: Mapped[bool] = mapped_column(Boolean())
