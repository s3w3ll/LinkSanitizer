import { Fingerprint, Share2, Footprints, Scissors, ShieldCheck, GitFork, ArrowUpRight } from 'lucide-react';
import { SELF_HOST_GUIDE_URL } from '@/lib/site';

const glass =
  'rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-lg shadow-violet-200/20 dark:shadow-black/30';

// One segment of the example URL. `kind` controls highlighting:
// base = the address itself, keep = a parameter the page needs, track = removed.
type Segment = { text: string; kind: 'base' | 'keep' | 'track'; note?: string };

const EXAMPLE_URL: Segment[] = [
  { text: 'https://shop.example.com/shoes/trail-runner', kind: 'base' },
  { text: '?size=10', kind: 'keep', note: 'Needed: picks your shoe size' },
  { text: '&utm_source=newsletter&utm_campaign=spring_sale', kind: 'track', note: 'Records where you came from and which campaign got you' },
  { text: '&fbclid=IwAR2kX9fQ7vB3', kind: 'track', note: 'A unique ID for your click, tied back to your Facebook profile' },
];

const REASONS = [
  {
    icon: Fingerprint,
    title: 'They can identify you',
    body: 'Click IDs such as fbclid, gclid and msclkid are generated for a single click. They let ad networks connect the visit to your account and profile, even on sites you never signed in to.',
  },
  {
    icon: Share2,
    title: 'They reveal who shared it',
    body: 'Share tags like si (YouTube, Spotify) and igshid (Instagram) can tie a link back to the account that shared it. Pass it on, and the platform can map who sends what to whom.',
  },
  {
    icon: Footprints,
    title: 'They follow you around',
    body: 'Campaign tags (utm_*, mc_cid, _hsenc) record which email, post or ad brought you in. Across many sites, that builds a detailed picture of your habits.',
  },
  {
    icon: Scissors,
    title: 'Clean links are better links',
    body: 'Without the clutter, links are shorter, easier to read, and look less like spam or phishing when you paste them into a chat or an email.',
  },
];

export default function WhyCleanLinks() {
  return (
    <div className="w-full max-w-2xl space-y-10 sm:space-y-12">
      {/* ── Why ── */}
      <section aria-labelledby="why-heading" className="space-y-5">
        <div className="space-y-2 text-center">
          <h2 id="why-heading" className="text-2xl sm:text-3xl font-bold tracking-tight">
            Why clean your links?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Links you copy from apps, emails and ads often carry hidden extras. They don&apos;t change the page you
            land on. They exist to tell someone else about you.
          </p>
        </div>

        {/* Anatomy of a tracked link */}
        <div className={`${glass} p-5 sm:p-6 space-y-4`}>
          <p className="text-sm font-medium">Anatomy of a tracked link</p>
          <p className="font-mono text-[13px] sm:text-sm leading-relaxed break-all rounded-lg bg-muted/50 border border-input p-3">
            {EXAMPLE_URL.map((s) => (
              <span
                key={s.text}
                className={
                  s.kind === 'track'
                    ? 'rounded bg-accent/15 text-orange-700 dark:text-orange-300 line-through decoration-orange-400/70'
                    : s.kind === 'keep'
                      ? 'rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                      : 'text-foreground'
                }
              >
                {s.text}
              </span>
            ))}
          </p>
          <ul className="space-y-2 text-sm">
            {EXAMPLE_URL.filter((s) => s.note).map((s) => (
              <li key={s.text} className="flex gap-2.5">
                <span
                  className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                    s.kind === 'track' ? 'bg-orange-400' : 'bg-emerald-500'
                  }`}
                  aria-hidden
                />
                <span>
                  <code className="font-mono text-xs">{Array.from(new URLSearchParams(s.text.replace(/^[?&]/, '')).keys()).join(', ')}</code>
                  <span className="text-muted-foreground">
                    {' '}
                    {s.kind === 'track' ? '(removed)' : '(kept)'}: {s.note}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground">
            The cleaned link still opens exactly the same page:{' '}
            <code className="font-mono text-xs text-foreground break-all">
              https://shop.example.com/shoes/trail-runner?size=10
            </code>
          </p>
        </div>

        {/* Reasons */}
        <div className="grid gap-4 sm:grid-cols-2">
          {REASONS.map(({ icon: Icon, title, body }) => (
            <div key={title} className={`${glass} p-5 space-y-2`}>
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="font-semibold">{title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Privacy ── */}
      <section aria-labelledby="privacy-heading" className={`${glass} p-5 sm:p-6 flex gap-4`}>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div className="space-y-1.5">
          <h2 id="privacy-heading" className="font-semibold">
            Your links stay with you
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Cleaning happens entirely in your browser. There is no account, no analytics and no server storing what you
            paste. The only network request is the optional preview: the <em>cleaned</em> link is sent to{' '}
            <a href="https://microlink.io" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
              microlink.io
            </a>{' '}
            to fetch the page title and image. Your custom block list is saved in this browser only.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If a cleaned link ever stops working, a site may rely on one of the removed parameters. Open{' '}
            <strong className="font-medium text-foreground">Manage Blocked Parameters</strong> and remove it from your list.
          </p>
        </div>
      </section>

      {/* ── Self-host ── */}
      <section aria-labelledby="selfhost-heading" className={`${glass} p-5 sm:p-6 space-y-4`}>
        <div className="flex gap-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <GitFork className="h-5 w-5" />
          </span>
          <div className="space-y-1.5">
            <h2 id="selfhost-heading" className="font-semibold">
              Host your own copy, free
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The code is public on GitHub and deploys to GitHub Pages with no server and no cost. Run your own copy for
              yourself, your family or your team in a few minutes.
            </p>
          </div>
        </div>
        <ol className="grid gap-3 sm:grid-cols-3 text-sm">
          {[
            ['Fork', 'Fork the repository to your GitHub account.'],
            ['Enable Pages', 'Settings → Pages → Source: GitHub Actions.'],
            ['Deploy', 'Run the “Deploy to GitHub Pages” workflow.'],
          ].map(([step, text], i) => (
            <li key={step} className="rounded-xl border border-input bg-muted/40 p-3">
              <p className="font-medium">
                <span className="text-primary">{i + 1}.</span> {step}
              </p>
              <p className="text-muted-foreground mt-0.5">{text}</p>
            </li>
          ))}
        </ol>
        <a
          href={SELF_HOST_GUIDE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline underline-offset-4"
        >
          Read the full setup guide
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </section>
    </div>
  );
}
