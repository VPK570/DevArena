import logging

from fastapi import APIRouter, HTTPException

from models.schemas import SolutionRequest, SolutionResponse, ErrorResponse
from data.challenges import get_challenge
from services.gemini_service import generate_solution

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post(
    "/solution",
    response_model=SolutionResponse,
    responses={
        400: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
        502: {"model": ErrorResponse},
    },
)
async def solution(request: SolutionRequest):
    logger.info("POST /api/solution | challengeId=%s", request.challengeId)

    challenge = get_challenge(request.challengeId)
    if not challenge:
        raise HTTPException(
            status_code=400,
            detail={"error": "Unknown challenge", "detail": f"challengeId '{request.challengeId}' not found"},
        )

    try:
        result = generate_solution(request.challengeId, request.userCode)
        return SolutionResponse(**result)
    except RuntimeError as exc:
        logger.exception("Gemini solution generation failed for %s", request.challengeId)
        raise HTTPException(
            status_code=502,
            detail={"error": "AI solution generation failed", "detail": str(exc)},
        )
    except Exception as exc:
        logger.exception("Unexpected error in /api/solution")
        raise HTTPException(
            status_code=500,
            detail={"error": "Internal server error", "detail": "An unexpected error occurred"},
        )
