import React from "react";
import { ImageResponse } from "next/og";

export const runtime = "edge";


const typeStyles = {
	home: {
		backgroundImage:
			"linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
		titleColor: "#ffffff",
		subtitleColor: "#d1d5db",
		accentColor: "#6366f1",
	},
};

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const type =
		(searchParams.get("type") as "home") || "home";

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
					background:
						typeStyles[type].backgroundImage,
					padding: "64px",
				},
			},
			React.createElement(
				"div",
				{
					style: {
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: "24px",
						width: "100%",
						maxWidth: "800px",
					},
				},
				// Logo/Branding
				React.createElement(
					"div",
					{
						style: {
							display: "flex",
							alignItems: "center",
							gap: "12px",
							marginBottom: "32px",
						},
					},
					React.createElement(
						"div",
						{
							style: {
								width: "48px",
								height: "48px",
								borderRadius: "12px",
								background:
									typeStyles[type]
										.accentColor,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								color: "#ffffff",
								fontSize: "24px",
								fontWeight: "700",
							},
						},
						"Q"
					),
					React.createElement(
						"div",
						{
							style: {
								fontSize: "32px",
								fontWeight: "700",
								color: typeStyles[type]
									.titleColor,
							},
						},
						"QuizMaster"
					)
				),
				// Title
				React.createElement(
					"div",
					{
						style: {
							fontSize: "56px",
							fontWeight: "700",
							color: typeStyles[type]
								.titleColor,
							textAlign: "center",
							lineHeight: "1.2",
						},
					},
					"Test Your Knowledge"
				),
				// CTA
				React.createElement(
					"div",
					{
						style: {
							fontSize: "28px",
							color: typeStyles[type]
								.subtitleColor,
							textAlign: "center",
							marginTop: "48px",
							padding: "16px 32px",
							background:
								typeStyles[type]
									.accentColor,
							borderRadius: "12px",
							fontWeight: "600",
						},
					},
					"Start Your Quiz Journey"
				)
			)
		),
		{
			width: 1200,
			height: 630,
		}
	);
}
