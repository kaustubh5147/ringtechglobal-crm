import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tdrglisvmjhszwgehotd.supabase.co'
const supabaseKey = 'sb_publishable_bGnOUnXiy5BKBqUX4_KqOQ_iiWZCa1f'

export const supabase = createClient(supabaseUrl, supabaseKey)
