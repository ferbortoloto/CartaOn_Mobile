import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://zyhqmetfnqptjjxdfvuj.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_a0-IRH56DhkW_C8l42wVew_pj44egVW';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
