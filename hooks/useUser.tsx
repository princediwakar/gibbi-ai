'use client'
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export function useUser() {
	const [user, setUser] = useState<any>(null);
	const [isUserLoading, setIsUserLoading] = useState(true);

	useEffect(() => {
		const getSession = async () => {
			setIsUserLoading(true);
			const {
				data: { session },
			} = await supabase.auth.getSession();
			setUser(session?.user ?? null);
			setIsUserLoading(false);
		};

		getSession();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(
			(event, session) => {
				setUser(session?.user ?? null);
				setIsUserLoading(false);
			}
		);

		return () => subscription.unsubscribe();
	}, []);

	return { user, isUserLoading };
}