import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// import { createBrowserClient } from '@supabase/ssr';

// const supabase = createClient<Database>(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// );

export default supabase;
