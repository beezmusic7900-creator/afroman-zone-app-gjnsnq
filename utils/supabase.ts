import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://isrybftzkcaznszjefrw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzcnliZnR6a2Nhem5zemplZnJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1ODY0NjYsImV4cCI6MjA4OTE2MjQ2Nn0.xCBPjjwDUA7CcEzglMBk1V3c088eok50UwO7r08GR-M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
