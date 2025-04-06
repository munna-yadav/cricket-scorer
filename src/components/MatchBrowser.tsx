import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMatches } from '../hooks/useMatches';
import { LoadingSpinner } from './ui/LoadingSpinner';

export function MatchBrowser() {
  const navigate = useNavigate();
  const { 
    availableMatches, 
    loadAvailableMatches,
    isLoading,
    error 
  } = useMatches();
  
  const [ongoingMatches, setOngoingMatches] = useState<any[]>([]);
  const [completedMatches, setCompletedMatches] = useState<any[]>([]);

  useEffect(() => {
    loadAvailableMatches();
  }, []);

  useEffect(() => {
    if (availableMatches.length > 0) {
      setOngoingMatches(availableMatches.filter(match => !match.is_match_complete));
      setCompletedMatches(availableMatches.filter(match => match.is_match_complete));
    }
  }, [availableMatches]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <div className="text-center">
            <Link 
              to="/"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Watch Cricket Matches</h1>
          <Link 
            to="/"
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Back to Home
          </Link>
        </div>

        {/* Ongoing Matches (Cards) */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Ongoing Matches</h2>
          {ongoingMatches.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
              No ongoing matches at the moment
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ongoingMatches.map(match => (
                <div 
                  key={match.id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg cursor-pointer transform transition hover:-translate-y-1"
                  onClick={() => navigate(`/watch/${match.id}`)}
                >
                  <div className="bg-green-700 text-white p-3">
                    <h3 className="font-bold">{match.match_name || 'Live Match'}</h3>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 text-sm">
                        {new Date(match.created_at).toLocaleDateString()} {new Date(match.created_at).toLocaleTimeString()}
                      </span>
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">In Progress</span>
                    </div>
                    <div className="text-2xl font-bold text-center my-3">
                      {match.total_runs}/{match.wickets}
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{match.current_over}.{match.current_ball} overs</span>
                      <span>{match.total_overs} over match</span>
                    </div>
                    <button
                      className="w-full mt-4 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/watch/${match.id}`);
                      }}
                    >
                      Watch Live
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Matches (List) */}
        <div>
          <h2 className="text-xl font-bold text-gray-700 mb-4">Completed Matches</h2>
          {completedMatches.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
              No completed matches found
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {completedMatches.map(match => (
                  <li 
                    key={match.id}
                    className="hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => navigate(`/watch/${match.id}`)}
                  >
                    <div className="p-4">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium">{match.match_name || 'Unnamed Match'}</div>
                          <div className="font-medium mt-1">{match.total_runs}/{match.wickets}</div>
                          <div className="text-sm text-gray-500">
                            {match.current_over} overs (Total: {match.total_overs})
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            Completed
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {new Date(match.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 