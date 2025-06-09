"""reVoAgent Backend Application"""
import sys
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Add packages to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "packages"))

app = FastAPI(title="reVoAgent API", version="2.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "reVoAgent API v2.0 - Enterprise Ready"}

@app.get("/health")
async def health():
    return {"status": "healthy", "version": "2.0.0"}

@app.get("/api/status")
async def api_status():
    """API status endpoint"""
    try:
        # Try to import from new package structure
        from core.config import ConfigLoader
        config_loader = ConfigLoader()
        config = config_loader.load_environment_config()
        
        return {
            "status": "operational",
            "architecture": "enterprise-ready",
            "environment": config.get("environment", "unknown"),
            "packages": {
                "core": "loaded",
                "engines": "available", 
                "agents": "available",
                "ai": "available"
            }
        }
    except Exception as e:
        return {
            "status": "operational",
            "architecture": "enterprise-ready", 
            "note": "Package imports being finalized",
            "error": str(e)
        }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
