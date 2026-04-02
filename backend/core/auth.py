from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
import os
from functools import lru_cache

security = HTTPBearer(auto_error=False)


@lru_cache()
def get_supabase() -> Client:
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    if not url or not key:
        raise HTTPException(
            status_code=500, detail="Supabase credentials not configured on backend"
        )
    return create_client(url, key)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase: Client = Depends(get_supabase),
):
    if not credentials:
        return None

    try:
        # Verify the access token (JWT)
        user = supabase.auth.get_user(credentials.credentials)
        return user.user
    except Exception:
        # Token might be invalid or expired
        return None


async def require_auth(user=Depends(get_current_user)):
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
