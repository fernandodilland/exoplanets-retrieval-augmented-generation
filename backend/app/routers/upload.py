"""
File upload endpoints.
"""
import os
from pathlib import Path
from urllib.parse import quote
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
import aioboto3

from app.database import get_db
from app.models import User, File as FileModel
from app.dependencies import get_current_user
from app.schemas import UploadResponse
from app.config import settings

router = APIRouter(prefix="/api", tags=["Upload"])


def validate_file_extension(filename: str) -> bool:
    """
    Validate file extension against allowed list.
    
    Args:
        filename: Name of the file
        
    Returns:
        True if valid, False otherwise
    """
    file_ext = Path(filename).suffix.lower()
    return file_ext in settings.allowed_file_extensions_list


@router.post("/upload", response_model=UploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload file endpoint (authenticated).
    Uploads file to Cloudflare R2 and saves metadata to database.
    
    Args:
        file: File to upload
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Upload response with file information
        
    Raises:
        HTTPException: If file is invalid or upload fails
    """
    # Validate file size
    file_content = await file.read()
    file_size = len(file_content)
    
    if file_size > settings.max_file_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds maximum allowed size of {settings.max_file_size_mb}MB"
        )
    
    # Validate file extension
    if not validate_file_extension(file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not supported. Allowed extensions: {', '.join(settings.allowed_file_extensions_list)}"
        )
    
    # Reset file pointer
    await file.seek(0)
    
    try:
        # Generate unique filename with timestamp
        timestamp = int(os.times().elapsed * 1000)
        safe_filename = f"{timestamp}_{file.filename}"
        
        # Store file directly in root (no subdirectories)
        r2_path = safe_filename
        
        # Upload to Cloudflare R2
        try:
            session = aioboto3.Session()
            async with session.client(
                's3',
                endpoint_url=settings.r2_endpoint_url,
                aws_access_key_id=settings.r2_access_key_id,
                aws_secret_access_key=settings.r2_secret_access_key
            ) as s3_client:
                await s3_client.upload_fileobj(
                    file.file,
                    settings.r2_bucket_name,
                    r2_path
                )
        except Exception as r2_error:
            error_message = str(r2_error)
            
            # Provide specific error messages based on error type
            if "InvalidAccessKeyId" in error_message or "SignatureDoesNotMatch" in error_message:
                detail = f"R2 Authentication Error: Invalid R2 credentials (Access Key ID or Secret Access Key). Please verify your Cloudflare R2 credentials in .env file."
            elif "NoSuchBucket" in error_message:
                detail = f"R2 Bucket Error: The bucket '{settings.r2_bucket_name}' does not exist. Please create it in Cloudflare R2 dashboard or check the bucket name in .env file."
            elif "AccessDenied" in error_message:
                detail = f"R2 Permission Error: Access denied to bucket '{settings.r2_bucket_name}'. Please verify the R2 API token has proper permissions."
            elif "could not connect" in error_message.lower() or "connection" in error_message.lower():
                detail = f"R2 Connection Error: Unable to connect to Cloudflare R2. Please verify the endpoint URL '{settings.r2_endpoint_url}' and your internet connection."
            elif "endpoint" in error_message.lower():
                detail = f"R2 Endpoint Error: Invalid R2 endpoint URL '{settings.r2_endpoint_url}'. Please verify the endpoint format in .env file."
            else:
                detail = f"R2 Upload Error: {error_message}"
            
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=detail
            )
        
        # Generate public URL using R2 public domain
        # URL format: https://public-domain/absolute_path
        # Use quote() to properly encode spaces and special characters
        # safe='/' preserves forward slashes in the path
        encoded_path = quote(r2_path, safe='/')
        file_url = f"{settings.r2_public_domain}/{encoded_path}"
        
        # Save file metadata to database
        try:
            new_file = FileModel(
                user_id=current_user.id,
                absolute_path=r2_path,
                url=file_url
            )
            
            db.add(new_file)
            await db.commit()
            await db.refresh(new_file)
        except Exception as db_error:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database Error: Failed to save file metadata to database: {str(db_error)}"
            )
        
        return UploadResponse(
            success=True,
            message="File uploaded successfully",
            file_uid=new_file.uid,
            url=file_url
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions without modification
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error during file upload: {str(e)}"
        )
