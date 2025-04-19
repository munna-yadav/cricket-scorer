import React, { createContext, useContext, useState, ReactNode } from 'react';
import { OverSummaryType, GameState, InningsState } from '../types';

interface GameContextType {
  totalOvers: number | '';
  setTotalOvers: (overs: number | '') => void;
  gameStarted: boolean;
  setGameStarted: (started: boolean) => void;
  currentInnings: number;
  setCurrentInnings: (innings: number) => void;
  currentOver: number;
  setCurrentOver: (over: number) => void;
  currentBall: number;
  setCurrentBall: (ball: number) => void;
  totalRuns: number;
  setTotalRuns: (runs: number) => void;
  wickets: number;
  setWickets: (wickets: number) => void;
  overSummary: OverSummaryType[];
  setOverSummary: (summary: OverSummaryType[]) => void;
  isMatchComplete: boolean;
  setIsMatchComplete: (complete: boolean) => void;
  stateHistory: GameState[];
  setStateHistory: React.Dispatch<React.SetStateAction<GameState[]>>;
  inningsData: {
    innings1: InningsState;
    innings2: InningsState;
  };
  setInningsData: React.Dispatch<React.SetStateAction<{
    innings1: InningsState;
    innings2: InningsState;
  }>>;
  targetRuns: number;
  setTargetRuns: (target: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [totalOvers, setTotalOvers] = useState<number | ''>('');
  const [gameStarted, setGameStarted] = useState(false);
  const [currentInnings, setCurrentInnings] = useState(1);
  const [currentOver, setCurrentOver] = useState(0);
  const [currentBall, setCurrentBall] = useState(0);
  const [totalRuns, setTotalRuns] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [overSummary, setOverSummary] = useState<OverSummaryType[]>([
    { balls: [], totalRuns: 0, legalBalls: 0, wickets: 0 }
  ]);
  const [isMatchComplete, setIsMatchComplete] = useState(false);
  const [stateHistory, setStateHistory] = useState<GameState[]>([]);
  const [inningsData, setInningsData] = useState<{
    innings1: InningsState;
    innings2: InningsState;
  }>({
    innings1: {
      totalRuns: 0,
      wickets: 0,
      currentOver: 0,
      currentBall: 0,
      overSummary: [{ balls: [], totalRuns: 0, legalBalls: 0, wickets: 0 }],
      isComplete: false
    },
    innings2: {
      totalRuns: 0,
      wickets: 0,
      currentOver: 0,
      currentBall: 0,
      overSummary: [{ balls: [], totalRuns: 0, legalBalls: 0, wickets: 0 }],
      isComplete: false
    }
  });
  const [targetRuns, setTargetRuns] = useState(0);

  return (
    <GameContext.Provider
      value={{
        totalOvers,
        setTotalOvers,
        gameStarted,
        setGameStarted,
        currentInnings,
        setCurrentInnings,
        currentOver,
        setCurrentOver,
        currentBall,
        setCurrentBall,
        totalRuns,
        setTotalRuns,
        wickets,
        setWickets,
        overSummary,
        setOverSummary,
        isMatchComplete,
        setIsMatchComplete,
        stateHistory,
        setStateHistory,
        inningsData,
        setInningsData,
        targetRuns,
        setTargetRuns
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}