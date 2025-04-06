import { useState } from 'react';
import { useGameContext } from '../../contexts/GameContext';
import { ScoringButtons } from '../ScoringButtons';
import { NoBallPrompt } from '../NoBallPrompt';
import { addBallToMatch, updateMatchState, createNewOver, deleteLastBall } from '../../services/matchService';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { GameState } from '../../types';

interface ScoringControllerProps {
  matchId: string;
}

export function ScoringController({ matchId }: ScoringControllerProps) {
  const {
    totalOvers,
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
    setStateHistory
  } = useGameContext();
  
  const [showNoBallPrompt, setShowNoBallPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addBall = async (runs: number, isWide = false, isNoBall = false) => {
    // Save current state to history
    setStateHistory((prev: GameState[]) => [...prev, {
      totalRuns,
      wickets,
      currentOver,
      currentBall,
      overSummary: JSON.parse(JSON.stringify(overSummary)),
      isMatchComplete
    }]);

    setIsLoading(true);
    setError(null);
    
    try {
      // Ensure overSummary has an entry for the current over
      let currentOverSummary = JSON.parse(JSON.stringify(overSummary));
      if (!currentOverSummary[currentOver]) {
        currentOverSummary[currentOver] = { 
          balls: [], 
          totalRuns: 0, 
          legalBalls: 0, 
          wickets: 0 
        };
      }
      
      let newCurrentBall = currentBall;
      let newCurrentOver = currentOver;
      let newIsMatchComplete = isMatchComplete;
      let newTotalRuns = totalRuns;
      
      if (isWide || isNoBall) {
        newTotalRuns += 1 + (isNoBall ? runs : 0);
        
        currentOverSummary[currentOver].balls.push({ 
          runs: isNoBall ? runs : 1, 
          isWide, 
          isNoBall 
        });
        currentOverSummary[currentOver].totalRuns += isNoBall ? runs + 1 : 1;
        
        // Add ball to database
        await addBallToMatch(
          matchId,
          currentOver,
          isNoBall ? runs : 1,
          isWide,
          isNoBall,
          false,
          currentOverSummary
        );
      } else {
        if (currentOverSummary[currentOver].legalBalls >= 6) {
          return; // Prevent adding more than 6 legal balls
        }
        
        newTotalRuns += runs;
        
        currentOverSummary[currentOver].balls.push({ runs });
        currentOverSummary[currentOver].totalRuns += runs;
        currentOverSummary[currentOver].legalBalls += 1;
        
        newCurrentBall = currentBall + 1;

        // Add ball to database
        await addBallToMatch(
          matchId,
          currentOver,
          runs,
          false,
          false,
          false,
          currentOverSummary
        );

        if (currentOverSummary[currentOver].legalBalls === 6) {
          if (currentOver + 1 < Number(totalOvers)) {
            newCurrentOver = currentOver + 1;
            newCurrentBall = 0;
            currentOverSummary.push({ balls: [], totalRuns: 0, legalBalls: 0, wickets: 0 });
            
            // Create new over in database
            await createNewOver(matchId, newCurrentOver);
          } else {
            newIsMatchComplete = true;
          }
        }
      }
      
      // Update match state in database
      await updateMatchState(
        matchId,
        newTotalRuns,
        wickets,
        newCurrentOver,
        newCurrentBall,
        newIsMatchComplete
      );
      
      // Update local state
      setTotalRuns(newTotalRuns);
      setCurrentOver(newCurrentOver);
      setCurrentBall(newCurrentBall);
      setOverSummary(currentOverSummary);
      setIsMatchComplete(newIsMatchComplete);
    } catch (err) {
      setError('Failed to add ball');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNoBall = () => {
    setShowNoBallPrompt(true);
  };

  const handleNoBallRuns = (runs: number) => {
    addBall(runs, false, true);
    setShowNoBallPrompt(false);
  };

  const handleWicket = async () => {
    if (wickets < 10) {
      // Save current state to history
      setStateHistory((prev: GameState[]) => [...prev, {
        totalRuns,
        wickets,
        currentOver,
        currentBall,
        overSummary: JSON.parse(JSON.stringify(overSummary)),
        isMatchComplete
      }]);

      setIsLoading(true);
      setError(null);
      
      try {
        if (overSummary[currentOver].legalBalls >= 6) {
          return; // Prevent adding more than 6 legal balls
        }
        
        const newWickets = wickets + 1;
        const currentOverSummary = JSON.parse(JSON.stringify(overSummary));
        
        currentOverSummary[currentOver].balls.push({ runs: 0, isWicket: true });
        currentOverSummary[currentOver].wickets += 1;
        currentOverSummary[currentOver].legalBalls += 1;
        
        let newCurrentBall = currentBall + 1;
        let newCurrentOver = currentOver;
        let newIsMatchComplete = isMatchComplete;
        
        // Add ball to database
        await addBallToMatch(
          matchId,
          currentOver,
          0,
          false,
          false,
          true,
          currentOverSummary
        );

        if (currentOverSummary[currentOver].legalBalls === 6) {
          if (currentOver + 1 < Number(totalOvers)) {
            newCurrentOver = currentOver + 1;
            newCurrentBall = 0;
            currentOverSummary.push({ balls: [], totalRuns: 0, legalBalls: 0, wickets: 0 });
            
            // Create new over in database
            await createNewOver(matchId, newCurrentOver);
          } else {
            newIsMatchComplete = true;
          }
        }
        
        // Update match state in database
        await updateMatchState(
          matchId,
          totalRuns,
          newWickets,
          newCurrentOver,
          newCurrentBall,
          newIsMatchComplete
        );
        
        // Update local state
        setWickets(newWickets);
        setCurrentOver(newCurrentOver);
        setCurrentBall(newCurrentBall);
        setOverSummary(currentOverSummary);
        setIsMatchComplete(newIsMatchComplete);
      } catch (err) {
        setError('Failed to add wicket');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleUndo = async () => {
    if (stateHistory.length > 0) {
      setIsLoading(true);
      setError(null);
      
      try {
        const previousState = stateHistory[stateHistory.length - 1];
        
        // Delete the last ball from the database
        await deleteLastBall(matchId, currentOver);
        
        // Update match state in database
        await updateMatchState(
          matchId,
          previousState.totalRuns,
          previousState.wickets,
          previousState.currentOver,
          previousState.currentBall,
          previousState.isMatchComplete
        );
        
        // Restore previous state
        setTotalRuns(previousState.totalRuns);
        setWickets(previousState.wickets);
        setCurrentOver(previousState.currentOver);
        setCurrentBall(previousState.currentBall);
        setOverSummary(JSON.parse(JSON.stringify(previousState.overSummary)));
        setIsMatchComplete(previousState.isMatchComplete);
        
        // Remove the used state from history
        setStateHistory((prev: GameState[]) => prev.slice(0, -1));
      } catch (err) {
        setError('Failed to undo last action');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-4"><LoadingSpinner /></div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <>
      <ScoringButtons
        onRunScored={(runs) => addBall(runs)}
        onWide={() => addBall(1, true)}
        onNoBall={handleNoBall}
        onWicket={handleWicket}
        onUndo={handleUndo}
        canUndo={stateHistory.length > 0}
        disabled={
          wickets === 10 ||
          !overSummary[currentOver] ||
          (
            currentOver >= (
              typeof totalOvers === 'number' 
                ? totalOvers 
                : (totalOvers ? parseInt(String(totalOvers)) : 0)
            ) && currentBall >= 6
          ) ||
          (overSummary[currentOver]?.legalBalls >= 6)
        }
      />

      {showNoBallPrompt && (
        <NoBallPrompt onRunsSelected={handleNoBallRuns} />
      )}
    </>
  );
} 