from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.data_service import DataService
from app.schemas.dataset import DatasetProfileResponse, UploadResponse
from app.core.config import settings

router = APIRouter()

@router.get("/current", response_model=DatasetProfileResponse)
def get_current_dataset_profile(db: Session = Depends(get_db)):
    df, record = DataService.get_active_dataset(db)
    if df is None:
        raise HTTPException(status_code=404, detail="No active workforce dataset loaded.")
    
    filename = record.filename if record else "tcs_workforce_benchmark.csv"
    dataset_id = record.id if record else None
    return DataService.profile_dataframe(df, filename, dataset_id)

@router.post("/upload", response_model=UploadResponse)
async def upload_dataset(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Invalid file type. Only CSV files are supported.")

    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="File exceeds 10MB upload limit.")

    try:
        record, profile = DataService.save_uploaded_file(content, file.filename, db)
        return UploadResponse(
            success=True,
            dataset_id=record.id,
            filename=record.filename,
            total_records=record.row_count,
            message="Dataset uploaded, profiled, and schema-validated successfully.",
            profile=profile
        )
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to process CSV: {str(e)}")

@router.post("/reset-benchmark")
def reset_to_benchmark(db: Session = Depends(get_db)):
    """Resets the active dataset to the default high-fidelity TCS benchmark."""
    DataService.ensure_default_data_seeded(db)
    df, record = DataService.get_active_dataset(db)
    return {
        "success": True,
        "message": "Reset to TCS standard workforce benchmark dataset.",
        "records": len(df) if df is not None else 0
    }
