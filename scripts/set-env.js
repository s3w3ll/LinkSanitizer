const fs = require("fs");
const { execSync } = require("child_process");

let sha = process.env.VERCEL_GIT_COMMIT_SHA;

if (!sha) {
  try {
    sha = execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    sha = "dev";
  }
}

fs.writeFileSync(".env.local", `NEXT_PUBLIC_COMMIT_SHA=${sha}\n`);
console.log(`Wrote NEXT_PUBLIC_COMMIT_SHA=${sha} to .env.local`);
