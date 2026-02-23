# Advanced Animations — Gym Progress App

## Overview

This app uses a dark "Slate & Electric" theme (deep slate + electric indigo `oklch(0.65 0.22 260)`). Animations must feel **fast, purposeful, and premium** — not flashy. Every motion should reduce cognitive load or communicate state change, never just decorate.

**Stack:**
- `tw-animate-css` — already installed, zero-config Tailwind utility animations
- **Framer Motion** — the recommended primary animation library (install below)
- CSS custom properties + Tailwind v4 keyframes — for GPU-accelerated micro-interactions

---

## 1. Installation — Framer Motion

```bash
cd project
npm install framer-motion
```

Framer Motion is the gold standard for React animation. It integrates seamlessly with Next.js App Router and React 19.

---

## 2. Architecture Principles

### Reduce Motion Respect
Always wrap animations with `useReducedMotion()` to respect accessibility preferences.

```tsx
// lib/animation.ts
import { useReducedMotion } from "framer-motion";

export function useAnimationConfig() {
  const shouldReduce = useReducedMotion();
  return {
    transition: shouldReduce ? { duration: 0 } : { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
    shouldAnimate: !shouldReduce,
  };
}
```

### Shared Variants
Define reusable variants in a central file instead of inline per-component:

```tsx
// lib/animation-variants.ts
import { Variants } from "framer-motion";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] } },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};
```

---

## 3. Page Transitions (App Router)

Wrap page content in a layout-level motion component. Since Next.js App Router doesn't support `AnimatePresence` at the layout level natively, use a client wrapper:

```tsx
// components/shared/PageTransition.tsx
"use client";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animation-variants";

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="flex-1"
    >
      {children}
    </motion.div>
  );
}
```

Use in every `page.tsx`:
```tsx
export default function DashboardPage() {
  return (
    <PageTransition>
      {/* page content */}
    </PageTransition>
  );
}
```

---

## 4. Dashboard Animations

### StatTile — Animated Number Counter
The most impactful dashboard animation: numbers counting up on mount.

```tsx
// components/dashboard/StatTile.tsx (enhanced)
"use client";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

function AnimatedNumber({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(count, value, { duration: 1, ease: "easeOut" });
    return controls.stop;
  }, [value]);

  return <motion.span>{rounded}</motion.span>;
}
```

### DashboardCard — Hover Lift Effect
```tsx
<motion.div
  whileHover={{ y: -3, boxShadow: "0 12px 32px oklch(0.65 0.22 260 / 0.15)" }}
  transition={{ duration: 0.2 }}
  className="rounded-xl bg-card border border-border"
>
```

### Staggered List Rows (RecentSessionRow, PRRow, FriendActivityRow)
```tsx
// Wrap the list container:
<motion.ul variants={staggerContainer} initial="hidden" animate="visible">
  {items.map((item) => (
    <motion.li key={item.id} variants={fadeUp}>
      <RecentSessionRow {...item} />
    </motion.li>
  ))}
</motion.ul>
```

### StartWorkoutBanner — Attention Pulse
Use `tw-animate-css` for a subtle pulsing glow without JS overhead:
```tsx
<div className="animate-pulse-subtle bg-primary/10 border border-primary/30 rounded-xl">
```
Or with Framer Motion for a breathing glow:
```tsx
<motion.div
  animate={{ boxShadow: ["0 0 0px oklch(0.65 0.22 260 / 0)", "0 0 24px oklch(0.65 0.22 260 / 0.3)", "0 0 0px oklch(0.65 0.22 260 / 0)"] }}
  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
>
```

---

## 5. Active Session Animations

### RestTimerBar — Progress Animation
Animate the bar with a CSS custom property for smooth GPU rendering:

```tsx
// components/session/RestTimerBar.tsx
<motion.div
  className="h-1.5 bg-primary rounded-full origin-left"
  initial={{ scaleX: 1 }}
  animate={{ scaleX: 0 }}
  transition={{ duration: restDuration, ease: "linear" }}
  style={{ transformOrigin: "left" }}
/>
```

### SetRow — Completion Feedback
When a set is marked complete, animate a checkmark and fade the row:

```tsx
<motion.div
  animate={isComplete ? { opacity: 0.6, x: 4 } : { opacity: 1, x: 0 }}
  transition={{ duration: 0.25 }}
>
```

### PRBadge — Celebrate with Spring
```tsx
<motion.span
  initial={{ scale: 0, rotate: -10 }}
  animate={{ scale: 1, rotate: 0 }}
  transition={{ type: "spring", stiffness: 400, damping: 15 }}
  className="inline-flex items-center gap-1 text-xs font-bold text-yellow-400"
>
  🏆 PR
</motion.span>
```

### ExerciseAccordion — Smooth Expand/Collapse
Replace CSS height: auto transitions with Framer Motion's layout animation:

```tsx
<motion.div
  initial={false}
  animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
  className="overflow-hidden"
>
```

### SessionSummaryModal — Dramatic Entry
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.9, y: 24 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.95, y: 12 }}
  transition={{ type: "spring", stiffness: 300, damping: 28 }}
  className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
