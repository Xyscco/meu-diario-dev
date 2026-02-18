import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

const supabaseUrl = environment.supabase.url;
const supabasePublishableKey = environment.supabase.publishableKey;

if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
        'Variáveis de ambiente do Supabase não configuradas. ' +
        'Por favor, configure a URL e a chave pública do Supabase em src/environments/environment.ts'
    );
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabasePublishableKey);
