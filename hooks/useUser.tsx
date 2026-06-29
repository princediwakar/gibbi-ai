'use client'
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export function useUser() {
	const [user, setUser] = useState<User | null>(null);
	const [accessToken, setAccessToken] = useState<string | null>(null);
	const [isUserLoading, setIsUserLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;

		const getSession = async () => {
			setIsUserLoading(true);
			try {
				const {
					data: { session },
				} = await supabase.auth.getSession();
				if (!cancelled) {
					setSessionState(session);
				}
			} catch {
				if (!cancelled) {
					setIsUserLoading(false);
				}
			}
		};

		getSession();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(
			(_event, session) => {
				setSessionState(session);
			}
		);

		function setSessionState(session: Session | null) {
			if (cancelled) return;
			setUser(session?.user ?? null);
			setAccessToken(session?.access_token ?? null);
			setIsUserLoading(false);
		}

		return () => {
			cancelled = true;
			subscription.unsubscribe();
		};
	}, []);

	return { user, accessToken, isUserLoading };
}