import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../supabase';
import { OverSummaryType } from '../types';

export async function createMatch(totalOvers: number, matchName: string) {
  const newMatchId = uuidv4();
  
  // Insert match record with name
  const { error: matchError } = await supabase
    .from('matches')
    .insert({
      id: newMatchId,
      match_name: matchName,
      total_overs: Number(totalOvers),
      total_runs: 0,
      wickets: 0,
      current_over: 0,
      current_ball: 0,
      is_match_complete: false
    });
  
  if (matchError) throw matchError;
  
  // Create initial over
  const { error: overError } = await supabase
    .from('over_summary')
    .insert({
      match_id: newMatchId,
      over_number: 0,
      total_runs: 0,
      legal_balls: 0,
      wickets: 0
    });
  
  if (overError) throw overError;
  
  return newMatchId;
}

export async function addBallToMatch(
  matchId: string,
  currentOver: number,
  runs: number,
  isWide: boolean,
  isNoBall: boolean,
  isWicket: boolean,
  overSummary: OverSummaryType[]
) {
  // Get the current over's ID from the database
  const { data: overData, error: overError } = await supabase
    .from('over_summary')
    .select('id')
    .eq('match_id', matchId)
    .eq('over_number', currentOver)
    .single();
  
  if (overError) throw overError;
  
  // Insert the ball
  const { error: ballError } = await supabase
    .from('balls')
    .insert({
      match_id: matchId,
      over_id: overData.id,
      runs: runs,
      is_wide: isWide,
      is_no_ball: isNoBall,
      is_wicket: isWicket
    });
  
  if (ballError) throw ballError;
  
  // Update the over summary
  const { error: updateOverError } = await supabase
    .from('over_summary')
    .update({
      total_runs: overSummary[currentOver].totalRuns,
      legal_balls: overSummary[currentOver].legalBalls,
      wickets: overSummary[currentOver].wickets
    })
    .eq('id', overData.id);
  
  if (updateOverError) throw updateOverError;
}

export async function updateMatchState(
  matchId: string,
  totalRuns: number,
  wickets: number,
  currentOver: number,
  currentBall: number,
  isMatchComplete: boolean
) {
  const { error } = await supabase
    .from('matches')
    .update({
      total_runs: totalRuns,
      wickets: wickets,
      current_over: currentOver,
      current_ball: currentBall,
      is_match_complete: isMatchComplete,
      updated_at: new Date().toISOString()
    })
    .eq('id', matchId);
  
  if (error) throw error;
}

export async function createNewOver(matchId: string, overNumber: number) {
  const { error } = await supabase
    .from('over_summary')
    .insert({
      match_id: matchId,
      over_number: overNumber,
      total_runs: 0,
      legal_balls: 0,
      wickets: 0
    });
  
  if (error) throw error;
}

export async function deleteLastBall(matchId: string, overNumber: number) {
  // Get the current over's ID
  const { data: overData, error: overError } = await supabase
    .from('over_summary')
    .select('id')
    .eq('match_id', matchId)
    .eq('over_number', overNumber)
    .single();
  
  if (overError) throw overError;
  
  // Get all balls for this over
  const { data: ballsData, error: ballsError } = await supabase
    .from('balls')
    .select('*')
    .eq('over_id', overData.id)
    .order('created_at', { ascending: true });
  
  if (ballsError) throw ballsError;
  
  // Delete the last ball
  if (ballsData.length > 0) {
    const lastBall = ballsData[ballsData.length - 1];
    const { error: deleteBallError } = await supabase
      .from('balls')
      .delete()
      .eq('id', lastBall.id);
    
    if (deleteBallError) throw deleteBallError;
  }
}

// Add a new function to mark a match as complete
export async function markMatchComplete(matchId: string) {
  const { error } = await supabase
    .from('matches')
    .update({
      is_match_complete: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', matchId);
  
  if (error) throw error;
  
  return true;
} 