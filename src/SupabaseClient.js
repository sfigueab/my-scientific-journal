// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://adgtsnkeqeohwvmsrmuo.supabase.co'; // from Supabase dashboard
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkZ3RzbmtlcWVvaHd2bXNybXVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MTE2MjEsImV4cCI6MjA2NzQ4NzYyMX0.ZMiacgXr3-YFeUTzKofR6U6wGcwBs3RZPy5p77znasw'; // from API settings in Supabase dashboard

export const supabase = createClient(supabaseUrl, supabaseKey);
