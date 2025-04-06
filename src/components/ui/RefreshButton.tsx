import React from 'react';
import { RefreshCw } from 'lucide-react';

interface RefreshButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

export function RefreshButton({ onClick, isLoading = false }: RefreshButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="flex items-center justify-center gap-2 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold"
    >
      <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
      {isLoading ? 'Refreshing...' : 'Refresh Scorecard'}
    </button>
  );
} 