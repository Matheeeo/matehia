import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,       // Sauvegarde la session dans localStorage
    autoRefreshToken: true,     // Renouvelle le token automatiquement avant expiration
    detectSessionInUrl: true,   // Gère les liens magic link / OAuth
  },
})
