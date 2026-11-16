import LinkSanitizerCard from '@/components/link-sanitizer-card';
import WhyCleanLinks from '@/components/why-clean-links';
import { Link2, Github } from 'lucide-react';
import { REPO_URL } from '@/lib/site';

export default function Home() {
  const commitSha = process.env.NEXT_PUBLIC_COMMIT_SHA;
  const shortSha = commitSha?.slice(0, 7);

  return (
    <div className="flex flex-col items-center min-h-screen px-4 sm:px-8 pb-8 selection:bg-primary/20 selection:text-primary">
      {/* ── Top bar ── */}
      <nav className="w-full max-w-2xl flex items-center justify-between py-4 sm:py-5">
        <a href="#" className="flex items-center gap-2 font-semibold text-foreground">
          <Link2 className="h-5 w-5 text-primary" strokeWidth={2.5} />
          LinkSanitizer
        </a>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-white/60 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur px-3.5 py-1.5 text-sm font-medium text-foreground hover:bg-white/90 dark:hover:bg-white/10 transition-colors"
        >
          <Github className="h-4 w-4" />
          <span>GitHub</span>
        </a>
      </nav>

      {/* ── Hero ── */}
      <header className="mt-4 sm:mt-8 mb-8 sm:mb-10 text-center space-y-3">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
          Share links, <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">not your data.</span>
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-lg mx-auto">
          Paste any link to strip the hidden tracking tags that follow you and the people you share with.
          Free, no sign-up, and it runs entirely in your browser.
        </p>
      </header>

      <main className="w-full flex flex-col items-center gap-14 sm:gap-16">
        <div className="w-full max-w-2xl animate-fade-slide-up">
          <LinkSanitizerCard />
        </div>
        <WhyCleanLinks />
      </main>

      {/* ── Footer ── */}
      <footer className="mt-14 sm:mt-16 w-full max-w-2xl border-t border-foreground/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-muted-foreground">
        <p>LinkSanitizer · Share links cleanly and privately.</p>
        <div className="flex items-center gap-4">
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-foreground">
            <Github className="h-3.5 w-3.5" />
            Source on GitHub
          </a>
          {shortSha && (
            <a
              href={`${REPO_URL}/commit/${commitSha}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono hover:text-foreground"
              title="Deployed commit"
            >
              {shortSha}
            </a>
          )}
        </div>
      </footer>
    </div>
  );
}
