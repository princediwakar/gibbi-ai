import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**",
			},
		],
	},
	async headers() {
		return [
			{
				source: "/embed/:path*",
				headers: [
					{
						key: "X-Frame-Options",
						value: "ALLOWALL", // Allows embedding anywhere
					},
					{
						key: "Content-Security-Policy",
						value: "frame-ancestors *", // Enables embedding on any site
					},
				],
			},
		];
	},
};

export default nextConfig;
