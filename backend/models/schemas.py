from pydantic import BaseModel


# ── Exceptions ──────────────────────────────────────────────────────────────

class ChallengeNotFoundError(Exception):
    """Raised when a challengeId does not exist in the data store."""
    pass


class RateLimitError(Exception):
    """Raised when the AI provider returns a 429."""
    pass


# ── /api/evaluate ───────────────────────────────────────────────────────────

class EvaluateRequest(BaseModel):
    code: str
    challengeId: str


class FeedbackItem(BaseModel):
    line: int
    issue: str
    fix: str


class EvaluateResponse(BaseModel):
    score: int  # 0–100
    verdict: str  # "Pass" | "Partial" | "Fail"
    feedback: list[FeedbackItem]
    summary: str
    adjustedForDifficulty: bool  # True if score was scaled


# ── /api/solution ───────────────────────────────────────────────────────────

class SolutionRequest(BaseModel):
    challengeId: str
    userCode: str


class SolutionComment(BaseModel):
    line: int
    comment: str


class SolutionResponse(BaseModel):
    solution: str  # corrected JS code
    explanation: str  # 2-3 sentence summary of changes
    comments: list[SolutionComment]


# ── /api/hint ───────────────────────────────────────────────────────────────

class HintRequest(BaseModel):
    challengeId: str
    userCode: str  # current code state, can be partial


class HintResponse(BaseModel):
    hint: str  # one specific, actionable hint
    category: str  # "approach" | "syntax" | "logic" | "api-usage"


# ── /api/explain ────────────────────────────────────────────────────────────

class ExplainRequest(BaseModel):
    code: str
    challengeId: str


class LineExplanation(BaseModel):
    line: int
    code: str  # the actual code on that line
    explanation: str  # what it does in plain English


class ExplainResponse(BaseModel):
    lines: list[LineExplanation]
    overallSummary: str


# ── Error envelope ──────────────────────────────────────────────────────────

class ErrorResponse(BaseModel):
    error: str
    detail: str | None = None
