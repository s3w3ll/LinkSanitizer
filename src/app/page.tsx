
import LinkSanitizerCard from '@/components/link-sanitizer-card';
import { Link2 } from 'lucide-react';

export default function Home() {
  const commitShaEnv = process.env.NEXT_PUBLIC_COMMIT_SHA;
  const displayableSha = commitShaEnv?.slice(0, 7) || "unknown";


  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-8 selection:bg-primary/20 selection:text-primary">
      <header className="mb-6 sm:mb-8 text-center">
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
          <Link2 className="h-8 w-8 sm:h-10 sm:w-10 text-primary" strokeWidth={2.5} />
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            LinkSanitizer
          </h1>
        </div>
        <p className="text-base sm:text-lg text-muted-foreground max-w-md">
          Paste any URL to remove tracking parameters and get a clean link instantly. 
        </p>
      </header>
      <main className="w-full max-w-2xl">
        <LinkSanitizerCard />
      </main>
      <footer className="mt-10 sm:mt-12 text-center text-xs sm:text-sm text-muted-foreground">
        <p>LinkSanitizer. Share links cleanly and privately.</p>
          <p className="text-xs mt-2">
            Commit: {displayableSha}
          </p>
      </footer>
    </div>
  );
}
