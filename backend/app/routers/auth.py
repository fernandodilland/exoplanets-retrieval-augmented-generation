"""
Authentication endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from datetime import datetime

from app.database import get_db
from app.models import User
from app.schemas import LoginRequest, TokenResponse
from app.utils.security import verify_password
from app.utils.jwt import create_access_token
from app.utils.turnstile import verify_turnstile

router = APIRouter(prefix="/api", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
async def login(
    request: Request,
    login_data: LoginRequest,
    turnstile_token: str = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Login endpoint with Turnstile verification.
    
    Args:
        request: FastAPI request object
        login_data: Login credentials
        turnstile_token: Turnstile token from header (cf-turnstile-response)
        db: Database session
        
    Returns:
        JWT access token
        
    Raises:
        HTTPException: If credentials are invalid or Turnstile fails
    """
    # Verify Turnstile token
    client_ip = request.client.host if request.client else ""
    
    # Get turnstile token from header if not in body
    if not turnstile_token:
        turnstile_token = request.headers.get("cf-turnstile-response", "")
    
    if not await verify_turnstile(turnstile_token, client_ip):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid CAPTCHA verification"
        )
    
    # Get user from database
    result = await db.execute(
        select(User).where(User.user == login_data.user)
    )
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(login_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Update last access
    await db.execute(
        update(User)
        .where(User.id == user.id)
        .values(last_access=datetime.utcnow())
    )
    await db.commit()
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.user, "user_id": user.id}
    )
    
    return TokenResponse(access_token=access_token)
