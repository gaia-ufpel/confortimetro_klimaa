import os
import uvicorn
from fastapi import FastAPI

from routers.authentication_router import authentication_router
from routers.devices_router import devices_router
from routers.metrics_router import metrics_router
from routers.locations_router import locations_router

HOST = os.getenv("HOST")
if not HOST:
    HOST = "127.0.0.1"

PORT = os.getenv("PORT")
if not PORT:
    PORT = 8000

app = FastAPI()

app.include_router(authentication_router)
app.include_router(devices_router)
app.include_router(metrics_router)
app.include_router(locations_router)

if __name__ == "__main__":
    uvicorn.run(app, host=HOST, port=PORT)