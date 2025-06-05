const fs = require("fs");

const sha = process.env.VERCEL_GIT_COMMIT_SHA || "dev";
fs.writeFileSync(".env.local", `NEXT_PUBLIC_COMMIT_SHA=${sha}\n`);
console.log(`Wrote commit SHA to .env.local: ${sha}`);
