import React from 'react';
import { Ball } from './Ball';
import { OverSummary } from '../types';

interface MatchCompleteProps {
  totalRuns: number;
  wickets: number;
  currentOver: number;
  currentBall: number;
  runRate: string;
  overSummary: OverSummary[];
  onReset: () => void;
  formatOvers: (overs: number, balls: number) => string;
}

export function MatchComplete({
  totalRuns,
  wickets,
  currentOver,
  currentBall,
  runRate,
  overSummary,
  onReset,
  formatOvers,
}: MatchCompleteProps) {
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
                Run Rate: {runRate}
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
                    <div className="flex gap-2">
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
            onClick={onReset}
            className="flex-1 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 font-semibold"
          >
            Reset Match
          </button>
        </div>
      </div>
    </div>
  );
}