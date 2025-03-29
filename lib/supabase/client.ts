import { createBrowserClient } from '@supabase/ssr'


// Validate environment variables
const REQUIRED_ENV_VARS = ["NEXT_PUBLIC_SUPABASE_URL",
	"NEXT_PUBLIC_SUPABASE_ANON_KEY"
];

REQUIRED_ENV_VARS.forEach((varName) => {
	if (!process.env[varName]) {
		throw new Error(
			`Missing ${varName} in environment variables.`
		);
	}
});


export const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

