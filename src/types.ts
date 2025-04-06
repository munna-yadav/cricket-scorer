export interface BallType {
  runs: number;
  isWide?: boolean;
  isNoBall?: boolean;
  isWicket?: boolean;
}

export interface OverSummaryType {
  balls: BallType[];
  totalRuns: number;
  legalBalls: number;
  wickets: number;
}

export interface GameState {
  totalRuns: number;
  wickets: number;
  currentOver: number;
  currentBall: number;
  overSummary: OverSummaryType[];
  isMatchComplete: boolean;
}

export interface MatchData {
  id: string;
  created_at: string;
  total_overs: number;
  total_runs: number;
  wickets: number;
  current_over: number;
  current_ball: number;
  is_match_complete: boolean;
  [key: string]: any;
}