import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameContext } from '../contexts/GameContext';
import { useMatchData } from '../hooks/useMatchData';
import { calculateRunRate, formatOvers } from '../utils/scoreUtils';
import { Ball } from './Ball';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { InningsState } from '../types';

interface MatchCompleteProps {
  isSpectatorMode?: boolean;
}

export function MatchComplete({ isSpectatorMode = false }: MatchCompleteProps) {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  
  const {
    totalOvers,
    currentInnings,
    currentOver,
    currentBall,
    totalRuns,
    wickets,
    overSummary,
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
  
  const { isLoading, error, loadMatchData } = useMatchData(matchId || '', isSpectatorMode);
  
  // Determine match result
  const getMatchResult = () => {
    if (!inningsData) return "";
    
    const { innings1, innings2 } = inningsData;
    
    if (innings2.totalRuns > innings1.totalRuns) {
      const wicketsLost = innings2.wickets;
      return `Team 2 won by ${10 - wicketsLost} wickets`;
    } else if (innings1.totalRuns > innings2.totalRuns) {
      const runDifference = innings1.totalRuns - innings2.totalRuns;
      return `Team 1 won by ${runDifference} runs`;
    } else {
      return "Match tied";
    }
  };

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
        }
      } catch (err) {
        console.error("Error loading match data:", err);
      }
    }
    
    loadData();
  }, [matchId]);

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
            onClick={() => navigate(isSpectatorMode ? '/watch' : '/')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {isSpectatorMode ? "Back to Match List" : "Back to Home"}
          </button>
        </div>
      </div>
    );
  }

  function renderInningsDetails(inningsNumber: number, inningsData: InningsState, totalOvers: number) {
    return (
      <div key={`innings-${inningsNumber}`} className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className={`${inningsNumber === 1 ? 'bg-blue-700' : 'bg-green-700'} text-white p-4`}>
          <h3 className="text-xl font-bold">Innings {inningsNumber}</h3>
        </div>
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-3xl font-bold mb-2">
              {inningsData.totalRuns}/{inningsData.wickets}
            </div>
            <div className="text-lg text-gray-600">
              in {formatOvers(inningsData.currentOver, inningsData.currentBall)} overs
            </div>
            <div className="text-lg text-gray-600 mt-1">
              Run Rate: {calculateRunRate(inningsData.totalRuns, inningsData.currentOver, inningsData.currentBall)}
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-3">Over by Over Details</h4>
            <div className="space-y-3">
              {inningsData.overSummary.map((over, overIndex) => (
                <div key={overIndex} className="bg-gray-50 p-3 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Over {overIndex + 1}</span>
                    <span>{over.totalRuns} runs, {over.wickets} wicket(s)</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {over.balls.map((ball, ballIndex) => (
                      <Ball key={ballIndex} ball={ball} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-purple-700 text-white p-4">
            <h2 className="text-xl font-bold">Match Results</h2>
          </div>
          <div className="p-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6 text-center">
              <div className="text-2xl font-bold text-yellow-800 mb-2">
                {getMatchResult()}
              </div>
              <div className="text-lg">
                Final Score: <span className="font-semibold">Team 1 {inningsData?.innings1.totalRuns}/{inningsData?.innings1.wickets}</span> vs 
                <span className="font-semibold"> Team 2 {inningsData?.innings2.totalRuns}/{inningsData?.innings2.wickets}</span>
              </div>
            </div>
            
            {inningsData && (
              <>
                {renderInningsDetails(1, inningsData.innings1, totalOvers)}
                {renderInningsDetails(2, inningsData.innings2, totalOvers)}
              </>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate(isSpectatorMode ? '/watch' : '/')}
            className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 font-semibold"
          >
            {isSpectatorMode ? "Back to Match List" : "Back to Home"}
          </button>
        </div>
      </div>
    </div>
  );
}