import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Scoreboard } from '../Scoreboard';
import { OverSummary } from '../OverSummary';
import { ScoringController } from './ScoringController';
import { useGameContext } from '../../contexts/GameContext';
import { useMatchData } from '../../hooks/useMatchData';
import { calculateRunRate, formatOvers } from '../../utils/scoreUtils';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { RefreshButton } from '../ui/RefreshButton';
import { markMatchComplete } from '../../services/matchService';
import { ArrowLeft } from 'lucide-react';

interface PlayMatchProps {
  isSpectatorMode?: boolean;
}

export function PlayMatch({ isSpectatorMode = false }: PlayMatchProps) {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const [markingComplete, setMarkingComplete] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const {
    totalOvers,
    currentOver,
    currentBall,
    totalRuns,
    wickets,
    overSummary,
    isMatchComplete,
    setTotalOvers,
    setCurrentOver,
    setCurrentBall,
    setTotalRuns,
    setWickets,
    setOverSummary,
    setIsMatchComplete
  } = useGameContext();
  
  const { 
    isLoading, 
    error, 
    loadMatchData 
  } = useMatchData(matchId || '', isSpectatorMode);

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
          setCurrentOver(data.currentOver);
          setCurrentBall(data.currentBall);
          setTotalRuns(data.totalRuns);
          setWickets(data.wickets);
          setOverSummary(data.overSummary);
          setIsMatchComplete(data.isMatchComplete);
          
          // Redirect to completed match view if the match is complete
          if (data.isMatchComplete && !isSpectatorMode) {
            navigate(`/match/${matchId}/completed`);
          }
        }
      } catch (err) {
        console.error("Error loading match data:", err);
      }
    }
    
    loadData();
  }, [matchId]);

  // Detect when match completes during play
  useEffect(() => {
    if (isMatchComplete && !isSpectatorMode) {
      navigate(`/match/${matchId}/completed`);
    }
  }, [isMatchComplete, matchId, navigate, isSpectatorMode]);

  // Function to handle refreshing match data
  const handleRefresh = async () => {
    if (!matchId) return;
    
    setRefreshing(true);
    try {
      const data = await loadMatchData();
      if (data) {
        setTotalOvers(data.totalOvers);
        setCurrentOver(data.currentOver);
        setCurrentBall(data.currentBall);
        setTotalRuns(data.totalRuns);
        setWickets(data.wickets);
        setOverSummary(data.overSummary);
        setIsMatchComplete(data.isMatchComplete);
      }
    } catch (err) {
      console.error("Error refreshing match data:", err);
    } finally {
      setRefreshing(false);
    }
  };

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

  if (isLoading && !refreshing) {
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
            className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 flex items-center justify-center"
          >
            <ArrowLeft size={24} />
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
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigate(isSpectatorMode ? '/watch' : '/')}
            className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft size={24} />
          </button>
          
          {isSpectatorMode && (
            <RefreshButton 
              onClick={handleRefresh}
              isLoading={refreshing}
            />
          )}
        </div>
        
        <Scoreboard
          totalRuns={totalRuns}
          wickets={wickets}
          currentOver={currentOver}
          currentBall={currentBall}
          totalOvers={numTotalOvers}
          runRate={calculateRunRate(totalRuns, currentOver, currentBall)}
          overSummary={overSummary}
          formatOvers={formatOvers}
        />

        {!isSpectatorMode && matchId && (
          <ScoringController matchId={matchId} />
        )}

        <OverSummary 
          overSummary={overSummary} 
          currentOver={currentOver}
          isMatchComplete={isMatchComplete}
        />

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
          
          {/* Back button at the bottom as well, as a circular button */}
          <div className="flex justify-center mt-4">
            <button
              onClick={() => navigate(isSpectatorMode ? '/watch' : '/')}
              className="bg-blue-500 text-white p-4 rounded-full hover:bg-blue-600 flex items-center justify-center shadow-md"
              aria-label="Back"
            >
              <ArrowLeft size={28} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 