import React from "react";
import { ImageResponse } from "next/og";

export const runtime = "edge";

type ImageType = "home" | "quiz";

const typeStyles: Record<
	ImageType,
	{
		backgroundImage: string;
		titleColor: string;
		subtitle?: string;
	}
> = {
	home: {
		backgroundImage:
			"linear-gradient(to bottom right, #1a1a1a, #2d2d2d)",
		titleColor:
			"linear-gradient(90deg, #6366f1, #ec4899)",
		subtitle:
			"Test Your Knowledge, Challenge Your Friends",
	},
	quiz: {
		backgroundImage:
			"linear-gradient(to bottom right, #ffffff, #f3f4f6)",
		titleColor:
			"linear-gradient(to right, #2563eb, #4f46e5)",
	},
};

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);

	// Get parameters with fallbacks
	const title = searchParams.get("title") || "QuizMasterAI";
	const topic =
		searchParams.get("topic") || "General Knowledge";
	const type =
		(searchParams.get("type") as ImageType) || "quiz";

	// Base styles
	const baseStyles = {
		height: "100%",
		width: "100%",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor:
			type === "home" ? "#1a1a1a" : "#ffffff",
	};

	return new ImageResponse(
		React.createElement(
			"div",
			{ style: baseStyles },
			React.createElement(
				"div",
				{
					style: {
						fontSize: 64,
						fontWeight: 700,
						background:
							typeStyles[type].titleColor,
						backgroundClip: "text",
						color: "transparent",
						marginBottom: 24,
					},
				},
				title
			),
			type === "quiz" &&
				React.createElement(
					"div",
					{
						style: {
							fontSize: 32,
							color:
								type === "quiz"
									? "#374151"
									: "#ffffff",
							marginBottom: 12,
						},
					},
					`Topic: ${topic}`
				),
			React.createElement(
				"div",
				{
					style: {
						fontSize: 24,
						color:
							type === "home"
								? "#d1d5db"
								: "#6b7280",
						maxWidth: "80%",
						textAlign: "center",
					},
				},
				type === "home"
					? "Test Your Knowledge, Challenge Your Friends"
					: "Test your knowledge now!"
			)
		),
		{
			width: 1200,
			height: 630,
		}
	);
}
