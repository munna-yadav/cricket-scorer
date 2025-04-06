import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { signOut } from '../../services/authService';

interface Match {
  id: string;
  created_at: string;
  total_overs: number;
  total_runs: number;
  wickets: number;
  current_over: number;
  current_ball: number;
  is_match_complete: boolean;
}

interface AdminPageProps {
  onBack: () => void;
}

export function AdminPage({ onBack }: AdminPageProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadMatches();
  }, []);

  async function loadMatches() {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setMatches(data || []);
    } catch (err) {
      console.error('Error loading matches:', err);
      setError('Failed to load matches');
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteMatch(id: string) {
    setIsLoading(true);
    setError(null);
    setDeleteSuccess(null);
    
    try {
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Remove the match from the local state
      setMatches(matches.filter(match => match.id !== id));
      setDeleteSuccess('Match deleted successfully');
      
      // Clear the confirmation state
      setConfirmDelete(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setDeleteSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error deleting match:', err);
      setError('Failed to delete match');
    } finally {
      setIsLoading(false);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  function handleLogout() {
    signOut();
    window.location.href = '/';
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <div className="flex space-x-2">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Back to Home
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {deleteSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {deleteSuccess}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-green-700 text-white p-4">
            <h2 className="text-xl font-bold">Match Management</h2>
          </div>
          
          {isLoading ? (
            <div className="p-6 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : matches.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No matches found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Overs
                    </th>
                    <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="py-3 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((match) => (
                    <tr key={match.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4 border-b border-gray-200">
                        {formatDate(match.created_at)}
                      </td>
                      <td className="py-4 px-4 border-b border-gray-200">
                        {match.total_overs}
                      </td>
                      <td className="py-4 px-4 border-b border-gray-200">
                        {match.total_runs}/{match.wickets}
                      </td>
                      <td className="py-4 px-4 border-b border-gray-200">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          match.is_match_complete 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {match.is_match_complete ? 'Completed' : 'In Progress'}
                        </span>
                      </td>
                      <td className="py-4 px-4 border-b border-gray-200">
                        {confirmDelete === match.id ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => deleteMatch(match.id)}
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(match.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 