import React from 'react';
import { XCircle } from 'lucide-react';

interface ScoringButtonsProps {
  onRunScored: (runs: number) => void;
  onWide: () => void;
  onNoBall: () => void;
  onWicket: () => void;
  disabled: boolean;
}

export function ScoringButtons({
  onRunScored,
  onWide,
  onNoBall,
  onWicket,
  disabled,
}: ScoringButtonsProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2, 3, 4, 6].map((runs) => (
          <button
            key={runs}
            onClick={() => onRunScored(runs)}
            className={`py-4 rounded-lg text-lg font-semibold
              ${runs === 4 || runs === 6 ? 'bg-yellow-400 text-black hover:bg-yellow-500' : 'bg-white border-2 border-gray-200 text-black hover:bg-gray-50'}`}
            disabled={disabled}
          >
            {runs}
          </button>
        ))}
        <button
          onClick={onWide}
          className="bg-yellow-400 text-black py-4 rounded-lg text-lg font-semibold hover:bg-yellow-500"
          disabled={disabled}
        >
          Wide
        </button>
        <button
          onClick={onNoBall}
          className="bg-yellow-400 text-black py-4 rounded-lg text-lg font-semibold hover:bg-yellow-500"
          disabled={disabled}
        >
          No Ball
        </button>
        <button
          onClick={onWicket}
          className="bg-red-500 text-white py-4 rounded-lg text-lg font-semibold hover:bg-red-600 flex items-center justify-center gap-2"
          disabled={disabled}
        >
          <XCircle size={20} /> Wicket
        </button>
      </div>
    </div>
  );
}