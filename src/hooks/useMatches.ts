import { useState } from 'react';
import { supabase } from '../supabase';
import { MatchData } from '../types';

export function useMatches() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableMatches, setAvailableMatches] = useState<MatchData[]>([]);

  async function loadAvailableMatches() {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Loading available matches...");
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      if (!data) {
        setAvailableMatches([]);
        return;
      }
      
      console.log("Matches loaded:", data);
      setAvailableMatches(data);
    } catch (err) {
      console.error("Error loading matches:", err);
      setError('Failed to load matches. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function getMatchById(id: string) {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (err) {
      console.error("Error loading match:", err);
      setError('Failed to load match');
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  return {
    availableMatches,
    isLoading,
    error,
    loadAvailableMatches,
    getMatchById
  };
} 