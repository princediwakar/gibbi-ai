import React from "react";
import { ImageResponse } from "next/og";

export const runtime = "edge";


type ImageType = 'quiz'; // Add more types as needed

const typeStyles: Record<ImageType, { 
    backgroundImage: string;
    titleColor: string;
}> = {
    quiz: {
        backgroundImage: "linear-gradient(to bottom right, #ffffff, #f3f4f6)",
        titleColor: "linear-gradient(to right, #2563eb, #4f46e5)",
    },
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    // Get parameters with fallbacks
    const title = searchParams.get("title") || "Quiz";
    const topic = searchParams.get("topic") || "General Knowledge";
    const type = (searchParams.get("type") || "quiz") as ImageType;

    // Base styles
    const baseStyles = {
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
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
                        background: typeStyles[type].titleColor,
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
                            color: "#374151",
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
                        color: "#6b7280",
                    },
                },
                type === "quiz"
                    ? "Test your knowledge now!"
                    : "Join the community!"
            )
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}