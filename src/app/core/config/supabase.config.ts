import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

const supabaseUrl = environment.supabase.url;
const supabasePublishableKey = environment.supabase.publishableKey;

export const supabase: SupabaseClient = createClient(supabaseUrl, supabasePublishableKey);
