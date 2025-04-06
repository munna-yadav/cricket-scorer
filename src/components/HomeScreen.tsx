import React from 'react';
import { Link } from 'react-router-dom';

export function HomeScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-green-800">Cricket Scorer</h1>
        <div className="space-y-4">
          <Link to="/start" className="block">
            <button className="w-full bg-green-700 text-white py-3 rounded-lg hover:bg-green-800 font-semibold">
              Start a Match
            </button>
          </Link>
          <Link to="/watch" className="block">
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold">
              Watch a Match
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
} 