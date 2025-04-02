import React from 'react';

interface NoBallPromptProps {
  onRunsSelected: (runs: number) => void;
}

export function NoBallPrompt({ onRunsSelected }: NoBallPromptProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4">Runs scored on No Ball</h3>
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 6].map((runs) => (
            <button
              key={runs}
              onClick={() => onRunsSelected(runs)}
              className={`py-4 rounded-lg text-lg font-semibold
                ${runs === 4 || runs === 6 ? 'bg-yellow-400 text-black hover:bg-yellow-500' : 'bg-white border-2 border-gray-200 text-black hover:bg-gray-50'}`}
            >
              {runs}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}