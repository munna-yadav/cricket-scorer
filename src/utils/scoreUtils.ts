export function calculateRunRate(totalRuns: number, currentOver: number, currentBall: number) {
  const completedOvers = currentOver + (currentBall / 6);
  if (completedOvers === 0) return "0.00";
  return (totalRuns / completedOvers).toFixed(2);
}

export function formatOvers(overs: number, balls: number) {
  return balls === 6 ? (overs + 1).toString() : `${overs}.${balls}`;
} 