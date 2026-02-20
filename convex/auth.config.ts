import { AuthConfig } from "convex/server";

export default {
	providers: [
		{
			domain: process.env.VITE_CONVEX_SITE_URL!,
			applicationID: process.env.AUTH_APP_ID || "mission-control",
		},
	],
} satisfies AuthConfig;