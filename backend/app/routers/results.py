"""
Public results endpoint.
"""
from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models import Response
from app.schemas import ResponsePublicResponse

router = APIRouter(prefix="/api", tags=["Public"])


@router.get("/results", response_model=List[ResponsePublicResponse])
async def get_results(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of AI responses (public endpoint).
    Returns paginated list of AI request history.
    
    Args:
        page: Page number (1-indexed)
        page_size: Number of items per page
        db: Database session
        
    Returns:
        List of AI responses
    """
    offset = (page - 1) * page_size
    
    result = await db.execute(
        select(Response)
        .order_by(Response.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    
    responses = result.scalars().all()
    
    return [
        ResponsePublicResponse(
            uid=response.uid,
            question=response.question,
            response=response.response,
            created_at=response.created_at
        )
        for response in responses
    ]


@router.get("/results/count")
async def get_results_count(db: AsyncSession = Depends(get_db)):
    """
    Get total count of AI responses.
    
    Args:
        db: Database session
        
    Returns:
        Total count of responses
    """
    result = await db.execute(select(func.count(Response.id)))
    count = result.scalar()
    
    return {"count": count}
