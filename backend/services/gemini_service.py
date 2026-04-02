"""
OpenRouter AI service layer for Battle-Front.

All four core functions call qwen/qwen3-coder:free via OpenRouter
using plain HTTP requests and return parsed dicts.
"""

import json
import logging
import os

import requests

from models.schemas import RateLimitError
from data.challenges import get_challenge, apply_difficulty_scaling, derive_verdict

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# ── OpenRouter config ────────────────────────────────────────────────────────

OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_MODEL = "openrouter/free"


def _chat(system: str, user: str) -> str:
    """Send a chat request to OpenRouter and return the assistant's text."""
    api_key = os.environ.get("OPENROUTER_API_KEY", "")
    if not api_key:
        raise RuntimeError("OPENROUTER_API_KEY is not set in environment.")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Referer": "https://devarena.app",
        "X-Title": "DevArena Battle-Front",
    }

    payload = {
        "model": OPENROUTER_MODEL,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    }

    resp = requests.post(OPENROUTER_API_URL, headers=headers, json=payload, timeout=60)

    if resp.status_code == 429:
        # Extract the real error from OpenRouter if available
        remote_error = (
            resp.json()
            .get("error", {})
            .get("message", "Local or Provider rate limit hit")
        )
        raise RateLimitError(remote_error)
    if not resp.ok:
        raise RuntimeError(
            f"OpenRouter API error {resp.status_code}: {resp.text[:300]}"
        )

    data = resp.json()
    return data["choices"][0]["message"]["content"] or ""


# ── Helpers ─────────────────────────────────────────────────────────────────


def parse_json_response(text: str) -> dict:
    """Find the first { and last } to extract JSON, stripping markdown or filler."""
    try:
        # Find the first '{' and last '}'
        start = text.find("{")
        end = text.rfind("}")

        if start == -1 or end == -1:
            raise ValueError("No JSON object found in response")

        json_str = text[start : end + 1]
        return json.loads(json_str)
    except json.JSONDecodeError as exc:
        logger.error("JSON parsing failed. Raw text: %s", text)
        raise ValueError(f"Model returned malformed JSON: {exc}") from exc
    except Exception as exc:
        logger.error("Error extracting JSON. Raw text: %s", text)
        raise ValueError(f"Could not extract JSON: {exc}") from exc


def _build_challenge_context(challenge: dict) -> str:
    """Build the challenge context block injected into every prompt."""
    criteria = "\n".join(f"  - {c}" for c in challenge["evaluation_criteria"])
    return (
        f"Challenge: {challenge['title']}\n"
        f"Difficulty: {challenge['difficulty']}\n"
        f"Description: {challenge['description']}\n"
        f"Evaluation Criteria:\n{criteria}"
    )


# ── 1. Evaluate Code ───────────────────────────────────────────────────────


def evaluate_code(code: str, challenge_id: str) -> dict:
    """Evaluate submitted code against challenge criteria. Returns dict."""
    challenge = get_challenge(challenge_id)
    if not challenge:
        raise ValueError(f"Unknown challenge: {challenge_id}")

    logger.info("evaluate_code | challenge=%s | code_len=%d", challenge_id, len(code))

    system_prompt = (
        "You are a strict but fair code reviewer for frontend engineering challenges.\n"
        "Evaluate the submitted JavaScript/React code against the challenge criteria.\n"
        "Be specific and direct. Never be vague.\n"
        "Always respond with ONLY valid JSON. No markdown. No explanation outside JSON.\n\n"
        "Use this exact JSON structure:\n"
        "{\n"
        '  "score": <integer 0-100>,\n'
        '  "verdict": "<Pass|Partial|Fail>",\n'
        '  "feedback": [\n'
        '    { "line": <int>, "issue": "<what is wrong>", "fix": "<how to fix>" }\n'
        "  ],\n"
        '  "summary": "<2-3 sentence overall review>"\n'
        "}\n\n"
        "Scoring rubric:\n"
        "80-100 = Pass: correct, handles edge cases, clean code\n"
        "40-79  = Partial: core logic present but flawed\n"
        "0-39   = Fail: fundamentally broken or not attempted\n\n"
        "Verdict must match score bracket exactly."
    )

    user_prompt = (
        f"{_build_challenge_context(challenge)}\n\n"
        f"--- Submitted Code ---\n{code}\n---"
    )

    last_error = None
    for attempt in range(2):
        try:
            logger.info(
                "OpenRouter call | func=evaluate_code | challenge=%s | attempt=%d",
                challenge_id,
                attempt + 1,
            )
            text = _chat(system_prompt, user_prompt)
            data = parse_json_response(text)

            raw_score = int(data.get("score", 0))
            raw_score = max(0, min(100, raw_score))

            adjusted_score, was_adjusted = apply_difficulty_scaling(
                raw_score, challenge["difficulty"]
            )
            final_verdict = derive_verdict(adjusted_score)

            logger.info(
                "OpenRouter response | challenge=%s | raw=%d | adjusted=%d | verdict=%s",
                challenge_id,
                raw_score,
                adjusted_score,
                final_verdict,
            )

            return {
                "score": adjusted_score,
                "verdict": final_verdict,
                "feedback": data.get("feedback", []),
                "summary": data.get("summary", ""),
                "adjustedForDifficulty": was_adjusted,
            }

        except ValueError as exc:
            last_error = exc
            logger.warning("JSON parse failed (attempt %d): %s", attempt + 1, exc)
            continue
        except RateLimitError:
            raise
        except Exception as exc:
            logger.exception("OpenRouter API error in evaluate_code: %s", exc)
            raise RuntimeError("AI evaluation failed. Please try again.") from exc

    raise RuntimeError(f"Failed to parse model response after retries: {last_error}")


