# Friendly Theme Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Apply a glassmorphism card + warm violet→sky→teal gradient aesthetic to LinkSanitizer.

**Architecture:** All changes are confined to `globals.css` (tokens + background + keyframes), `page.tsx` (layout wrapper), `link-sanitizer-card.tsx` (card/button/badge classes), and `link-preview-display.tsx` (shimmer skeleton). No new dependencies.

**Tech Stack:** Next.js 15, Tailwind CSS 3, shadcn/ui, CSS custom properties.

---

### Task 1: Rework globals.css — tokens, gradient background, keyframes

**Files:**
- Modify: `src/app/globals.css`

**Step 1: Replace the `:root` token block**

Replace the entire `:root { ... }` block with:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 250 25% 18%;

  --card: 0 0% 100%;
  --card-foreground: 250 25% 18%;

  --popover: 0 0% 100%;
  --popover-foreground: 250 25% 18%;

  --primary: 252 80% 65%;
  --primary-foreground: 0 0% 100%;

  --secondary: 252 30% 94%;
  --secondary-foreground: 252 40% 35%;

  --muted: 252 20% 94%;
  --muted-foreground: 252 15% 50%;

  --accent: 14 90% 68%;
  --accent-foreground: 0 0% 100%;

  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 98%;

  --border: 252 20% 88%;
  --input: 252 20% 88%;
  --ring: 252 80% 65%;

  --radius: 0.75rem;

  --chart-1: 252 80% 65%;
  --chart-2: 173 58% 39%;
  --chart-3: 197 37% 24%;
  --chart-4: 43 74% 66%;
  --chart-5: 14 90% 68%;

  --sidebar-background: 0 0% 98%;
  --sidebar-foreground: 240 5.3% 26.1%;
  --sidebar-primary: 252 80% 65%;
  --sidebar-primary-foreground: 0 0% 98%;
  --sidebar-accent: 252 30% 94%;
  --sidebar-accent-foreground: 252 40% 35%;
  --sidebar-border: 252 20% 88%;
  --sidebar-ring: 252 80% 65%;
}
```

**Step 2: Replace the `.dark` token block**

```css
.dark {
  --background: 222 47% 11%;
  --foreground: 252 20% 90%;
  --card: 222 40% 15%;
  --card-foreground: 252 20% 90%;
  --popover: 222 40% 15%;
  --popover-foreground: 252 20% 90%;
  --primary: 252 80% 70%;
  --primary-foreground: 0 0% 100%;
  --secondary: 222 35% 22%;
  --secondary-foreground: 252 20% 80%;
  --muted: 222 35% 22%;
  --muted-foreground: 252 15% 60%;
  --accent: 14 90% 68%;
  --accent-foreground: 0 0% 100%;
  --destructive: 0 70% 50%;
  --destructive-foreground: 0 0% 98%;
  --border: 222 35% 26%;
  --input: 222 35% 26%;
  --ring: 252 80% 70%;
  --chart-1: 252 80% 70%;
  --chart-2: 160 60% 45%;
  --chart-3: 30 80% 55%;
  --chart-4: 280 65% 60%;
  --chart-5: 14 90% 68%;
  --sidebar-background: 222 47% 9%;
  --sidebar-foreground: 252 20% 90%;
  --sidebar-primary: 252 80% 70%;
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 222 35% 22%;
  --sidebar-accent-foreground: 252 20% 80%;
  --sidebar-border: 222 35% 26%;
  --sidebar-ring: 252 80% 70%;
}
```

**Step 3: Add gradient background + keyframes after the `@layer base` block**

Append to the end of `globals.css`:

```css
/* ── Page gradient background ── */
body {
  background: linear-gradient(135deg,
    #ede9fe 0%,    /* violet-100  */
    #e0f2fe 45%,   /* sky-100     */
    #ccfbf1 100%   /* teal-100    */
  );
  background-attachment: fixed;
  min-height: 100vh;
}

.dark body,
body.dark {
  background: linear-gradient(135deg,
    #1e1b4b 0%,    /* indigo-950  */
    #0c1a3a 50%,   /* deep navy   */
    #0d2a2a 100%   /* dark teal   */
  );
  background-attachment: fixed;
}

/* ── Entrance animation ── */
@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-slide-up {
  animation: fadeSlideUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
}

/* ── Shimmer skeleton ── */
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}

.shimmer {
  background: linear-gradient(
    90deg,
    hsl(var(--muted)) 25%,
    hsl(var(--muted-foreground) / 0.08) 50%,
    hsl(var(--muted)) 75%
  );
  background-size: 800px 100%;
  animation: shimmer 1.6s infinite linear;
}
```

**Step 4: Verify build still passes**

```bash
cd /c/Repos/LinkSanitizer && npm run build
```
Expected: `✓ Generating static pages (5/5)` with no errors.

**Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "style: rework tokens to violet palette + gradient background + keyframes"
```

---

### Task 2: Update page.tsx — remove conflicting bg class, add entrance animation

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Remove `bg-background` from the outer div, add animation class**

The outer `<div>` currently reads:
```tsx
<div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-8 selection:bg-primary/20 selection:text-primary">
```

Replace with:
```tsx
<div className="flex flex-col items-center min-h-screen p-4 sm:p-8 selection:bg-primary/20 selection:text-primary">
```

**Step 2: Wrap `<main>` in the entrance animation div**

