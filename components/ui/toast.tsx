"use client";

import { Toaster as SonnerToaster } from "sonner";

interface ToasterProps {
	position?:
		| "top-left"
		| "top-center"
		| "top-right"
		| "bottom-left"
		| "bottom-center"
		| "bottom-right";
	richColors?: boolean;
}

export function Toaster({
	position = "top-center",
	richColors = true,
}: ToasterProps) {
	return (
		<SonnerToaster
			position={position}
			richColors={richColors}
			closeButton
		/>
	);
}
