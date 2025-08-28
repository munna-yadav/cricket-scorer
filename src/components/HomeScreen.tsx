import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CoinFlip } from './CoinFlip';

export function HomeScreen() {
  const [isTossModalOpen, setIsTossModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-4xl font-bold">🏏</span>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-center text-green-800 mb-2">Cricket Scorer</h1>
          <p className="text-gray-600 text-center mb-8">Track and share live cricket scores with ease</p>
          
          <div className="space-y-4">
            <Link to="/start" className="block">
              <button className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-lg hover:from-green-700 hover:to-green-800 font-semibold text-lg flex items-center justify-center transition-all duration-200 transform hover:scale-[1.02]">
                🏏 Start a Match
              </button>
            </Link>
            <Link to="/watch" className="block">
              <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-lg hover:from-blue-600 hover:to-blue-700 font-semibold text-lg flex items-center justify-center transition-all duration-200 transform hover:scale-[1.02]">
                👁️ Watch a Match
              </button>
            </Link>
          </div>
          
          {/* Toss Button */}
          <div className="mt-6">
            <button
              onClick={() => setIsTossModalOpen(true)}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-4 rounded-lg hover:from-yellow-600 hover:to-yellow-700 font-semibold text-lg flex items-center justify-center transition-all duration-200 transform hover:scale-[1.02]"
            >
              🪙 Toss the Coin
            </button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-500">FEATURES</h3>
              <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="font-semibold text-green-800">Real-time Scoring</div>
                  <div className="text-sm text-gray-600">Track balls, runs, overs</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="font-semibold text-blue-800">Live Sharing</div>
                  <div className="text-sm text-gray-600">Share with spectators</div>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="font-semibold text-yellow-800">Detailed Stats</div>
                  <div className="text-sm text-gray-600">Ball-by-ball analysis</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="font-semibold text-purple-800">Two Innings</div>
                  <div className="text-sm text-gray-600">Full game support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-4 text-sm text-gray-600">
          © {new Date().getFullYear()} Cricket Scorer App • All Rights Reserved
        </div>
      </div>
      
      {/* Coin Toss Modal */}
      <CoinFlip 
        isOpen={isTossModalOpen} 
        onClose={() => setIsTossModalOpen(false)} 
      />
    </div>
  );
}