The current `<main>` block:
```tsx
<main className="w-full max-w-2xl">
  <LinkSanitizerCard />
</main>
```

Replace with:
```tsx
<main className="w-full max-w-2xl animate-fade-slide-up">
  <LinkSanitizerCard />
</main>
```

**Step 3: Verify build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "style: remove bg-background override, add card entrance animation"
```

---

### Task 3: Apply glassmorphism to the Card and restyle buttons + badges

**Files:**
- Modify: `src/components/link-sanitizer-card.tsx`

**Step 1: Apply glass effect to the outer Card**

Find:
```tsx
<Card className="w-full shadow-xl">
```

Replace with:
```tsx
<Card className="w-full bg-white/75 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-2xl shadow-violet-200/30 dark:shadow-black/40">
```

**Step 2: Style the Copy button as a gradient pill**

Find:
```tsx
className={cn(
  "bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-150 ease-in-out shrink-0",
  isCopied && "bg-green-600 hover:bg-green-700 scale-105"
)}
```

Replace with:
```tsx
className={cn(
  "rounded-full bg-gradient-to-r from-primary to-violet-500 text-white hover:opacity-90 transition-all duration-200 shadow-md shadow-primary/25 shrink-0",
  isCopied && "from-emerald-500 to-teal-500 shadow-emerald-300/30 scale-105"
)}
```

**Step 3: Style the Add Parameter button as a pill**

Find:
```tsx
<Button onClick={handleAddParameter} className="shrink-0">Add</Button>
```

Replace with:
```tsx
<Button onClick={handleAddParameter} className="shrink-0 rounded-full bg-gradient-to-r from-primary to-violet-500 text-white hover:opacity-90 shadow-sm shadow-primary/20">Add</Button>
```

**Step 4: Tint quick-add suggestion badges with coral accent**

Find the `suggestedParams.map(...)` Badge:
```tsx
<Badge key={param} variant="outline" className="py-1 px-2.5 text-xs items-center">
```

Replace with:
```tsx
<Badge key={param} variant="outline" className="py-1 px-2.5 text-xs items-center border-accent/40 bg-accent/10 text-accent-foreground/80 hover:bg-accent/20 transition-colors">
```

**Step 5: Give blocked-params badges a violet tint on hover**

Find the `trackingParams.map(...)` Badge:
```tsx
<Badge key={param} variant="secondary" className="text-sm font-normal py-1 px-2.5 items-center">
```

Replace with:
```tsx
<Badge key={param} variant="secondary" className="text-sm font-normal py-1 px-2.5 items-center hover:bg-primary/15 transition-colors">
```

**Step 6: Verify build**

```bash
npm run build
```

**Step 7: Commit**

```bash
git add src/components/link-sanitizer-card.tsx
git commit -m "style: glassmorphism card, gradient pill buttons, tinted badges"
```

---

### Task 4: Apply shimmer skeleton to the link preview display

**Files:**
- Modify: `src/components/ui/link-preview-display.tsx`

**Step 1: Apply glass effect to the preview Card**

Find:
```tsx
<Card className="mt-4 w-full shadow-md overflow-hidden">
```

Replace with:
```tsx
<Card className="mt-4 w-full bg-white/70 dark:bg-white/5 backdrop-blur-lg border border-white/50 dark:border-white/10 shadow-xl shadow-violet-100/40 dark:shadow-black/30 overflow-hidden">
```

Also update the error card:
```tsx
<Card className="mt-4 w-full shadow-md border-destructive">
```
Replace with:
```tsx
<Card className="mt-4 w-full bg-white/70 dark:bg-white/5 backdrop-blur-lg border border-destructive/50 shadow-xl overflow-hidden">
```

**Step 2: Replace Skeleton elements with shimmer divs in the loading state**

Find the loading return block containing `<Skeleton ...>` elements and replace the entire loading `return` with:

```tsx
if (isLoading) {
  return (
    <Card className="mt-4 w-full bg-white/70 dark:bg-white/5 backdrop-blur-lg border border-white/50 dark:border-white/10 shadow-xl overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="shimmer h-40 w-full rounded-lg" />
        <div className="space-y-2">
          <div className="shimmer h-5 w-3/4 rounded-md" />
          <div className="shimmer h-4 w-full rounded-md" />
          <div className="shimmer h-4 w-2/3 rounded-md" />
          <div className="shimmer h-3 w-1/3 rounded-md mt-1" />
        </div>
      </CardContent>
    </Card>
  );
}
```

**Step 3: Verify build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add src/components/ui/link-preview-display.tsx
git commit -m "style: glass preview card, shimmer skeleton loading state"
```

---

### Task 5: Start dev server and visual check

**Step 1: Run dev server**

```bash
npm run dev
```

Open `http://localhost:3000` and verify:
- [ ] Gradient background fills the viewport and doesn't scroll
- [ ] Card appears frosted/translucent against the gradient
- [ ] Card animates in on load (fade + slide up)
- [ ] Copy button is a gradient pill
- [ ] Pasting a URL with tracking params shows coral suggestion badges
- [ ] Blocked params list badges have violet hover tint
- [ ] Preview skeleton uses shimmer effect
- [ ] Dark mode (toggle via browser devtools) shows deep indigo gradient

**Step 2: Final build check**

```bash
npm run build
```
Expected: clean build, `✓ Exporting (3/3)`.
