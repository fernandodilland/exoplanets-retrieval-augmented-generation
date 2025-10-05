"""
AI request endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import httpx

from app.database import get_db
from app.models import User, Response as ResponseModel
from app.dependencies import get_current_user
from app.schemas import AIRequestSchema, AIResponseSchema
from app.config import settings

router = APIRouter(prefix="/api", tags=["AI Request"])


@router.post("/request", response_model=AIResponseSchema)
async def ai_request(
    request_data: AIRequestSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    AI request endpoint (authenticated).
    Sends query to Cloudflare AI Search and returns response.
    
    Args:
        request_data: AI request with prompt
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        AI response with question and answer
        
    Raises:
        HTTPException: If AI request fails
    """
    try:
        # Prepare Cloudflare AI Search request
        url = f"https://api.cloudflare.com/client/v4/accounts/{settings.cloudflare_account_id}/autorag/rags/{settings.ai_search_name}/ai-search"
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {settings.cloudflare_api_token}"
        }
        
        payload = {
            "query": request_data.prompt
        }
        
        # TODO: Call Cloudflare AI Search API
        # This will be implemented when API credentials are configured
        # async with httpx.AsyncClient() as client:
        #     response = await client.post(url, json=payload, headers=headers, timeout=30.0)
        #     response.raise_for_status()
        #     ai_result = response.json()
        #     ai_response_text = ai_result.get("result", {}).get("response", "No response generated")
        
        # Temporary mock response
        ai_response_text = "This is a placeholder response. Cloudflare AI Search integration will be implemented once API credentials are configured."
        
        # Save response to database
        new_response = ResponseModel(
            user_id=current_user.id,
            question=request_data.prompt,
            response=ai_response_text
        )
        
        db.add(new_response)
        await db.commit()
        await db.refresh(new_response)
        
        return AIResponseSchema(
            question=new_response.question,
            response=new_response.response,
            created_at=new_response.created_at
        )
        
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI service unavailable: {str(e)}"
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process request: {str(e)}"
        )
