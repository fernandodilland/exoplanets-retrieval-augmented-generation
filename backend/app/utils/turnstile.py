"""
Turnstile verification utilities.
"""
import httpx
from app.config import settings


async def verify_turnstile(token: str, remote_ip: str = "") -> bool:
    """
    Verify Cloudflare Turnstile token.
    
    Args:
        token: Turnstile token from client
        remote_ip: Client IP address (optional)
        
    Returns:
        True if valid, False otherwise
    """
    if settings.is_development and settings.turnstile_secret_key == "1x0000000000000000000000000000000AA":
        # Development mode with test key - always pass
        return True
    
    url = "https://challenges.cloudflare.com/turnstile/v0/siteverify"
    
    data = {
        "secret": settings.turnstile_secret_key,
        "response": token,
    }
    
    if remote_ip:
        data["remoteip"] = remote_ip
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, data=data)
            result = response.json()
            return result.get("success", False)
    except Exception:
        return False
