import uvicorn
from fastapi import FastAPI

from routers.devices_router import devices_router
from routers.metrics_router import metrics_router

app = FastAPI()

app.include_router(devices_router)
app.include_router(metrics_router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)