import { useState } from 'react';
import { useGameContext } from '../../contexts/GameContext';
import { ScoringButtons } from '../ScoringButtons';
import { NoBallPrompt } from '../NoBallPrompt';
import { 
  addBallToMatch, 
  updateMatchState, 
  createNewOver, 
  deleteLastBall,
  markInningsComplete 
} from '../../services/matchService';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { GameState } from '../../types';

interface ScoringControllerProps {
  matchId: string;
}

export function ScoringController({ matchId }: ScoringControllerProps) {
  const {
    totalOvers,
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
  } = useGameContext();
  
  const [showNoBallPrompt, setShowNoBallPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEndingInnings, setIsEndingInnings] = useState(false);
  const [firstInningsComplete, setFirstInningsComplete] = useState(false);
  const [isStartingSecondInnings, setIsStartingSecondInnings] = useState(false);

  const addBall = async (runs: number, isWide = false, isNoBall = false) => {
    // Save current state to history
    setStateHistory((prev: GameState[]) => [...prev, {
      totalRuns,
      wickets,
      currentOver,
      currentBall,
      overSummary: JSON.parse(JSON.stringify(overSummary)),
      isMatchComplete,
      currentInnings,
      targetRuns,
      inningsData: JSON.parse(JSON.stringify(inningsData))
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
          currentOverSummary,
          currentInnings
        );
        
        // Check if match is won in second innings
        if (currentInnings === 2 && targetRuns && newTotalRuns >= targetRuns) {
          newIsMatchComplete = true;
        }
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
          currentOverSummary,
          currentInnings
        );
        
        // Check if match is won in second innings
        if (currentInnings === 2 && targetRuns && newTotalRuns >= targetRuns) {
          newIsMatchComplete = true;
        } else if (currentOverSummary[currentOver].legalBalls === 6) {
          if (currentOver + 1 < Number(totalOvers)) {
            newCurrentOver = currentOver + 1;
            newCurrentBall = 0;
            currentOverSummary.push({ balls: [], totalRuns: 0, legalBalls: 0, wickets: 0 });
            
            // Create new over in database
            await createNewOver(matchId, newCurrentOver, currentInnings);
          } else {
            // End of innings
            if (currentInnings === 1) {
              // First innings complete, but don't automatically start second innings
              // First update all state so the UI shows the last ball
              // Update local state
              setTotalRuns(newTotalRuns);
              setCurrentOver(newCurrentOver);
              setCurrentBall(newCurrentBall);
              setOverSummary(currentOverSummary);
              
              // Update match state in database
              await updateMatchState(
                matchId,
                newTotalRuns,
                wickets,
                newCurrentOver,
                newCurrentBall,
                false,
                currentInnings
              );

              // Wait a brief moment so the user can see the final ball before showing innings complete
              setTimeout(async () => {
                // Just mark it as completed in the database
                await markInningsComplete(matchId, 1);
                
                // Update local innings data
                const updatedInningsData = {
                  ...inningsData,
                  innings1: {
                    ...inningsData.innings1,
                    totalRuns: newTotalRuns,
                    wickets,
                    currentOver: newCurrentOver,
                    currentBall: newCurrentBall,
                    overSummary: currentOverSummary,
                    isComplete: true
                  }
                };
                
                setInningsData(updatedInningsData);
                setFirstInningsComplete(true);
                setIsLoading(false);
              }, 500);
              return;
            } else {
              // Second innings complete, match is over
              newIsMatchComplete = true;
            }
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
        newIsMatchComplete,
        currentInnings
      );
      
      // Update local state
      setTotalRuns(newTotalRuns);
      setCurrentOver(newCurrentOver);
      setCurrentBall(newCurrentBall);
      setOverSummary(currentOverSummary);
      setIsMatchComplete(newIsMatchComplete);
      
      // Update innings data
      const updatedInningsData = { ...inningsData };
      if (currentInnings === 1) {
        updatedInningsData.innings1 = {
          totalRuns: newTotalRuns,
          wickets,
          currentOver: newCurrentOver,
          currentBall: newCurrentBall,
          overSummary: currentOverSummary,
          isComplete: false
        };
      } else {
        updatedInningsData.innings2 = {
          totalRuns: newTotalRuns,
          wickets,
          currentOver: newCurrentOver,
          currentBall: newCurrentBall,
          overSummary: currentOverSummary,
          isComplete: newIsMatchComplete
        };
      }
      setInningsData(updatedInningsData);
      
    } catch (err) {
      setError('Failed to add ball');
      console.error(err);
    } finally {
      if (!firstInningsComplete) {
        setIsLoading(false);
      }
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
        isMatchComplete,
        currentInnings,
        targetRuns,
        inningsData: JSON.parse(JSON.stringify(inningsData))
      }]);

      setIsLoading(true);
      setError(null);
      
      try {
        if (overSummary[currentOver]?.legalBalls >= 6) {
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
          currentOverSummary,
          currentInnings
        );
        
        // Check if all out
        let inningsOver = false;
        if (newWickets === 10) {
          inningsOver = true;
        } 
        
        if (currentOverSummary[currentOver].legalBalls === 6) {
          if (currentOver + 1 < Number(totalOvers)) {
            newCurrentOver = currentOver + 1;
            newCurrentBall = 0;
            currentOverSummary.push({ balls: [], totalRuns: 0, legalBalls: 0, wickets: 0 });
            
            // Create new over in database
            await createNewOver(matchId, newCurrentOver, currentInnings);
          } else {
            inningsOver = true;
          }
        }
        
        if (inningsOver && currentInnings === 1) {
          // First innings complete, but don't automatically start second innings
          await markInningsComplete(matchId, 1);
          
          // Update local innings data
          const updatedInningsData = {
            ...inningsData,
            innings1: {
              ...inningsData.innings1,
              totalRuns,
              wickets: newWickets,
              currentOver: newCurrentOver,
              currentBall: newCurrentBall,
              overSummary: currentOverSummary,
              isComplete: true
            }
          };
          
          setInningsData(updatedInningsData);
          setFirstInningsComplete(true);
          
          setIsLoading(false);
          return;
        } else if (inningsOver && currentInnings === 2) {
          // Second innings complete, match is over
          newIsMatchComplete = true;
        }
        
        // Update match state in database
        await updateMatchState(
          matchId,
          totalRuns,
          newWickets,
          newCurrentOver,
          newCurrentBall,
          newIsMatchComplete,
          currentInnings
        );
        
        // Update local state
        setWickets(newWickets);
        setCurrentOver(newCurrentOver);
        setCurrentBall(newCurrentBall);
        setOverSummary(currentOverSummary);
        setIsMatchComplete(newIsMatchComplete);
        
        // Update innings data
        const updatedInningsData = { ...inningsData };
        if (currentInnings === 1) {
          updatedInningsData.innings1 = {
            totalRuns,
            wickets: newWickets,
            currentOver: newCurrentOver,
            currentBall: newCurrentBall,
            overSummary: currentOverSummary,
            isComplete: inningsOver
          };
        } else {
          updatedInningsData.innings2 = {
            totalRuns,
            wickets: newWickets,
            currentOver: newCurrentOver,
            currentBall: newCurrentBall,
            overSummary: currentOverSummary,
            isComplete: newIsMatchComplete
          };
        }
        setInningsData(updatedInningsData);
        
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
        await deleteLastBall(matchId, currentOver, currentInnings);
        
        // Update match state in database
        await updateMatchState(
          matchId,
          previousState.totalRuns,
          previousState.wickets,
          previousState.currentOver,
          previousState.currentBall,
          previousState.isMatchComplete,
          previousState.currentInnings || currentInnings
        );
        
        // Restore previous state
        setTotalRuns(previousState.totalRuns);
        setWickets(previousState.wickets);
        setCurrentOver(previousState.currentOver);
        setCurrentBall(previousState.currentBall);
        setOverSummary(JSON.parse(JSON.stringify(previousState.overSummary)));
        setIsMatchComplete(previousState.isMatchComplete);
        
        if (previousState.currentInnings) {
          setCurrentInnings(previousState.currentInnings);
        }
        
        if (previousState.inningsData) {
          setInningsData(JSON.parse(JSON.stringify(previousState.inningsData)));
        }
        
        if (previousState.targetRuns) {
          setTargetRuns(previousState.targetRuns);
        }
        
        // Remove the used state from history
        setStateHistory((prev: GameState[]) => prev.slice(0, -1));
        
        // Ensure the current over exists in the over summary
        ensureOverExists(previousState.currentOver, previousState.overSummary);
        
      } catch (err) {
        setError('Failed to undo last action');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Helper function to ensure that the current over exists in overSummary
  const ensureOverExists = (overNumber: number, summaryArray: OverSummaryType[]) => {
    // If the over doesn't exist in the array, add it
    if (!summaryArray[overNumber]) {
      const newOverSummary = [...summaryArray];
      newOverSummary[overNumber] = { balls: [], totalRuns: 0, legalBalls: 0, wickets: 0 };
      setOverSummary(newOverSummary);
    }
  };

  const handleEndInnings = async () => {
    setIsEndingInnings(true);
    setError(null);
    
    try {
      await markInningsComplete(matchId, 1);
      
      // Update local innings data
      const updatedInningsData = {
        ...inningsData,
        innings1: {
          ...inningsData.innings1,
          totalRuns,
          wickets,
          currentOver,
          currentBall,
          overSummary,
          isComplete: true
        }
      };
      
      setInningsData(updatedInningsData);
      setFirstInningsComplete(true);
    } catch (err) {
      setError('Failed to end innings');
      console.error(err);
    } finally {
      setIsEndingInnings(false);
    }
  };

  const handleStartSecondInnings = async () => {
    setIsStartingSecondInnings(true);
    setError(null);
    
    try {
      // Set up second innings
      setCurrentInnings(2);
      setTargetRuns(inningsData.innings1.totalRuns + 1);
      setCurrentOver(0);
      setCurrentBall(0);
      setTotalRuns(0);
      setWickets(0);
      setOverSummary([{ balls: [], totalRuns: 0, legalBalls: 0, wickets: 0 }]);
      setFirstInningsComplete(false);
    } catch (err) {
      setError('Failed to start second innings');
      console.error(err);
    } finally {
      setIsStartingSecondInnings(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-4"><LoadingSpinner /></div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  // Show first innings summary and start second innings button
  if (firstInningsComplete) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h2 className="text-xl font-bold text-center mb-4">First Innings Complete</h2>
        
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mb-4">
          <div className="text-center mb-2">
            <div className="text-2xl font-bold">
              {inningsData.innings1.totalRuns}/{inningsData.innings1.wickets}
            </div>
            <div>
              in {inningsData.innings1.currentOver}.{inningsData.innings1.currentBall} overs
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 mb-4 text-center">
          <div className="text-lg font-semibold text-yellow-800">
            Target: {inningsData.innings1.totalRuns + 1} runs
          </div>
        </div>
        
        <button
          onClick={handleStartSecondInnings}
          disabled={isStartingSecondInnings}
          className={`w-full ${
            isStartingSecondInnings
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          } text-white py-3 rounded-lg font-semibold`}
        >
          {isStartingSecondInnings ? 'Starting...' : 'Start Second Innings'}
        </button>
      </div>
    );
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

      {currentInnings === 1 && !firstInningsComplete && (
        <button
          onClick={handleEndInnings}
          disabled={isEndingInnings}
          className={`w-full ${
            isEndingInnings
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-yellow-500 hover:bg-yellow-600'
          } text-white py-3 rounded-lg font-semibold mb-4`}
        >
          {isEndingInnings ? 'Ending Innings...' : 'End First Innings'}
        </button>
      )}

      {showNoBallPrompt && (
        <NoBallPrompt onRunsSelected={handleNoBallRuns} />
      )}
    </>
  );
}