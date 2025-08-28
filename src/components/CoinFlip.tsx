import { useState } from 'react';

interface CoinFlipProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CoinFlip({ isOpen, onClose }: CoinFlipProps) {
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<'heads' | 'tails' | null>(null);

  const flipCoin = () => {
    if (isFlipping) return;
    
    setIsFlipping(true);
    setResult(null);
    
    // Simulate coin flip animation
    setTimeout(() => {
      const randomNum = Math.floor(Math.random() * 2) + 1;
      const randomResult = randomNum === 1 ? 'heads' : 'tails';
      setResult(randomResult);
      setIsFlipping(false);
    }, 2000);
  };

  const handleClose = () => {
    if (!isFlipping) {
      setResult(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">🏏 Cricket Toss</h2>
          <button
            onClick={handleClose}
            disabled={isFlipping}
            className="text-white hover:text-yellow-200 transition-colors disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex flex-col items-center space-y-6">
            {/* Coin Display */}
            <div className="relative">
              <div 
                className={`w-28 h-28 rounded-full border-4 border-yellow-300 bg-gradient-to-br from-yellow-200 to-yellow-400 flex items-center justify-center text-5xl font-bold transition-all duration-1000 ${
                  isFlipping 
                    ? 'animate-spin scale-110 shadow-2xl' 
                    : result 
                      ? 'scale-100 shadow-lg' 
                      : 'scale-100 shadow-md'
                }`}
              >
                {isFlipping ? '🪙' : '🪙'}
              </div>
              
              {/* Result overlay */}
              {result && !isFlipping && (
                <div className={`absolute inset-0 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                  result === 'heads' ? 'bg-green-600' : 'bg-blue-600'
                }`}>
                  {result === 'heads' ? 'HEADS' : 'TAILS'}
                </div>
              )}
            </div>

            {/* Instructions */}
            {!result && !isFlipping && (
              <div className="text-center text-gray-600">
                <p className="text-lg font-medium">Ready for the toss?</p>
                <p className="text-sm mt-1">Click the button below to flip the coin</p>
              </div>
            )}

            {/* Flip Button */}
            <button
              onClick={flipCoin}
              disabled={isFlipping}
              className={`px-8 py-4 rounded-xl font-bold text-white text-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                isFlipping 
                  ? 'bg-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800'
              }`}
            >
              {isFlipping ? '🔄 Flipping...' : '🪙 Flip Coin'}
            </button>

            {/* Result Text */}
            {result && !isFlipping && (
              <div className={`text-center p-4 rounded-xl ${
                result === 'heads' 
                  ? 'bg-green-100 text-green-800 border-2 border-green-200' 
                  : 'bg-blue-100 text-blue-800 border-2 border-blue-200'
              }`}>
                <p className="font-bold text-lg">
                  {result === 'heads' ? '🦅 Heads!' : '🦅 Tails!'}
                </p>
                <p className="text-sm mt-2">
                  {result === 'heads' 
                    ? 'Batting team wins the toss!' 
                    : 'Bowling team wins the toss!'
                  }
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {result && !isFlipping && (
              <div className="flex space-x-3 w-full">
                <button
                  onClick={() => setResult(null)}
                  className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Flip Again
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
