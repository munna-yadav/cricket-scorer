import React, { useState, useEffect } from 'react';
import { Scoreboard } from './components/Scoreboard';
import { ScoringButtons } from './components/ScoringButtons';
import { OverSummary } from './components/OverSummary';
import { MatchComplete } from './components/MatchComplete';
import { StartGame } from './components/StartGame';
import { NoBallPrompt } from './components/NoBallPrompt';
import { OverSummary as OverSummaryType } from './types';
import { ArrowLeft } from 'lucide-react';

function App() {
  const [totalOvers, setTotalOvers] = useState<number | ''>('');
  const [gameStarted, setGameStarted] = useState(false);
  const [currentOver, setCurrentOver] = useState(0);
  const [currentBall, setCurrentBall] = useState(0);
  const [totalRuns, setTotalRuns] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [overSummary, setOverSummary] = useState<OverSummaryType[]>([]);
  const [showNoBallPrompt, setShowNoBallPrompt] = useState(false);
  const [isMatchComplete, setIsMatchComplete] = useState(false);
  const [stateHistory, setStateHistory] = useState<Array<{
    totalRuns: number;
    wickets: number;
    currentOver: number;
    currentBall: number;
    overSummary: OverSummaryType[];
    isMatchComplete: boolean;
  }>>([]);

  // Load game state from localStorage on component mount
  useEffect(() => {
    const savedState = localStorage.getItem('cricketGameState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        
        // Only restore if it was a started game
        if (parsedState.gameStarted) {
          setTotalOvers(parsedState.totalOvers);
          setGameStarted(true); // Explicitly set to true
          setCurrentOver(parsedState.currentOver);
          setCurrentBall(parsedState.currentBall);
          setTotalRuns(parsedState.totalRuns);
          setWickets(parsedState.wickets);
          setOverSummary(parsedState.overSummary);
          setIsMatchComplete(parsedState.isMatchComplete);
        }
      } catch (error) {
        // If there's any error in parsing, clear the localStorage
        localStorage.removeItem('cricketGameState');
      }
    }
  }, []);

  const resetGame = () => {
    // Clear localStorage when resetting the game
    localStorage.removeItem('cricketGameState');
    
    setGameStarted(false);
    setTotalOvers('');
    setCurrentOver(0);
    setCurrentBall(0);
    setTotalRuns(0);
    setWickets(0);
    setOverSummary([]);
    setIsMatchComplete(false);
    setStateHistory([]); // Clear the history
  };

  const handleStartGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalOvers) {
      const initialGameState = {
        totalOvers,
        gameStarted: true,
        currentOver: 0,
        currentBall: 0,
        totalRuns: 0,
        wickets: 0,
        overSummary: [{ balls: [], totalRuns: 0, legalBalls: 0, wickets: 0 }],
        isMatchComplete: false
      };
      
      // Save initial game state
      localStorage.setItem('cricketGameState', JSON.stringify(initialGameState));
      
      // Update state
      setGameStarted(true);
      setIsMatchComplete(false);
      setOverSummary([{ balls: [], totalRuns: 0, legalBalls: 0, wickets: 0 }]);
      setStateHistory([]); // Initialize empty history
    }
  };

  const calculateRunRate = () => {
    const completedOvers = currentOver + (currentBall / 6);
    if (completedOvers === 0) return "0.00";
    return (totalRuns / completedOvers).toFixed(2);
  };

  const formatOvers = (overs: number, balls: number) => {
    return balls === 6 ? (overs + 1).toString() : `${overs}.${balls}`;
  };

  const addBall = (runs: number, isWide = false, isNoBall = false) => {
    // Save the current state to history BEFORE making any changes
    const currentState = {
      totalRuns,
      wickets,
      currentOver,
      currentBall,
      overSummary: JSON.parse(JSON.stringify(overSummary)),
      isMatchComplete
    };
    setStateHistory(prev => [...prev, currentState]);

    const currentOverSummary = JSON.parse(JSON.stringify(overSummary)); // Deep copy
    let newCurrentBall = currentBall;
    let newCurrentOver = currentOver;
    let newIsMatchComplete = isMatchComplete;
    let newTotalRuns = totalRuns;
    
    if (isWide || isNoBall) {
      newTotalRuns += 1 + (isNoBall ? runs : 0);
      setTotalRuns(newTotalRuns);
      
      currentOverSummary[currentOver].balls.push({ 
        runs: isNoBall ? runs : 1, 
        isWide, 
        isNoBall 
      });
      currentOverSummary[currentOver].totalRuns += isNoBall ? runs + 1 : 1;
    } else {
      if (currentOverSummary[currentOver].legalBalls >= 6) {
        return; // Prevent adding more than 6 legal balls
      }
      
      newTotalRuns += runs;
      setTotalRuns(newTotalRuns);
      
      currentOverSummary[currentOver].balls.push({ runs });
      currentOverSummary[currentOver].totalRuns += runs;
      currentOverSummary[currentOver].legalBalls += 1;
      
      newCurrentBall = currentBall + 1;
      setCurrentBall(newCurrentBall);

      if (currentOverSummary[currentOver].legalBalls === 6) {
        if (currentOver + 1 < Number(totalOvers)) {
          newCurrentOver = currentOver + 1;
          newCurrentBall = 0;
          setCurrentOver(newCurrentOver);
          setCurrentBall(newCurrentBall);
          currentOverSummary.push({ balls: [], totalRuns: 0, legalBalls: 0, wickets: 0 });
        } else {
          newIsMatchComplete = true;
          setIsMatchComplete(true);
        }
      }
    }
    
    setOverSummary(currentOverSummary);

    // Save state after ball
    const gameState = {
      totalOvers,
      gameStarted,
      currentOver: newCurrentOver,
      currentBall: newCurrentBall,
      totalRuns: newTotalRuns,
      wickets,
      overSummary: currentOverSummary,
      isMatchComplete: newIsMatchComplete,
    };
    localStorage.setItem('cricketGameState', JSON.stringify(gameState));
  };

  const handleNoBall = () => {
    setShowNoBallPrompt(true);
  };

  const handleNoBallRuns = (runs: number) => {
    addBall(runs, false, true);
    setShowNoBallPrompt(false);
  };

  const handleWicket = () => {
    if (wickets < 10) {
      // Save current state to history before making changes
      const currentState = {
        totalRuns,
        wickets,
        currentOver,
        currentBall,
        overSummary: JSON.parse(JSON.stringify(overSummary)),
        isMatchComplete
      };
      setStateHistory(prev => [...prev, currentState]);

      if (overSummary[currentOver].legalBalls >= 6) {
        return; // Prevent adding more than 6 legal balls
      }
      
      const newWickets = wickets + 1;
      setWickets(newWickets);
      
      const currentOverSummary = JSON.parse(JSON.stringify(overSummary)); // Deep copy
      currentOverSummary[currentOver].balls.push({ runs: 0, isWicket: true });
      currentOverSummary[currentOver].wickets += 1;
      currentOverSummary[currentOver].legalBalls += 1;
      
      let newCurrentBall = currentBall + 1;
      let newCurrentOver = currentOver;
      let newIsMatchComplete = isMatchComplete;
      
      setCurrentBall(newCurrentBall);

      if (currentOverSummary[currentOver].legalBalls === 6) {
        if (currentOver + 1 < Number(totalOvers)) {
          newCurrentOver = currentOver + 1;
          newCurrentBall = 0;
          setCurrentOver(newCurrentOver);
          setCurrentBall(newCurrentBall);
          currentOverSummary.push({ balls: [], totalRuns: 0, legalBalls: 0, wickets: 0 });
        } else {
          newIsMatchComplete = true;
          setIsMatchComplete(true);
        }
      }
      
      setOverSummary(currentOverSummary);

      // Save state after wicket
      const gameState = {
        totalOvers,
        gameStarted,
        currentOver: newCurrentOver,
        currentBall: newCurrentBall,
        totalRuns,
        wickets: newWickets,
        overSummary: currentOverSummary,
        isMatchComplete: newIsMatchComplete,
      };
      localStorage.setItem('cricketGameState', JSON.stringify(gameState));
    }
  };

  const handleUndo = () => {
    if (stateHistory.length > 0) {
      const previousState = stateHistory[stateHistory.length - 1];
      
      // Restore previous state
      setTotalRuns(previousState.totalRuns);
      setWickets(previousState.wickets);
      setCurrentOver(previousState.currentOver);
      setCurrentBall(previousState.currentBall);
      
      // Make sure to deep copy the overSummary to avoid reference issues
      setOverSummary(JSON.parse(JSON.stringify(previousState.overSummary)));
      setIsMatchComplete(previousState.isMatchComplete);
      
      // Remove the used state from history
      setStateHistory(prev => prev.slice(0, -1));

      // Update localStorage
      const gameState = {
        totalOvers,
        gameStarted,
        currentOver: previousState.currentOver,
        currentBall: previousState.currentBall,
        totalRuns: previousState.totalRuns,
        wickets: previousState.wickets,
        overSummary: previousState.overSummary,
        isMatchComplete: previousState.isMatchComplete,
      };
      localStorage.setItem('cricketGameState', JSON.stringify(gameState));
    }
  };

  if (!gameStarted) {
    return (
      <StartGame
        totalOvers={totalOvers}
        onOversChange={setTotalOvers}
        onSubmit={handleStartGame}
      />
    );
  }

  if (isMatchComplete) {
    return (
      <MatchComplete
        totalRuns={totalRuns}
        wickets={wickets}
        currentOver={currentOver}
        currentBall={currentBall}
        runRate={calculateRunRate()}
        overSummary={overSummary}
        onReset={resetGame}
        formatOvers={formatOvers}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <Scoreboard
          totalRuns={totalRuns}
          wickets={wickets}
          currentOver={currentOver}
          currentBall={currentBall}
          totalOvers={Number(totalOvers)}
          runRate={calculateRunRate()}
          overSummary={overSummary}
          formatOvers={formatOvers}
        />

        <ScoringButtons
          onRunScored={(runs) => addBall(runs)}
          onWide={() => addBall(1, true)}
          onNoBall={handleNoBall}
          onWicket={handleWicket}
          onUndo={handleUndo}
          canUndo={stateHistory.length > 0}
          disabled={
            currentOver === Number(totalOvers) ||
            wickets === 10 ||
            overSummary[currentOver].legalBalls >= 6
          }
        />

        <OverSummary overSummary={overSummary} />

        <div className="mt-4">
          <button
            onClick={resetGame}
            className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 font-semibold"
          >
            Reset Match
          </button>
        </div>
      </div>

      {showNoBallPrompt && (
        <NoBallPrompt onRunsSelected={handleNoBallRuns} />
      )}
    </div>
  );
}

export default App;