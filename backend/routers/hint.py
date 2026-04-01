import logging

from fastapi import APIRouter, HTTPException

from models.schemas import HintRequest, HintResponse, ErrorResponse, RateLimitError
from data.challenges import get_challenge
from services.gemini_service import generate_hint

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post(
    "/hint",
    response_model=HintResponse,
    responses={
        400: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
        502: {"model": ErrorResponse},
    },
)
async def hint(request: HintRequest):
    logger.info("POST /api/hint | challengeId=%s", request.challengeId)

    challenge = get_challenge(request.challengeId)
    if not challenge:
        raise HTTPException(
            status_code=400,
            detail={"error": "Unknown challenge", "detail": f"challengeId '{request.challengeId}' not found"},
        )

    if not request.userCode.strip():
        raise HTTPException(
            status_code=400,
            detail={"error": "Empty code", "detail": "Submit at least a few lines of code to get a hint"},
        )

    try:
        result = generate_hint(request.challengeId, request.userCode)
        return HintResponse(**result)
    except RateLimitError as exc:
        logger.warning("⚠️ Rate limit: %s", exc)
        raise HTTPException(
            status_code=429,
            detail={"error": "ORACLE_RATE_LIMIT", "detail": str(exc)},
        )
    except RuntimeError as exc:
        logger.exception("AI hint generation failed for %s", request.challengeId)
        raise HTTPException(
            status_code=502,
            detail={"error": "AI hint generation failed", "detail": str(exc)},
        )
    except Exception as exc:
        logger.exception("Unexpected error in /api/hint")
        raise HTTPException(
            status_code=500,
            detail={"error": "Internal server error", "detail": "An unexpected error occurred"},
        )
