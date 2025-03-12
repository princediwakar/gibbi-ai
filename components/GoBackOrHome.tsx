"use client";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export function GoBackOrHome() {
	const router = useRouter();

const handleBack = () => {
	if (document.referrer) {
		router.back();
	} else {
		router.push("/");
	}
};

	return (
		<Button 
		className="w-full"
		variant="outline"
		onClick={handleBack}>
			Back
		</Button>
	);
}
