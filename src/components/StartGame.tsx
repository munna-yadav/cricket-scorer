import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createMatch } from '../services/matchService';
import { LoadingSpinner } from './ui/LoadingSpinner';

export function StartGame() {
  const [matchName, setMatchName] = useState('');
  const [totalOvers, setTotalOvers] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalOvers) {
      setIsLoading(true);
      setError(null);
      
      try {
        const matchId = await createMatch(Number(totalOvers), matchName || `Match ${new Date().toLocaleDateString()}`);
        navigate(`/match/${matchId}`);
      } catch (err) {
        console.error(err);
        setError('Failed to create match');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-green-800">Cricket Scorer</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Match Name
            </label>
            <input
              type="text"
              value={matchName}
              onChange={(e) => setMatchName(e.target.value)}
              placeholder="Team A vs Team B"
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Number of Overs
            </label>
            <input
              type="number"
              min="1"
              value={totalOvers}
              onChange={(e) => setTotalOvers(Number(e.target.value) || '')}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-700 text-white py-2 rounded hover:bg-green-800"
            >
              Start Match
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}