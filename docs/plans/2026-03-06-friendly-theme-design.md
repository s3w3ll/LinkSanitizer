# Friendly Theme Design — LinkSanitizer
_Date: 2026-03-06_

## Approach
Glassmorphism card on a warm violet→sky→teal gradient page background. Friendly & approachable consumer-tool aesthetic.

## Colour Tokens
- `--primary`: richer violet-blue (`252 80% 65%`)
- `--accent`: warm coral (`14 90% 68%`)
- `--radius`: bumped to `0.75rem`
- Dark mode base: deep indigo (`222 47% 11%`) for warmth

## Page Background
Fixed `linear-gradient(135deg, violet-100, sky-100, teal-100)` on `body` in `globals.css`.

## Card
`bg-white/75 backdrop-blur-xl border-white/60 shadow-2xl` with a `fadeSlideUp` entrance animation.

## Inputs & Buttons
- Input focus ring: violet primary with soft glow
- Copy button: pill shape with gradient fill
- Add/Reset buttons: soft outlined pills

## Badges
- Blocked params: rounder, hover tints violet
- Quick-add (URL params found): warm coral tint

## Animations
- `fadeSlideUp` keyframe: card entrance (0.4s)
- `shimmer` keyframe: skeleton loading pulse

## Files to Change
1. `src/app/globals.css` — tokens, gradient, keyframes
2. `src/app/page.tsx` — remove bg-background class, apply animation wrapper
3. `src/components/link-sanitizer-card.tsx` — card glass classes, pill buttons, badge tints
4. `src/components/ui/link-preview-display.tsx` — shimmer skeleton
