'use client'
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export function useUser() {
	const [user, setUser] = useState<any>(null);

	useEffect(() => {
		const getSession = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			setUser(session?.user ?? null);
		};

		getSession();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(
			(event, session) => {
				setUser(session?.user ?? null);
			}
		);

		return () => subscription.unsubscribe();
	}, []);

	return user;
}
