from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routers import items, events, transactions, auth, transactions_onchain

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Each router is connected to different end points to fetch data

app.include_router(items.router, prefix="/api/v1")
app.include_router(events.router, prefix="/api/v1")
app.include_router(transactions.router, prefix="/api/v1")
app.include_router(transactions_onchain.router, prefix="/api/v1")
app.include_router(auth.router, prefix="/api/v1")

# Handle exeption, displaying error message

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "message": str(exc)}
    )

@app.get("/")
def read_root():
    return {"message": "Welcome to the Swinburne Gold API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)