import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */

	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**",
			},
		],
	},
	async rewrites() {
		return [
			{
				source: "/oembed",
				destination: "/api/oembed",
			},
		];
	},
};

export default nextConfig;
