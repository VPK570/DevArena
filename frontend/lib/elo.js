/**
 * ELO calculation for DevArena.
 * K-factor varies by challenge difficulty.
 */
export function calculateEloChange(currentElo, difficulty, score) {
  // 1. Normalize difficulty and determine K-factor
  const diff = difficulty.toLowerCase();
  let kFactor = 16;
  let challengeRating = 1000;

  if (diff === "medium") {
    kFactor = 24;
    challengeRating = 1400;
  } else if (diff === "hard") {
    kFactor = 32;
    challengeRating = 1800;
  }

  // 2. Calculate expected score (0-1)
  // Expected = 1 / (1 + 10^((opponentElo - currentElo) / 400))
  const expectedScore =
    1 / (1 + Math.pow(10, (challengeRating - currentElo) / 400));

  // 3. Normalized actual score (0-1)
  const actualScore = score / 100;

  // 4. Calculate change
  const eloChange = Math.round(kFactor * (actualScore - expectedScore));

  // 5. Calculate new ELO, clamped at minimum 100
  const newElo = Math.max(100, currentElo + eloChange);

  return { eloChange, newElo };
}
