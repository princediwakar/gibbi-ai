// File: app/api/og/route.ts
import React from "react";
import { ImageResponse } from "next/og";

export const runtime = "edge";

type ImageType = "home" | "quiz" | "session" | "practice" | "insights";

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
	session: {
		backgroundImage:
			"linear-gradient(to bottom right, #0f172a, #1e293b)",
		titleColor:
			"linear-gradient(to right, #22c55e, #3b82f6)",
		subtitle: "Practice with GibbiAI",
	},
	practice: {
		backgroundImage:
			"linear-gradient(to bottom right, #0f172a, #1e1b4b)",
		titleColor:
			"linear-gradient(to right, #a855f7, #6366f1)",
		subtitle: "Practice Questions",
	},
	insights: {
		backgroundImage:
			"linear-gradient(to bottom right, #f8fafc, #e2e8f0)",
		titleColor:
			"linear-gradient(to right, #6366f1, #8b5cf6)",
		subtitle: "Real Student Performance Data",
	},
};

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);

	// Get parameters with fallbacks
	const title = searchParams.get("title") || "GibbiAI";
	const topic =
		searchParams.get("topic") || "General Knowledge";
	const type =
		(searchParams.get("type") as ImageType) || "quiz";

	// Base styles
	const baseStyles: Record<string, string | number> = {
		height: "100%",
		width: "100%",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor:
			type === "session" || type === "practice" ? "#0f172a" :
			type === "home" ? "#1a1a1a" :
			type === "insights" ? "#f8fafc" : "#ffffff",
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
			(type === "quiz" || type === "session" || type === "practice" || type === "insights") &&
				React.createElement(
					"div",
					{
						style: {
							fontSize: 32,
							color:
								type === "session"
									? "#94a3b8"
									: type === "practice"
										? "#c4b5fd"
										: type === "insights"
											? "#475569"
											: type === "quiz"
												? "#374151"
												: "#ffffff",
							marginBottom: 12,
						},
					},
					type === "session" ? topic :
					type === "practice" ? `Free ${topic} Practice Questions` :
					type === "insights" ? `Exam: ${topic}` :
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
								: type === "practice"
									? "#a5b4fc"
									: "#6b7280",
						maxWidth: "80%",
						textAlign: "center",
						marginBottom: type === "practice" ? 16 : 0,
					},
				},
				type === "home"
					? "Test Your Knowledge, Challenge Your Friends"
					: type === "session"
						? "Practice with GibbiAI"
						: type === "practice"
							? "GibbiAI"
							: type === "insights"
								? "Real Student Performance Data"
								: "Test your knowledge now!"
			)
		),
		{
			width: 1200,
			height: 630,
		}
	);
}
