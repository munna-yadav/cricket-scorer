import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameContext } from '../contexts/GameContext';
import { useMatchData } from '../hooks/useMatchData';
import { calculateRunRate, formatOvers } from '../utils/scoreUtils';
import { Ball } from './Ball';
import { LoadingSpinner } from './ui/LoadingSpinner';

export function MatchComplete() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  
  const {
    totalOvers,
    currentOver,
    currentBall,
    totalRuns,
    wickets,
    overSummary,
    setTotalOvers,
    setCurrentOver,
    setCurrentBall,
    setTotalRuns,
    setWickets,
    setOverSummary,
    setIsMatchComplete
  } = useGameContext();
  
  const { isLoading, error, loadMatchData } = useMatchData(matchId || '', true);

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
            onClick={() => navigate('/')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-green-700 text-white p-4">
            <h2 className="text-xl font-bold">Match Completed</h2>
          </div>
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="text-4xl font-bold mb-2">
                {totalRuns}/{wickets}
              </div>
              <div className="text-xl text-gray-600">
                in {formatOvers(currentOver, currentBall)} overs
              </div>
              <div className="text-lg text-gray-600 mt-2">
                Run Rate: {calculateRunRate(totalRuns, currentOver, currentBall)}
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Match Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Total Runs</div>
                  <div className="text-2xl font-bold">{totalRuns}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Wickets</div>
                  <div className="text-2xl font-bold">{wickets}</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Over by Over Details</h3>
              <div className="space-y-3">
                {overSummary.map((over, overIndex) => (
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

        <div className="flex gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 font-semibold"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}