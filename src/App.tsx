import React, { useState } from 'react';
import { Scoreboard } from './components/Scoreboard';
import { ScoringButtons } from './components/ScoringButtons';
import { OverSummary } from './components/OverSummary';
import { MatchComplete } from './components/MatchComplete';
import { StartGame } from './components/StartGame';
import { NoBallPrompt } from './components/NoBallPrompt';
import { OverSummary as OverSummaryType } from './types';

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

  const resetGame = () => {
    setGameStarted(false);
    setTotalOvers('');
    setCurrentOver(0);
    setCurrentBall(0);
    setTotalRuns(0);
    setWickets(0);
    setOverSummary([]);
    setIsMatchComplete(false);
  };

  const handleStartGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalOvers) {
      setGameStarted(true);
      setIsMatchComplete(false);
      setOverSummary([{ balls: [], totalRuns: 0, legalBalls: 0, wickets: 0 }]);
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
    const currentOverSummary = [...overSummary];
    
    if (isWide || isNoBall) {
      setTotalRuns(prev => prev + 1 + (isNoBall ? runs : 0));
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
      setTotalRuns(prev => prev + runs);
      currentOverSummary[currentOver].balls.push({ runs });
      currentOverSummary[currentOver].totalRuns += runs;
      currentOverSummary[currentOver].legalBalls += 1;
      setCurrentBall(prev => prev + 1);

      if (currentOverSummary[currentOver].legalBalls === 6) {
        if (currentOver + 1 < Number(totalOvers)) {
          setCurrentOver(prev => prev + 1);
          setCurrentBall(0);
          currentOverSummary.push({ balls: [], totalRuns: 0, legalBalls: 0, wickets: 0 });
        } else {
          setIsMatchComplete(true);
        }
      }
    }
    
    setOverSummary(currentOverSummary);
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
      if (overSummary[currentOver].legalBalls >= 6) {
        return; // Prevent adding more than 6 legal balls
      }
      setWickets(prev => prev + 1);
      const currentOverSummary = [...overSummary];
      currentOverSummary[currentOver].balls.push({ runs: 0, isWicket: true });
      currentOverSummary[currentOver].wickets += 1;
      currentOverSummary[currentOver].legalBalls += 1;
      setCurrentBall(prev => prev + 1);

      if (currentOverSummary[currentOver].legalBalls === 6) {
        if (currentOver + 1 < Number(totalOvers)) {
          setCurrentOver(prev => prev + 1);
          setCurrentBall(0);
          currentOverSummary.push({ balls: [], totalRuns: 0, legalBalls: 0, wickets: 0 });
        } else {
          setIsMatchComplete(true);
        }
      }
      
      setOverSummary(currentOverSummary);
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