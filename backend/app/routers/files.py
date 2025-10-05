"""
Public files endpoint.
"""
from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models import File
from app.schemas import FilePublicResponse

router = APIRouter(prefix="/api", tags=["Public"])


@router.get("/files", response_model=List[FilePublicResponse])
async def get_files(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of files (public endpoint).
    Returns paginated list of uploaded files.
    
    Args:
        page: Page number (1-indexed)
        page_size: Number of items per page
        db: Database session
        
    Returns:
        List of file information
    """
    offset = (page - 1) * page_size
    
    result = await db.execute(
        select(File)
        .order_by(File.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    
    files = result.scalars().all()
    
    return [
        FilePublicResponse(
            uid=file.uid,
            absolute_path=file.absolute_path,
            url=file.url,
            created_at=file.created_at
        )
        for file in files
    ]


@router.get("/files/count")
async def get_files_count(db: AsyncSession = Depends(get_db)):
    """
    Get total count of files.
    
    Args:
        db: Database session
        
    Returns:
        Total count of files
    """
    result = await db.execute(select(func.count(File.id)))
    count = result.scalar()
    
    return {"count": count}
