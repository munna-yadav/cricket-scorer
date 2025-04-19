import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Scoreboard } from '../Scoreboard';
import { OverSummary } from '../OverSummary';
import { ScoringController } from './ScoringController';
import { useGameContext } from '../../contexts/GameContext';
import { useMatchData } from '../../hooks/useMatchData';
import { calculateRunRate, formatOvers } from '../../utils/scoreUtils';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { markMatchComplete } from '../../services/matchService';

interface PlayMatchProps {
  isSpectatorMode?: boolean;
}

export function PlayMatch({ isSpectatorMode = false }: PlayMatchProps) {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const [markingComplete, setMarkingComplete] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);
  
  const pollingIntervalRef = useRef<number | null>(null);

  const {
    totalOvers,
    currentInnings,
    currentOver,
    currentBall,
    totalRuns,
    wickets,
    overSummary,
    isMatchComplete,
    inningsData,
    targetRuns,
    setTotalOvers,
    setCurrentInnings,
    setCurrentOver,
    setCurrentBall,
    setTotalRuns,
    setWickets,
    setOverSummary,
    setIsMatchComplete,
    setInningsData,
    setTargetRuns
  } = useGameContext();
  
  const { 
    isLoading, 
    error, 
    loadMatchData 
  } = useMatchData(matchId || '', isSpectatorMode);

  // Calculate required run rate and runs needed
  const calculateRequiredRunRate = () => {
    if (currentInnings !== 2 || !targetRuns) return "0.00";
    
    const runsNeeded = targetRuns - totalRuns;
    if (runsNeeded <= 0) return "0.00";
    
    const ballsCompleted = currentOver * 6 + currentBall;
    const ballsTotal = Number(totalOvers) * 6;
    const ballsRemaining = ballsTotal - ballsCompleted;
    
    if (ballsRemaining === 0) return "N/A";
    
    return ((runsNeeded / ballsRemaining) * 6).toFixed(2);
  };
  
  const calculateRunsRequired = () => {
    if (currentInnings !== 2 || !targetRuns) return 0;
    return Math.max(0, targetRuns - totalRuns);
  };
  
  const calculateBallsRemaining = () => {
    if (currentInnings !== 2) return 0;
    const ballsCompleted = currentOver * 6 + currentBall;
    const ballsTotal = Number(totalOvers) * 6;
    return ballsTotal - ballsCompleted;
  };

  // Load match data when the component mounts or matchId changes
  useEffect(() => {
    if (!matchId) {
      navigate('/');
      return;
    }
    
    async function loadData() {
      try {
        const data = await loadMatchData();
        if (data) {
          setTotalOvers(data.totalOvers);
          setCurrentInnings(data.currentInnings);
          setCurrentOver(data.currentOver);
          setCurrentBall(data.currentBall);
          setTotalRuns(data.totalRuns);
          setWickets(data.wickets);
          setOverSummary(data.overSummary);
          setIsMatchComplete(data.isMatchComplete);
          setInningsData(data.inningsData);
          setTargetRuns(data.targetRuns);
          
          // Ensure the current over exists in overSummary
          ensureOverExists(data.currentOver, data.overSummary);
          
          // Redirect to completed match view if the match is complete (for both spectator and scorer)
          if (data.isMatchComplete) {
            navigate(`/${isSpectatorMode ? 'watch' : 'match'}/${matchId}/completed`);
          }
        }
      } catch (err) {
        console.error("Error loading match data:", err);
      }
    }
    
    // Initial data load
    loadData();
    
    // Set up polling for spectator mode (only if match is not complete)
    if (isSpectatorMode && !isMatchComplete) {
      // Poll every 15 seconds for new data in spectator mode
      pollingIntervalRef.current = window.setInterval(() => {
        loadData();
      }, 15000);
    }
    
    return () => {
      // Clean up interval on component unmount
      if (pollingIntervalRef.current !== null) {
        window.clearInterval(pollingIntervalRef.current);
      }
    };
  }, [matchId, isSpectatorMode, isMatchComplete]);
  
  // Helper function to ensure that the current over exists in overSummary
  const ensureOverExists = (overNumber: number, summaryArray: OverSummaryType[]) => {
    // If the over doesn't exist in the array, add it
    if (!summaryArray[overNumber]) {
      const newOverSummary = [...summaryArray];
      newOverSummary[overNumber] = { balls: [], totalRuns: 0, legalBalls: 0, wickets: 0 };
      setOverSummary(newOverSummary);
    }
  };

  // Detect when match completes during play
  useEffect(() => {
    if (isMatchComplete && !isSpectatorMode) {
      navigate(`/match/${matchId}/completed`);
    }
  }, [isMatchComplete, matchId, navigate, isSpectatorMode]);

  // Function to handle marking a match as complete
  const handleMarkComplete = async () => {
    if (!matchId) return;
    
    setMarkingComplete(true);
    setCompleteError(null);
    
    try {
      await markMatchComplete(matchId);
      setIsMatchComplete(true);
      navigate(`/match/${matchId}/completed`);
    } catch (err) {
      console.error("Error marking match as complete:", err);
      setCompleteError("Failed to mark match as complete");
    } finally {
      setMarkingComplete(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-4">Error Loading Match</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Convert totalOvers from string or empty to number, or default to 0
  const numTotalOvers = typeof totalOvers === 'string' ? 
    (totalOvers ? parseInt(totalOvers) : 0) : 
    (totalOvers || 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <Scoreboard
          totalRuns={totalRuns}
          wickets={wickets}
          currentOver={currentOver}
          currentBall={currentBall}
          totalOvers={numTotalOvers}
          runRate={calculateRunRate(totalRuns, currentOver, currentBall)}
          overSummary={overSummary}
          formatOvers={formatOvers}
          currentInnings={currentInnings}
          targetRuns={currentInnings === 2 ? targetRuns : undefined}
          requiredRunRate={currentInnings === 2 ? calculateRequiredRunRate() : undefined}
          runsRequired={currentInnings === 2 ? calculateRunsRequired() : undefined}
          ballsRemaining={currentInnings === 2 ? calculateBallsRemaining() : undefined}
        />

        {!isSpectatorMode && matchId && (
          <ScoringController matchId={matchId} />
        )}

        <OverSummary overSummary={overSummary} />

        {completeError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
            {completeError}
          </div>
        )}

        <div className="mt-4 space-y-2">
          {!isSpectatorMode && !isMatchComplete && (
            <button
              onClick={handleMarkComplete}
              disabled={markingComplete}
              className={`w-full ${
                markingComplete 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-orange-500 hover:bg-orange-600'
              } text-white py-3 rounded-lg font-semibold`}
            >
              {markingComplete ? 'Marking Complete...' : 'Mark Match Complete'}
            </button>
          )}
          
          <button
            onClick={() => navigate(isSpectatorMode ? '/watch' : '/')}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 font-semibold"
          >
            {isSpectatorMode ? "Back to Match List" : "Back to Home"}
          </button>
        </div>
      </div>
    </div>
  );
}