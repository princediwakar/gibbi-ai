"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation"; // Correct import for navigation
import { supabase } from "@/lib/supabase/client";
import Cookies from "js-cookie";

const AuthCallback = () => {
	const router = useRouter(); // Get router for navigation

	useEffect(() => {
		const handleAuthCallback = async () => {
			const {
				data: { session },
				error,
			} = await supabase.auth.getSession();

			if (error) {
				console.error(
					"Error during auth callback:",
					error.message
				);
				return;
			}

			if (session) {
				const accessToken = session.access_token;

				if (accessToken) {
					// Store the access token securely in a cookie
					Cookies.set(
						"access_token",
						accessToken,
						{
							expires: 7, // Expires in 7 days
							secure: true, // Only secure in production
							sameSite: "Strict", // Avoid cross-site issues
						}
					);

					// Redirect to the previous page or home if no previous path
					const returnUrl =
						window.localStorage.getItem(
							"returnUrl"
						) || "/"; // Fallback to home if no stored URL
					router.push(returnUrl); // Navigate to the desired page
				} else {
					console.error(
						"No access token available in the session."
					);
				}
			} else {
				console.error("No session found.");
			}
		};

		handleAuthCallback();
	}, [router]); // Only depend on router, as it's the only variable changing

	return <div>Loading...</div>; // Display loading while processing auth callback
};

export default AuthCallback;