# ── 2. Generate Solution ───────────────────────────────────────────────────


def generate_solution(challenge_id: str, user_code: str) -> dict:
    """Generate a corrected solution based on the user's code."""
    challenge = get_challenge(challenge_id)
    if not challenge:
        raise ValueError(f"Unknown challenge: {challenge_id}")

    logger.info(
        "generate_solution | challenge=%s | code_len=%d", challenge_id, len(user_code)
    )

    system_prompt = (
        "You are an expert JavaScript/React developer.\n"
        "Return a corrected and optimized version of the user's code.\n"
        "Always build on the user's existing work where possible.\n"
        "Respond with ONLY a single JSON object. No explanation text outside JSON.\n\n"
        "### JSON Structure:\n"
        "{\n"
        '  "solution": "<the corrected JS/React code>",\n'
        '  "explanation": "<brief summary of your improvements>",\n'
        '  "comments": []\n'
        "}\n\n"
        "IMPORTANT: You MUST escape newlines and quotes correctly inside the code string."
    )

    user_prompt = (
        f"{_build_challenge_context(challenge)}\n\n"
        f"--- User's Code ---\n{user_code}\n---"
    )

    last_error = None
    for attempt in range(2):
        try:
            logger.info(
                "OpenRouter call | func=generate_solution | challenge=%s | attempt=%d",
                challenge_id,
                attempt + 1,
            )
            text = _chat(system_prompt, user_prompt)
            data = parse_json_response(text)
            return {
                "solution": data.get("solution", ""),
                "explanation": data.get("explanation", ""),
                "comments": data.get("comments", []),
            }
        except ValueError as exc:
            last_error = exc
            logger.warning(
                "JSON parse failed for generate_solution (attempt %d): %s",
                attempt + 1,
                exc,
            )
            continue
        except RuntimeError:
            raise
        except Exception as exc:
            logger.exception("OpenRouter API error in generate_solution: %s", exc)
            raise RuntimeError(
                "AI solution generation failed. Please try again."
            ) from exc

    raise RuntimeError(f"Failed to generate solution after retries: {last_error}")


# ── 3. Generate Hint ───────────────────────────────────────────────────────


def generate_hint(challenge_id: str, user_code: str) -> dict:
    """Generate one actionable hint without giving the answer away."""
    challenge = get_challenge(challenge_id)
    if not challenge:
        raise ValueError(f"Unknown challenge: {challenge_id}")

    logger.info(
        "generate_hint | challenge=%s | code_len=%d", challenge_id, len(user_code)
    )

    system_prompt = (
        "You are a helpful coding mentor for frontend challenges.\n"
        "Look at the user's current (possibly incomplete) code.\n"
        "Give ONE specific actionable hint that moves them forward.\n"
        "Do NOT give away the answer.\n"
        'Categorize the hint as one of: "approach", "syntax", "logic", "api-usage".\n'
        "Always respond with ONLY valid JSON. No markdown. No explanation outside JSON.\n\n"
        "Use this exact JSON structure:\n"
        "{\n"
        '  "hint": "<one specific actionable hint>",\n'
        '  "category": "<approach|syntax|logic|api-usage>"\n'
        "}"
    )

    user_prompt = (
        f"{_build_challenge_context(challenge)}\n\n"
        f"--- User's Current Code ---\n{user_code}\n---"
    )

    try:
        logger.info("OpenRouter call | func=generate_hint | challenge=%s", challenge_id)
        text = _chat(system_prompt, user_prompt)
        data = parse_json_response(text)
        return {
            "hint": data.get("hint", ""),
            "category": data.get("category", "approach"),
        }
    except ValueError as exc:
        logger.exception("JSON parse failed in generate_hint: %s", exc)
        raise RuntimeError("Failed to parse AI hint response.") from exc
    except RuntimeError:
        raise
    except Exception as exc:
        logger.exception("OpenRouter API error in generate_hint: %s", exc)
        raise RuntimeError("AI hint generation failed. Please try again.") from exc


# ── 4. Explain Code ────────────────────────────────────────────────────────


def explain_code(code: str, challenge_id: str) -> dict:
    """Explain submitted code line by line."""
    challenge = get_challenge(challenge_id)
    if not challenge:
        raise ValueError(f"Unknown challenge: {challenge_id}")

    logger.info("explain_code | challenge=%s | code_len=%d", challenge_id, len(code))

    system_prompt = (
        "You are an expert JavaScript/React teacher.\n"
        "Go line by line through the submitted code.\n"
        "For each non-blank, non-comment line: explain what it does in plain English "
        "(one sentence max).\n"
        "Always respond with ONLY valid JSON. No markdown. No explanation outside JSON.\n\n"
        "Use this exact JSON structure:\n"
        "{\n"
        '  "lines": [\n'
        '    { "line": <int>, "code": "<the code on that line>", "explanation": "<what it does>" }\n'
        "  ],\n"
        '  "overallSummary": "<2-3 sentence summary of what the entire code does>"\n'
        "}"
    )

    user_prompt = (
        f"{_build_challenge_context(challenge)}\n\n"
        f"--- Submitted Code ---\n{code}\n---"
    )

    try:
        logger.info("OpenRouter call | func=explain_code | challenge=%s", challenge_id)
        text = _chat(system_prompt, user_prompt)
        data = parse_json_response(text)
        return {
            "lines": data.get("lines", []),
            "overallSummary": data.get("overallSummary", ""),
        }
    except ValueError as exc:
        logger.exception("JSON parse failed in explain_code: %s", exc)
        raise RuntimeError("Failed to parse AI explanation response.") from exc
    except RuntimeError:
        raise
    except Exception as exc:
        logger.exception("OpenRouter API error in explain_code: %s", exc)
        raise RuntimeError("AI explanation failed. Please try again.") from exc
