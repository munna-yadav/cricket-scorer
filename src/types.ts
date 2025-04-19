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

export interface InningsState {
  totalRuns: number;
  wickets: number;
  currentOver: number;
  currentBall: number;
  overSummary: OverSummaryType[];
  isComplete: boolean;
}

export interface GameState {
  totalRuns: number;
  wickets: number;
  currentOver: number;
  currentBall: number;
  overSummary: OverSummaryType[];
  isMatchComplete: boolean;
  currentInnings?: number;
  targetRuns?: number;
  inningsData?: {
    innings1: InningsState;
    innings2: InningsState;
  };
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
  current_innings: number;
  innings1_total_runs: number;
  innings1_wickets: number;
  innings1_current_over: number;
  innings1_current_ball: number;
  innings1_is_complete: boolean;
  innings2_total_runs: number;
  innings2_wickets: number;
  innings2_current_over: number;
  innings2_current_ball: number;
  innings2_is_complete: boolean;
  [key: string]: any;
}