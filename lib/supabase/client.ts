import { createClient } from '@supabase/supabase-js';
import Cookies from 'js-cookie';


export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL! as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! as string,
  {
    auth: {
      storage: {
        getItem: (key) => {
			const value = Cookies.get(key);
			return value !== undefined ? value : null;
		  },
        setItem: (key, value) => {
			Cookies.set(key, value, { expires: 7, secure: true, sameSite: 'Strict' });
			return; // Explicitly returns void
		  },
		  removeItem: (key) => {
			Cookies.remove(key);
			return; // Explicitly returns void
		  },
      },
      persistSession: true, // Ensure sessions persist across requests
    },
  }
);