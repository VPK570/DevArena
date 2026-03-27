import logging

from fastapi import APIRouter, HTTPException

from models.schemas import ExplainRequest, ExplainResponse, ErrorResponse
from data.challenges import get_challenge
from services.gemini_service import explain_code

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post(
    "/explain",
    response_model=ExplainResponse,
    responses={
        400: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
        502: {"model": ErrorResponse},
    },
)
async def explain(request: ExplainRequest):
    logger.info("POST /api/explain | challengeId=%s", request.challengeId)

    challenge = get_challenge(request.challengeId)
    if not challenge:
        raise HTTPException(
            status_code=400,
            detail={"error": "Unknown challenge", "detail": f"challengeId '{request.challengeId}' not found"},
        )

    if not request.code.strip():
        raise HTTPException(
            status_code=400,
            detail={"error": "Empty code", "detail": "No code to explain"},
        )

    try:
        result = explain_code(request.code, request.challengeId)
        return ExplainResponse(**result)
    except RuntimeError as exc:
        logger.exception("Gemini explain failed for %s", request.challengeId)
        raise HTTPException(
            status_code=502,
            detail={"error": "AI explanation failed", "detail": str(exc)},
        )
    except Exception as exc:
        logger.exception("Unexpected error in /api/explain")
        raise HTTPException(
            status_code=500,
            detail={"error": "Internal server error", "detail": "An unexpected error occurred"},
        )
