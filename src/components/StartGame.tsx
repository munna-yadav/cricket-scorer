import React from 'react';

interface StartGameProps {
  totalOvers: number | '';
  onOversChange: (overs: number) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function StartGame({ totalOvers, onOversChange, onSubmit }: StartGameProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-green-800">Cricket Scorer</h1>
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Number of Overs
            </label>
            <input
              type="number"
              min="1"
              value={totalOvers}
              onChange={(e) => onOversChange(Number(e.target.value))}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800"
          >
            Start Match
          </button>
        </form>
      </div>
    </div>
  );
}