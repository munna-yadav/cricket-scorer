import { createClient } from '@supabase/supabase-js';

// Get environment variables - Vite uses import.meta.env instead of process.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Supabase URL or Anon Key is missing. Check your .env file.'
  );
}

console.log("Initializing Supabase client with URL:", supabaseUrl);

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Test the connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error("Supabase connection error:", error);
  } else {
    console.log("Supabase connection established successfully");
  }
}); 