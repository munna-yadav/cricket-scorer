import React from 'react';
import { BallType } from '../types';

interface BallProps {
  ball: BallType;
}

export function getBallClass(ball: BallType) {
  if (ball.isWide) return 'bg-yellow-100 text-yellow-800';
  if (ball.isNoBall) return 'bg-red-100 text-red-800';
  if (ball.isWicket) return 'bg-red-100 text-red-800';
  if (ball.runs === 4) return 'bg-yellow-100 text-yellow-800';
  if (ball.runs === 6) return 'bg-green-100 text-green-800';
  return 'bg-gray-100';
}

export function Ball({ ball }: BallProps) {
  return (
    <span
      className={` w-8 h-8 rounded-full flex items-center justify-center text-sm ${getBallClass(ball)}`}
    >
      {ball.isWide ? 'Wd' :
        ball.isNoBall ? `Nb+${ball.runs}` :
        ball.isWicket ? 'W' :
        ball.runs}
    </span>
  );
}