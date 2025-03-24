/** @type {import('next').NextConfig} */
const nextConfig = {
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