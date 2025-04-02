import React from 'react';
import { Ball } from './Ball';
import { OverSummary } from '../types';

interface ScoreboardProps {
  totalRuns: number;
  wickets: number;
  currentOver: number;
  currentBall: number;
  totalOvers: number;
  runRate: string;
  overSummary: OverSummary[];
  formatOvers: (overs: number, balls: number) => string;
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
}: ScoreboardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
      <div className="bg-green-700 text-white p-4">
        <h2 className="text-xl font-bold">Scorecard</h2>
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
          <div>
            <span className="text-gray-600">This Over</span>
            <div className="flex gap-2 mt-1">
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