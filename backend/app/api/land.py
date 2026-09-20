import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.auth import get_current_user

router = APIRouter(prefix="/api/land", tags=["Land Analysis"])

UPLOAD_DIR = Path(
    os.getenv(
        "THERMO_LAND_UPLOAD_DIR",
        Path(__file__).resolve().parents[3] / "uploads" / "land",
    )
)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}
MAX_BYTES = 10 * 1024 * 1024


@router.post("/upload")
async def upload_land_image(
    file: UploadFile = File(...),
    user=Depends(get_current_user),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Please upload a JPG, PNG, or WEBP image.",
        )

    extension = ALLOWED_TYPES[file.content_type]
    filename = f"{user['id']}_{uuid.uuid4().hex}{extension}"
    destination = UPLOAD_DIR / filename

    total = 0
    try:
        with destination.open("wb") as output:
            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk:
                    break
                total += len(chunk)
                if total > MAX_BYTES:
                    destination.unlink(missing_ok=True)
                    raise HTTPException(
                        status_code=413,
                        detail="Land image must be 10 MB or smaller.",
                    )
                output.write(chunk)
    finally:
        await file.close()

    return {
        "id": filename,
        "filename": file.filename,
        "content_type": file.content_type,
        "size_bytes": total,
        "analysis_status": "received",
        "analysis_message": (
            "Land image stored successfully. "
            "The next analysis stage can use this image together with the selected coordinates."
        ),
    }
