export interface BallType {
  runs: number;
  isWide?: boolean;
  isNoBall?: boolean;
  isWicket?: boolean;
}

export interface OverSummary {
  balls: BallType[];
  totalRuns: number;
  legalBalls: number;
  wickets: number;
}