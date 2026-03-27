"""
Challenge data store for Battle-Front.

Each challenge has:
  - id, title, difficulty
  - description (shown to the user)
  - evaluation_criteria (list of strings fed to the Gemini prompt)
  - difficulty_scale: a function (score) -> (adjusted_score, was_adjusted)
"""

CHALLENGES: dict[str, dict] = {
    # ── 1. Interactive Counter (Easy) ───────────────────────────────────────
    "counter-button": {
        "id": "counter-button",
        "title": "Interactive Counter",
        "difficulty": "Easy",
        "description": (
            "Build a React counter component using useState. "
            "The button displays current count and increments by 1 on each click."
        ),
        "evaluation_criteria": [
            "useState hook used to manage count state",
            'Button displays "Current Count: {count}" format',
            "Count initializes at 0",
            "onClick handler correctly increments by exactly 1",
            "Functional component (not class-based)",
            "No external state libraries used",
        ],
    },
    # ── 2. Dynamic Todo List (Medium) ───────────────────────────────────────
    "todo-list": {
        "id": "todo-list",
        "title": "Dynamic Todo List",
        "difficulty": "Medium",
        "description": (
            "Build a todo list where users can add items via an input + button "
            "and remove them individually. State managed with React hooks."
        ),
        "evaluation_criteria": [
            "useState for managing the list array",
            "Add item appends to list without mutating state directly",
            "Remove item filters by index or id without mutation",
            "Input clears after adding an item",
            "Empty input submissions are prevented",
            "Each item has a visible remove/delete button",
            "List renders dynamically from state",
        ],
    },
    # ── 3. CSS Layout Ninja (Hard) ──────────────────────────────────────────
    "css-layout": {
        "id": "css-layout",
        "title": "CSS Layout Ninja",
        "difficulty": "Hard",
        "description": (
            "Replicate a complex dashboard layout using pure CSS Grid. "
            "Must include: header spanning full width, sidebar, main content "
            "area, and footer. No flexbox for the outer layout. No CSS frameworks."
        ),
        "evaluation_criteria": [
            "CSS Grid used for outer layout (not flexbox)",
            "Header spans full column width",
            "Sidebar occupies left column, main content takes remaining space",
            "Footer spans full width at bottom",
            "Grid template areas or explicit track sizing used correctly",
            "No external CSS frameworks or libraries",
            "Layout holds at reasonable viewport widths",
        ],
    },
    # ── 4. Debounce Function (Medium) ───────────────────────────────────────
    "debounce": {
        "id": "debounce",
        "title": "Debounce Function",
        "difficulty": "Medium",
        "description": (
            "Implement debounce(fn, delay) — returns a function that delays "
            "invoking fn until after delay ms have passed since the last call."
        ),
        "evaluation_criteria": [
            "Returns a new function (higher-order function)",
            "Delay resets on every new call before timeout fires",
            "Uses closure to persist the timer reference",
            "clearTimeout called before each new setTimeout",
            "Handles edge cases: rapid calls, zero delay",
            "No memory leaks from lingering timers",
            "Arguments correctly forwarded to original fn",
        ],
    },
    # ── 5. Infinite Scroll (Medium) ─────────────────────────────────────────
    "infinite-scroll": {
        "id": "infinite-scroll",
        "title": "Infinite Scroll",
        "difficulty": "Medium",
        "description": (
            "Build a scrollable list that loads more items automatically as "
            "the user scrolls to the bottom. Must use IntersectionObserver "
            "API, not scroll event listeners."
        ),
        "evaluation_criteria": [
            "IntersectionObserver used (not scroll events)",
            "Sentinel element at the bottom triggers loading",
            "Loading flag prevents duplicate concurrent fetches",
            "New items appended to existing list (not replaced)",
            "Async fetch simulated with setTimeout or Promise",
            "Observer disconnected or guarded against memory leaks",
            "End-of-data state handled gracefully",
        ],
    },
    # ── 6. Virtualized List (Hard) ──────────────────────────────────────────
    "virtualized-list": {
        "id": "virtualized-list",
        "title": "Virtualized List",
        "difficulty": "Hard",
        "description": (
            "Render a performant scrollable list of 100,000 items using "
            "windowing. Only visible DOM nodes should exist at any time. "
            "Each item is 40px tall. No external libraries."
        ),
        "evaluation_criteria": [
            "Only visible items in DOM at any time",
            "Total container height equals 100000 * 40px",
            "Items absolutely positioned based on index",
            "Correct visible range calculation from scrollTop",
            "Buffer rows above and below viewport to prevent flicker",
            "Scroll listener used efficiently (no layout thrash)",
            "Works correctly after scrolling to any position rapidly",
        ],
    },
}


def get_challenge(challenge_id: str) -> dict | None:
    """Return challenge dict or None if not found."""
    return CHALLENGES.get(challenge_id)


def apply_difficulty_scaling(score: int, difficulty: str) -> tuple[int, bool]:
    """
    Apply difficulty-based scoring adjustments.
    Returns (adjusted_score, was_adjusted).
    """
    if difficulty == "Medium" and score >= 60:
        return min(score + 10, 100), True
    if difficulty == "Hard" and score >= 50:
        return min(score + 15, 100), True
    return score, False


def derive_verdict(score: int) -> str:
    """Derive verdict string from numerical score."""
    if score >= 80:
        return "Pass"
    if score >= 40:
        return "Partial"
    return "Fail"
