import logging

from fastapi import APIRouter, HTTPException

from models.schemas import EvaluateRequest, EvaluateResponse, ErrorResponse
from data.challenges import get_challenge
from services.gemini_service import evaluate_code

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post(
    "/evaluate",
    response_model=EvaluateResponse,
    responses={
        400: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
        502: {"model": ErrorResponse},
    },
)
async def evaluate(request: EvaluateRequest):
    logger.info("POST /api/evaluate | challengeId=%s", request.challengeId)

    challenge = get_challenge(request.challengeId)
    if not challenge:
        raise HTTPException(
            status_code=400,
            detail={"error": "Unknown challenge", "detail": f"challengeId '{request.challengeId}' not found"},
        )

    try:
        result = evaluate_code(request.code, request.challengeId)
        return EvaluateResponse(**result)
    except RuntimeError as exc:
        logger.exception("Gemini evaluation failed for %s", request.challengeId)
        raise HTTPException(
            status_code=502,
            detail={"error": "AI evaluation failed", "detail": str(exc)},
        )
    except Exception as exc:
        logger.exception("Unexpected error in /api/evaluate")
        raise HTTPException(
            status_code=500,
            detail={"error": "Internal server error", "detail": "An unexpected error occurred"},
        )
