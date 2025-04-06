import React, { useState, useEffect } from 'react';
import { MatchData } from '../types';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface WatchMatchProps {
  onMatchSelect: (matchId: string) => void;
  onBack: () => void;
  availableMatches: MatchData[];
  isLoading: boolean;
  error: string | null;
}

export function WatchMatch({ 
  onMatchSelect, 
  onBack, 
  availableMatches, 
  isLoading, 
  error 
}: WatchMatchProps) {
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');

  // Default selection if there's only one match
  useEffect(() => {
    if (availableMatches.length === 1) {
      setSelectedMatchId(availableMatches[0].id);
    }
  }, [availableMatches]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading available matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={onBack}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-green-800">Watch a Match</h1>
        
        {availableMatches.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-600 mb-4">No matches available to watch.</p>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Select a Match
              </label>
              <select
                value={selectedMatchId}
                onChange={(e) => setSelectedMatchId(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">-- Select a match --</option>
                {availableMatches.map(match => (
                  <option key={match.id} value={match.id}>
                    {new Date(match.date).toLocaleDateString()} - {match.overs} overs
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={onBack}
                className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400"
              >
                Back
              </button>
              <button
                onClick={() => selectedMatchId && onMatchSelect(selectedMatchId)}
                disabled={!selectedMatchId}
                className={`flex-1 py-2 rounded ${
                  !selectedMatchId 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Watch
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 