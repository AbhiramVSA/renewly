import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/node";
import { ARCJET_KEY, NODE_ENV } from "./env.js";

const aj = arcjet({
  key: ARCJET_KEY,
  rules: [
    shield({ mode: NODE_ENV === 'production' ? "LIVE" : "DRY_RUN" }),
    detectBot({
      mode: NODE_ENV === 'production' ? "LIVE" : "DRY_RUN", 
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
        //"CATEGORY:MONITOR", // Uptime monitoring services
        //"CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
      ],
    }),
    tokenBucket({
      mode: NODE_ENV === 'production' ? "LIVE" : "DRY_RUN",
      // More generous limits for development
      refillRate: NODE_ENV === 'production' ? 10 : 50, // 50 tokens per interval in dev
      interval: NODE_ENV === 'production' ? 60 : 10,   // Every 10 seconds in dev
      capacity: NODE_ENV === 'production' ? 20 : 100,  // 100 token capacity in dev
    }),
  ],
});

export default aj;