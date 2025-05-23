import React from 'react';
import { Ball } from './Ball';
import { OverSummaryType } from '../types';

interface ScoreboardProps {
  totalRuns: number;
  wickets: number;
  currentOver: number;
  currentBall: number;
  totalOvers: number;
  runRate: string;
  overSummary: OverSummaryType[];
  formatOvers: (overs: number, balls: number) => string;
  currentInnings: number;
  targetRuns?: number;
  requiredRunRate?: string;
  runsRequired?: number;
  ballsRemaining?: number;
  matchId?: string;
  isSpectatorMode?: boolean;
}

export function Scoreboard({
  totalRuns,
  wickets,
  currentOver,
  currentBall,
  totalOvers,
  runRate,
  overSummary,
  formatOvers,
  currentInnings,
  targetRuns,
  requiredRunRate,
  runsRequired,
  ballsRemaining,
  matchId,
  isSpectatorMode
}: ScoreboardProps) {
  
  // Function to handle the copy link button
  const handleCopyLink = () => {
    if (!matchId) return;
    
    const shareUrl = `${window.location.origin}/watch/${matchId}`;
    
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        const copyButton = document.getElementById('copy-button');
        if (copyButton) {
          copyButton.textContent = 'Copied! ✓';
          copyButton.classList.remove('bg-green-600');
          copyButton.classList.add('bg-green-500');
          
          setTimeout(() => {
            copyButton.textContent = 'Share Match';
            copyButton.classList.remove('bg-green-500');
            copyButton.classList.add('bg-green-600');
          }, 2000);
        }
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
      <div className={`${currentInnings === 1 ? 'bg-blue-700' : 'bg-green-700'} text-white p-4 relative`}>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Scorecard - Innings {currentInnings}</h2>
          
          {!isSpectatorMode && matchId && (
            <button 
              id="copy-button"
              onClick={handleCopyLink}
              className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded-full flex items-center"
            >
              Share Match
            </button>
          )}
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-baseline mb-4">
          <div className="text-4xl font-bold">
            {totalRuns}/{wickets}
          </div>
          <div className="text-xl">
            {formatOvers(currentOver, currentBall)}/{totalOvers} overs
          </div>
        </div>
        
        <div className="space-y-2">
          <div>
            <span className="text-gray-600">Run Rate</span>
            <div className="text-xl font-semibold">{runRate}</div>
          </div>
          
          {currentInnings === 2 && targetRuns && (
            <div className="mt-3 border-t border-gray-200 pt-3">
              <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                <h3 className="text-lg font-semibold mb-2 text-yellow-800">Target: {targetRuns} runs</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-gray-600 text-sm">Required Runs</span>
                    <div className="text-lg font-semibold">{runsRequired}</div>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Req. Rate</span>
                    <div className="text-lg font-semibold">{requiredRunRate}</div>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Balls Left</span>
                    <div className="text-lg font-semibold">{ballsRemaining}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-3">
            <span className="text-gray-600">This Over</span>
            <div className="flex gap-2 mt-1 flex-wrap">
              {overSummary[currentOver]?.balls.map((ball, idx) => (
                <Ball key={idx} ball={ball} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}