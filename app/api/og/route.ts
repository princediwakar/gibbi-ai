import { ImageResponse } from "next/og";
import React from "react"; // Ensure React is imported

export const runtime = "edge";

export async function GET() {
	try {
		return new ImageResponse(
			React.createElement(
				"div",
				{
					style: {
						height: "100%",
						width: "100%",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						backgroundColor: "#1a1a1a",
						backgroundImage:
							"linear-gradient(to bottom right, #1a1a1a, #2d2d2d)",
						color: "#ffffff",
						fontSize: 32,
						fontWeight: 600,
					},
				},
				React.createElement(
					"div",
					{
						style: {
							fontSize: 72,
							marginBottom: 24,
							background:
								"linear-gradient(90deg, #6366f1, #ec4899)",
							backgroundClip: "text",
							WebkitBackgroundClip: "text",
							color: "transparent",
						},
					},
					"QuizMaster"
				),
				React.createElement(
					"div",
					{
						style: {
							maxWidth: "80%",
							textAlign: "center",
							lineHeight: 1.5,
						},
					},
					"Test Your Knowledge, Challenge Your Friends"
				)
			),
			{
				width: 1200,
				height: 630,
				emoji: "twemoji",
			}
		);
	} catch {
		return new Response("Failed to generate image", {
			status: 500,
		});
	}
}
