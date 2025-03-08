"use client";

import { useUser } from "@/hooks/use-user";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/components/ui/avatar";
import Link from "next/link";
import { useRouter } from "next/navigation";


const Header = () => {
	const user = useUser();
	const router = useRouter()

	const handleSignIn = async () => {
		const { error } =
			await supabase.auth.signInWithOAuth({
				provider: "google",
			});
		if (error) {
			console.error("Sign-in error:", error.message);
		}
	};

	const handleSignOut = async () => {
		await supabase.auth.signOut();
		router.push('/')
	};

	return (
		<header className="flex justify-between items-center p-4 lg:w-3/5 text-gray-900 mx-auto">
			<Link
				href="/"
				className="hover:opacity-80 transition-opacity"
			>
				<h1 className="text-xl font-bold">
					Gibbi AI
				</h1>
			</Link>{" "}
			<div className="flex items-center space-x-4">
				{user ? (
					<>
						<Avatar>
							<AvatarImage
								src={
									user?.user_metadata
										?.avatar_url
								}
							/>
							<AvatarFallback className="text-gray-900">
								{user?.user_metadata
									?.name?.[0] || "U"}
							</AvatarFallback>
						</Avatar>
						<Button onClick={handleSignOut}>
							Log Out
						</Button>
					</>
				) : (
					<Button onClick={handleSignIn}>
						Sign In
					</Button>
				)}
			</div>
		</header>
	);
};

export default Header;
