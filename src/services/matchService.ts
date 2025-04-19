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
      is_match_complete: false,
      current_innings: 1,
      innings1_total_runs: 0,
      innings1_wickets: 0,
      innings1_current_over: 0,
      innings1_current_ball: 0,
      innings1_is_complete: false,
      innings2_total_runs: 0,
      innings2_wickets: 0,
      innings2_current_over: 0,
      innings2_current_ball: 0,
      innings2_is_complete: false
    });
  
  if (matchError) throw matchError;
  
  // Create initial over for innings 1
  const { error: overError } = await supabase
    .from('over_summary')
    .insert({
      match_id: newMatchId,
      over_number: 0,
      total_runs: 0,
      legal_balls: 0,
      wickets: 0,
      innings: 1
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
  overSummary: OverSummaryType[],
  currentInnings: number
) {
  // Get the current over's ID from the database
  const { data: overData, error: overError } = await supabase
    .from('over_summary')
    .select('id')
    .eq('match_id', matchId)
    .eq('over_number', currentOver)
    .eq('innings', currentInnings)
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
      is_wicket: isWicket,
      innings: currentInnings
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
  isMatchComplete: boolean,
  currentInnings: number
) {
  const updates = {
    total_runs: totalRuns,
    wickets: wickets,
    current_over: currentOver,
    current_ball: currentBall,
    is_match_complete: isMatchComplete,
    current_innings: currentInnings,
    updated_at: new Date().toISOString()
  };

  // Add innings-specific updates
  if (currentInnings === 1) {
    Object.assign(updates, {
      innings1_total_runs: totalRuns,
      innings1_wickets: wickets,
      innings1_current_over: currentOver,
      innings1_current_ball: currentBall,
    });
  } else {
    Object.assign(updates, {
      innings2_total_runs: totalRuns,
      innings2_wickets: wickets,
      innings2_current_over: currentOver,
      innings2_current_ball: currentBall,
    });
  }

  const { error } = await supabase
    .from('matches')
    .update(updates)
    .eq('id', matchId);
  
  if (error) throw error;
}

export async function createNewOver(matchId: string, overNumber: number, currentInnings: number) {
  const { error } = await supabase
    .from('over_summary')
    .insert({
      match_id: matchId,
      over_number: overNumber,
      total_runs: 0,
      legal_balls: 0,
      wickets: 0,
      innings: currentInnings
    });
  
  if (error) throw error;
}

export async function deleteLastBall(matchId: string, overNumber: number, currentInnings: number) {
  try {
    // First, get all over summaries for this match in current innings
    const { data: overData, error: overError } = await supabase
      .from('over_summary')
      .select('id, over_number')
      .eq('match_id', matchId)
      .eq('innings', currentInnings)
      .order('over_number', { ascending: true });
    
    if (overError) throw overError;
    
    // Find the last over that has balls
    let lastOverWithBalls = null;
    
    // Start with the current over as we try to find the last over with balls
    for (let i = overData.length - 1; i >= 0; i--) {
      const over = overData[i];
      
      // Get balls for this over
      const { data: ballsData, error: ballsError } = await supabase
        .from('balls')
        .select('*')
        .eq('over_id', over.id)
        .order('created_at', { ascending: true });
      
      if (ballsError) throw ballsError;
      
      // If this over has balls, it's our target
      if (ballsData && ballsData.length > 0) {
        lastOverWithBalls = {
          id: over.id,
          balls: ballsData,
          overNumber: over.over_number
        };
        break;
      }
    }
    
    // If we found an over with balls, delete the last ball
    if (lastOverWithBalls) {
      const lastBall = lastOverWithBalls.balls[lastOverWithBalls.balls.length - 1];
      
      const { error: deleteBallError } = await supabase
        .from('balls')
        .delete()
        .eq('id', lastBall.id);
      
      if (deleteBallError) throw deleteBallError;
      
      // If this was the last ball in an over that isn't the first over, and the over is now empty, 
      // we might need to delete the empty over
      if (lastOverWithBalls.overNumber > 0 && lastOverWithBalls.balls.length === 1) {
        // Check if there are any balls left in this over after deletion
        const { data: remainingBalls, error: checkBallsError } = await supabase
          .from('balls')
          .select('id')
          .eq('over_id', lastOverWithBalls.id);
        
        if (checkBallsError) throw checkBallsError;
        
        // If no balls remain, delete the over summary entry too
        if (remainingBalls && remainingBalls.length === 0) {
          const { error: deleteOverError } = await supabase
            .from('over_summary')
            .delete()
            .eq('id', lastOverWithBalls.id);
          
          if (deleteOverError) throw deleteOverError;
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error in deleteLastBall:", error);
    throw error;
  }
}

export async function markInningsComplete(matchId: string, currentInnings: number) {
  const updates: any = {
    updated_at: new Date().toISOString()
  };
  
  if (currentInnings === 1) {
    updates.innings1_is_complete = true;
    updates.current_innings = 2;
    
    // Create initial over for second innings
    await createNewOver(matchId, 0, 2);
  } else {
    updates.innings2_is_complete = true;
    updates.is_match_complete = true;
  }
  
  const { error } = await supabase
    .from('matches')
    .update(updates)
    .eq('id', matchId);
  
  if (error) throw error;
  
  return true;
}

// Add a new function to mark a match as complete
export async function markMatchComplete(matchId: string) {
  const { error } = await supabase
    .from('matches')
    .update({
      is_match_complete: true,
      innings2_is_complete: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', matchId);
  
  if (error) throw error;
  
  return true;
}