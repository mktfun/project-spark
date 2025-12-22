from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Tork CRM API", version="0.1.0")

# Configure CORS
origins = [
    "http://localhost:3000",
    "https://crm.davicode.me",
    "https://davicode.me",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.core.database import engine, Base
from app.routers import auth, settings, deals, webhooks, stages


# Create Tables (Simple Migration)
Base.metadata.create_all(bind=engine)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(settings.router, prefix="/crm/settings", tags=["Settings"])
app.include_router(stages.router, prefix="/crm/stages", tags=["Stages"])
app.include_router(deals.router, prefix="/crm/leads", tags=["Deals"])
app.include_router(webhooks.router, prefix="/webhooks", tags=["Webhooks"])

@app.get("/")
def read_root():
    return {"message": "Tork CRM API is running 🚀"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
