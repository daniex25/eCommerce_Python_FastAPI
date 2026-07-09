import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routers import router_almacen, router_ventas, router_compras, router_auth

app = FastAPI(
    title="eCommerce FastAPI",
    description="API REST para gestión de eCommerce: almacén, ventas y compras.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://127.0.0.1:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Imágenes de recetas médicas subidas por el Cliente (CUS104). No se
# versionan (ver .gitignore); se sirven tal cual para que el Q.F. las
# revise y el Cliente las vea en su historial.
os.makedirs("uploads/recetas", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(router_auth.router)
app.include_router(router_almacen.router, tags=["Almacén"])
app.include_router(router_ventas.router, tags=["Ventas"])
app.include_router(router_compras.router, tags=["Compras"])


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "eCommerce API corriendo"}
