import { toast as sonnerToast } from "sonner";

export function toast(
	message: string,
	options?: {
		type?: "success" | "error" | "info" | "warning";
		duration?: number;
	}
) {
	const { type = "info", duration = 4000 } =
		options || {};

	switch (type) {
		case "success":
			return sonnerToast.success(message, {
				duration,
			});
		case "error":
			return sonnerToast.error(message, { duration });
		case "warning":
			return sonnerToast.warning(message, {
				duration,
			});
		default:
			return sonnerToast(message, { duration });
	}
}
