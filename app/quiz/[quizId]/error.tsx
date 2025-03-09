"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className="max-w-4xl mx-auto p-4 text-center">
			<h2 className="text-2xl font-bold mb-4">
				Something went wrong!
			</h2>
			<p className="text-gray-600 mb-6">
				{error.message}
			</p>
			<div className="flex gap-4 justify-center">
				<Button onClick={() => reset()}>
					Try again
				</Button>
				<Link href="/">
					<Button
						className="w-full"
						variant="outline"
					>
						Back to Home
					</Button>
				</Link>
			</div>
		</div>
	);
}
