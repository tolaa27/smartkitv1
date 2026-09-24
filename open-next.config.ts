import { defineCloudflareConfig } from "@opennextjs/cloudflare";

const config = defineCloudflareConfig();

export default {
	...config,
	buildCommand: "npm run build:next",
	dangerous: {
		...config.dangerous,
		disableIncrementalCache: true,
		disableTagCache: true,
	},
};