>
```

---

## 6. Navigation & Layout Animations

### Sidebar Active Indicator
Animate a sliding pill indicator behind active nav items:

```tsx
// Render a layoutId-keyed motion.div behind the active link
<motion.div
  layoutId="sidebar-active"
  className="absolute inset-0 rounded-lg bg-accent"
  transition={{ type: "spring", stiffness: 380, damping: 35 }}
/>
```

### Mobile Bottom Sheet / Drawer
```tsx
<motion.div
  initial={{ y: "100%" }}
  animate={{ y: 0 }}
  exit={{ y: "100%" }}
  transition={{ type: "spring", stiffness: 300, damping: 30 }}
  className="fixed bottom-0 left-0 right-0 bg-card rounded-t-2xl"
  drag="y"
  dragConstraints={{ top: 0 }}
  onDragEnd={(_, info) => info.offset.y > 80 && onClose()}
>
```

---

## 7. Data & Charts

### Recharts — Animated Entry
Recharts has built-in animation props; enable them:

```tsx
<LineChart>
  <Line
    isAnimationActive={true}
    animationDuration={800}
    animationEasing="ease-out"
    ...
  />
</LineChart>
```

### Progress Rings / Bars
For custom stat displays, animate stroke-dashoffset:

```tsx
<motion.circle
  initial={{ pathLength: 0 }}
  animate={{ pathLength: progressPercent / 100 }}
  transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
  stroke="oklch(0.65 0.22 260)"
  strokeLinecap="round"
/>
```

---

## 8. Micro-interactions (Tailwind + tw-animate-css)

For simple state changes, prefer pure CSS via Tailwind to avoid JS bundle overhead:

```css
/* globals.css additions */
@layer utilities {
  .hover-lift {
    @apply transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg;
  }
  .press-scale {
    @apply transition-transform duration-100 active:scale-95;
  }
  .glow-primary {
    @apply transition-shadow duration-300 hover:shadow-[0_0_20px_oklch(0.65_0.22_260_/_0.25)];
  }
}
```

Apply across interactive elements:
- Buttons: `press-scale glow-primary`
- Cards: `hover-lift`
- Nav items: `hover-lift`

---

## 9. Form Feedback Animations

### Shake on Error
```tsx
const shakeVariants = {
  shake: {
    x: [0, -8, 8, -6, 6, -3, 3, 0],
    transition: { duration: 0.4 },
  },
};

<motion.div
  variants={shakeVariants}
  animate={hasError ? "shake" : undefined}
>
  <Input ... />
</motion.div>
```

### Success Checkmark
```tsx
<motion.svg viewBox="0 0 24 24" className="w-6 h-6 text-green-500">
  <motion.path
    d="M5 13l4 4L19 7"
    stroke="currentColor"
    strokeWidth={2}
    fill="none"
    initial={{ pathLength: 0 }}
    animate={{ pathLength: 1 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
  />
</motion.svg>
```

---

## 10. Performance Guidelines

| Rule | Reason |
|------|--------|
| Only animate `transform` and `opacity` | These are GPU-composited; no layout reflow |
| Use `will-change: transform` sparingly | Only on elements actively animating |
| Prefer `layoutId` over manual position math | Framer handles FLIP automatically |
| Use `AnimatePresence` for unmount animations | React doesn't support exit animations natively |
| Batch stagger delays ≤ 500ms total | Longer total delays feel sluggish |
| Set `once: true` in `whileInView` | Avoids re-triggering on scroll back |

```tsx
// Scroll-triggered animation example (for long lists)
<motion.div
  variants={fadeUp}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-60px" }}
>
```

---

## 11. AnimatePresence Setup (Global)

Wrap the root layout to enable exit animations everywhere:

```tsx
// app/layout.tsx
"use client";
import { AnimatePresence } from "framer-motion";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} antialiased`}>
        <SessionProvider>
          <AnimatePresence mode="wait">
            {children}
          </AnimatePresence>
        </SessionProvider>
      </body>
    </html>
  );
}
```

> **Note:** If `AnimatePresence` at the layout level causes hydration issues with Next.js App Router, wrap it inside a `"use client"` client boundary component instead.

---

## 12. Priority Implementation Order

| Priority | Component | Animation | Impact |
|----------|-----------|-----------|--------|
| 🔴 High | `StatTile` | Animated number counter | Immediately impressive on dashboard |
| 🔴 High | `PRBadge` | Spring scale-in | Feels rewarding |
| 🔴 High | `RestTimerBar` | Linear progress drain | Functional + beautiful |
| 🟡 Medium | `DashboardCard` | Hover lift + glow | Subtle but premium |
| 🟡 Medium | `ExerciseAccordion` | Smooth height expand | Eliminates jarring jumps |
| 🟡 Medium | Staggered lists | `staggerChildren` on rows | Makes lists feel alive |
| 🟢 Low | Page transitions | `fadeUp` on page enter | Polished navigation |
| 🟢 Low | Sidebar active pill | `layoutId` sliding indicator | Professional nav feel |
| 🟢 Low | `SessionSummaryModal` | Spring scale entry | Dramatic session end |
