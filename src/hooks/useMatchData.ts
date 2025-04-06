import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { OverSummaryType, BallType, GameState } from '../types';

export function useMatchData(matchId: string, isSpectatorMode: boolean) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalOvers, setTotalOvers] = useState<number | ''>('');
  const [gameStarted, setGameStarted] = useState(false);
  const [currentOver, setCurrentOver] = useState(0);
  const [currentBall, setCurrentBall] = useState(0);
  const [totalRuns, setTotalRuns] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [overSummary, setOverSummary] = useState<OverSummaryType[]>([]);
  const [isMatchComplete, setIsMatchComplete] = useState(false);

  // Set up real-time subscription to match updates
  useEffect(() => {
    if (!matchId || !isSpectatorMode) return;

    console.log("Setting up real-time subscriptions for match:", matchId);

    // Subscribe to changes in the matches table for this specific match
    const matchSubscription = supabase
      .channel(`match-${matchId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'matches',
        filter: `id=eq.${matchId}`
      }, (payload) => {
        console.log("Match update received:", payload);
        loadMatchData();
      })
      .subscribe();

    // Subscribe to changes in the over_summary table for this match
    const overSubscription = supabase
      .channel(`oversummary-${matchId}`)
      .on('postgres_changes', {
        event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'over_summary',
        filter: `match_id=eq.${matchId}`
      }, (payload) => {
        console.log("Over summary update received:", payload);
        loadMatchData();
      })
      .subscribe();

    // Subscribe to changes in the balls table for this match
    const ballsSubscription = supabase
      .channel(`balls-${matchId}`)
      .on('postgres_changes', {
        event: '*', // Listen for all events
        schema: 'public',
        table: 'balls',
        filter: `match_id=eq.${matchId}`
      }, (payload) => {
        console.log("Ball update received:", payload);
        loadMatchData();
      })
      .subscribe();

    // Initial load
    loadMatchData();

    // Cleanup subscriptions when component unmounts or matchId changes
    return () => {
      console.log("Cleaning up subscriptions");
      matchSubscription.unsubscribe();
      overSubscription.unsubscribe();
      ballsSubscription.unsubscribe();
    };
  }, [matchId, isSpectatorMode]);

  async function loadMatchData() {
    if (!matchId) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get match data
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();
      
      if (matchError) throw matchError;
      
      // Get over summary data with a single query
      const { data: overData, error: overError } = await supabase
        .from('over_summary')
        .select(`
          id,
          over_number,
          total_runs,
          legal_balls,
          wickets
        `)
        .eq('match_id', matchId)
        .order('over_number', { ascending: true });
      
      if (overError) throw overError;
      
      // Ensure we have a complete array of over summaries with all balls
      const overSummaryWithBalls: OverSummaryType[] = [];
      
      for (const over of overData) {
        // Get balls for this over
        const { data: ballsData, error: ballsError } = await supabase
          .from('balls')
          .select('*')
          .eq('over_id', over.id)
          .order('created_at', { ascending: true });
        
        if (ballsError) throw ballsError;
        
        const balls: BallType[] = ballsData.map(ball => ({
          runs: ball.runs,
          isWide: ball.is_wide,
          isNoBall: ball.is_no_ball,
          isWicket: ball.is_wicket
        }));
        
        overSummaryWithBalls.push({
          balls,
          totalRuns: over.total_runs,
          legalBalls: over.legal_balls,
          wickets: over.wickets
        });
      }
      
      // Update state
      setTotalOvers(matchData.total_overs);
      setGameStarted(true);
      setCurrentOver(matchData.current_over);
      setCurrentBall(matchData.current_ball);
      setTotalRuns(matchData.total_runs);
      setWickets(matchData.wickets);
      
      // Ensure at least one over exists in the summary
      const finalOverSummary = overSummaryWithBalls.length > 0 
        ? overSummaryWithBalls 
        : [{ balls: [], totalRuns: 0, legalBalls: 0, wickets: 0 }];
        
      setOverSummary(finalOverSummary);
      setIsMatchComplete(matchData.is_match_complete);

      // Return data for the component to use
      return {
        totalOvers: matchData.total_overs,
        currentOver: matchData.current_over,
        currentBall: matchData.current_ball,
        totalRuns: matchData.total_runs,
        wickets: matchData.wickets,
        overSummary: finalOverSummary,
        isMatchComplete: matchData.is_match_complete
      };
    } catch (err) {
      if (!isSpectatorMode) {
        setError('Failed to load match data');
        console.error(err);
      } else {
        // In spectator mode, log but don't show errors
        console.error("Error loading match data:", err);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  return {
    isLoading,
    error,
    totalOvers,
    setTotalOvers,
    gameStarted,
    setGameStarted,
    currentOver,
    setCurrentOver, 
    currentBall,
    setCurrentBall,
    totalRuns,
    setTotalRuns,
    wickets,
    setWickets,
    overSummary,
    setOverSummary,
    isMatchComplete,
    setIsMatchComplete,
    loadMatchData
  };
} 