// Site-wide constants.
//
// REPO_URL is injected at build time by the GitHub Actions workflow
// (`${{ github.server_url }}/${{ github.repository }}`), so a fork automatically
// links to its own repository. Local builds fall back to the upstream repo.
export const UPSTREAM_REPO_URL = 'https://github.com/s3w3ll/LinkSanitizer';
export const REPO_URL = process.env.NEXT_PUBLIC_REPO_URL || UPSTREAM_REPO_URL;

// Anchor of the self-hosting guide in README.md (GitHub slugifies headings).
export const SELF_HOST_GUIDE_URL = `${REPO_URL}#host-your-own-copy`;
