import uvicorn
from fastapi import FastAPI

from routers.authentication_router import authentication_router
from routers.devices_router import devices_router
from routers.metrics_router import metrics_router
from routers.locations_router import locations_router
from routers.metric_types_router import metric_types_router
from settings import HOST, PORT

app = FastAPI()

app.include_router(authentication_router)
app.include_router(devices_router)
app.include_router(metrics_router)
app.include_router(locations_router)
app.include_router(metric_types_router)

if __name__ == "__main__":
    uvicorn.run(app, host=HOST, port=PORT)