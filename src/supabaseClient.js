import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vuurqrybuglrrligigub.supabase.co'
// THIS SHOULD BE IN .env BUT HARDCODED FOR QUICK CLIENT-SIDE SETUP
const supabaseKey = 'sb_publishable_d0HL5ZEmTfEOZfIYSWlOYQ_FpQcwt6T'

export const supabase = createClient(supabaseUrl, supabaseKey)
