import { useState } from 'react';
import { supabase } from '../supabase';
import { OverSummaryType, BallType, InningsState } from '../types';

export function useMatchData(matchId: string, isSpectatorMode: boolean) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalOvers, setTotalOvers] = useState<number | ''>('');
  const [gameStarted, setGameStarted] = useState(false);
  const [currentInnings, setCurrentInnings] = useState(1);
  const [currentOver, setCurrentOver] = useState(0);
  const [currentBall, setCurrentBall] = useState(0);
  const [totalRuns, setTotalRuns] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [overSummary, setOverSummary] = useState<OverSummaryType[]>([]);
  const [isMatchComplete, setIsMatchComplete] = useState(false);
  const [inningsData, setInningsData] = useState<{
    innings1: InningsState;
    innings2: InningsState;
  }>({
    innings1: {
      totalRuns: 0,
      wickets: 0,
      currentOver: 0,
      currentBall: 0,
      overSummary: [],
      isComplete: false
    },
    innings2: {
      totalRuns: 0,
      wickets: 0,
      currentOver: 0,
      currentBall: 0,
      overSummary: [],
      isComplete: false
    }
  });
  const [targetRuns, setTargetRuns] = useState(0);

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
      
      // Process data for both innings
      const inningsDataResult: {
        innings1: InningsState;
        innings2: InningsState;
      } = {
        innings1: {
          totalRuns: matchData.innings1_total_runs || 0,
          wickets: matchData.innings1_wickets || 0,
          currentOver: matchData.innings1_current_over || 0,
          currentBall: matchData.innings1_current_ball || 0,
          overSummary: [],
          isComplete: matchData.innings1_is_complete || false
        },
        innings2: {
          totalRuns: matchData.innings2_total_runs || 0,
          wickets: matchData.innings2_wickets || 0,
          currentOver: matchData.innings2_current_over || 0,
          currentBall: matchData.innings2_current_ball || 0,
          overSummary: [],
          isComplete: matchData.innings2_is_complete || false
        }
      };
      
      // Load over summaries for both innings
      for (let inningsNum = 1; inningsNum <= 2; inningsNum++) {
        // Get over summary data
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
          .eq('innings', inningsNum)
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
        
        // Store the over summary for the appropriate innings
        if (inningsNum === 1) {
          inningsDataResult.innings1.overSummary = overSummaryWithBalls.length > 0 
            ? overSummaryWithBalls 
            : [{ balls: [], totalRuns: 0, legalBalls: 0, wickets: 0 }];
        } else {
          inningsDataResult.innings2.overSummary = overSummaryWithBalls.length > 0 
            ? overSummaryWithBalls 
            : [{ balls: [], totalRuns: 0, legalBalls: 0, wickets: 0 }];
        }
      }
      
      // Set the target for the second innings
      const targetRuns = inningsDataResult.innings1.totalRuns + 1;
      
      // Update state with current innings data
      const currentInnings = matchData.current_innings || 1;
      
      // Set current state based on the current innings
      const currentInningsData = currentInnings === 1 
        ? inningsDataResult.innings1 
        : inningsDataResult.innings2;
      
      // Update state
      setTotalOvers(matchData.total_overs);
      setGameStarted(true);
      setCurrentInnings(currentInnings);
      setCurrentOver(currentInningsData.currentOver);
      setCurrentBall(currentInningsData.currentBall);
      setTotalRuns(currentInningsData.totalRuns);
      setWickets(currentInningsData.wickets);
      setOverSummary(currentInningsData.overSummary);
      setIsMatchComplete(matchData.is_match_complete);
      setInningsData(inningsDataResult);
      setTargetRuns(targetRuns);

      // Return data for the component to use
      return {
        totalOvers: matchData.total_overs,
        currentInnings: currentInnings,
        currentOver: currentInningsData.currentOver,
        currentBall: currentInningsData.currentBall,
        totalRuns: currentInningsData.totalRuns,
        wickets: currentInningsData.wickets,
        overSummary: currentInningsData.overSummary,
        isMatchComplete: matchData.is_match_complete,
        inningsData: inningsDataResult,
        targetRuns
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
    currentInnings,
    setCurrentInnings,
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
    inningsData,
    setInningsData,
    targetRuns,
    setTargetRuns,
    loadMatchData
  };
}