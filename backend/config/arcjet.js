import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/node";
import { ARCJET_KEY, ARCJET_ENV } from "./env.js";

// Determine mode from environment; default to DRY_RUN to relax enforcement.
const MODE = ARCJET_ENV === 'LIVE' ? 'LIVE' : 'DRY_RUN';

const aj = arcjet({
  key: ARCJET_KEY,
  rules: [
    shield({ mode: MODE }),
    detectBot({
      mode: MODE, 
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
        //"CATEGORY:MONITOR", // Uptime monitoring services
        //"CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
      ],
    }),
    tokenBucket({
      mode: MODE,
      // More generous limits when relaxed
      refillRate: MODE === 'LIVE' ? 10 : 50,
      interval: MODE === 'LIVE' ? 60 : 10,
      capacity: MODE === 'LIVE' ? 20 : 100,
    }),
  ],
});

export default aj;