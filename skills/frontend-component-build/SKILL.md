---
name: frontend-component-build
description: Standards, design thinking guidelines, and workflow for crafting clean, accessible, and responsive React/Next.js frontend components with Tailwind CSS.
---

# Frontend Component Build Skill

A comprehensive standard for engineering production-grade, user-centric frontend components using **Design Thinking**, **Atomic Design**, and modern React/Next.js patterns.

---

## 💎 Double Diamond Component Philosophy

```
  DISCOVER (User Needs)          DEFINE (Scope & Props)         DEVELOP (Code & UI)            DELIVER (Polish & Test)
┌─────────────────────────┐    ┌─────────────────────────┐    ┌─────────────────────────┐    ┌─────────────────────────┐
│ • Who uses this?        │    │ • What props are needed?│    │ • Semantic HTML markup  │    │ • Responsive validation │
│ • What action is taken? │ ──>│ • What states exist?    │ ──>│ • Tailwind styling      │ ──>│ • Keyboard & A11y check │
│ • What feedback occurs? │    │ • Error/Empty fallbacks │    │ • Micro-interactions    │    │ • Zero-layout-shift     │
└─────────────────────────┘    └─────────────────────────┘    └─────────────────────────┘    └─────────────────────────┘
```

---

## 📐 1. Architectural Standards

### A. Component File Anatomy
Every component file must follow a predictable, top-down structure:

1. **Directive & Imports:** `"use client"` (if using hooks/browser APIs), React, Icons, Types.
2. **TypeScript Interface:** Explicit `Props` interface with strict typing (no `any`).
3. **Constants & Helpers:** Pure helper functions or static configuration outside the render cycle.
4. **Component Implementation:**
   - Props destructuring
   - Local state definitions
   - Refs & side effects (`useEffect`)
   - Event handlers
   - Render returns (semantic markup)

### B. Standard Component Template
```tsx
"use client";

import React, { useState } from "react";
import { LucideIcon } from "lucide-react";

export interface ComponentNameProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  isLoading?: boolean;
  onAction?: () => void;
  className?: string;
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  title,
  description,
  icon: Icon,
  isLoading = false,
  onAction,
  className = "",
}) => {
  return (
    <div className={`p-4 rounded-xl border border-slate-800 bg-slate-900/80 text-white ${className}`}>
      {/* Visual Hierarchy */}
      <div className="flex items-center space-x-3">
        {Icon && <Icon className="w-5 h-5 text-orange-400 flex-shrink-0" />}
        <div>
          <h4 className="text-sm font-semibold">{title}</h4>
          {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
        </div>
      </div>
    </div>
  );
};
```

---

## 🛡️ 2. The 4 Essential UI States

Every interactive component MUST handle all 4 states gracefully:

| State | Design Requirement | Implementation Pattern |
| :--- | :--- | :--- |
| **Idle / Default** | Clean visual hierarchy, prominent primary action | Standard theme styling, readable typography |
| **Active / Loading** | Instant tactile feedback, spinner or shimmer | `disabled`, `animate-spin`, `opacity-60` |
| **Error / Failed** | Descriptive, non-technical explanation + retry | Red/amber alert banner, retry action button |
| **Empty / Zero** | Helpful prompt guiding the user to start | Subtle dashed border, friendly icon & hint |

---

## 🎨 3. Styling & Micro-Interaction Rules

1. **Mobile-First Layout:** Use responsive Tailwind utility prefixes (`sm:`, `md:`, `lg:`) for all layout containers.
2. **Touch Targets:** Interactive targets (buttons, inputs, dropdowns) must have a minimum tap area of **44x44px** on mobile.
3. **Contrast & Readability:** Text on dark themes must maintain WCAG AA contrast (e.g., `text-white` for titles, `text-slate-300` for body, `text-slate-400` for secondary metadata).
4. **Transition Physics:** Keep micro-interactions fast and snappy (`transition-all duration-200 active:scale-95`).

---

## ♿ 4. Accessibility (A11y) Checklist

- [ ] All icon-only buttons include an `aria-label` or `title`.
- [ ] Visual state changes (loading, recording) are announced with appropriate text equivalents.
- [ ] Interactive elements are navigable using `Tab` and actionable with `Enter` / `Space`.
- [ ] Color is never the sole indicator of critical status; pair colors with icons or descriptive text badges.

---

## 🧪 5. Verification & Testing Routine

Before shipping any component:
1. Run `npm run build` to verify strict TypeScript and JSX compilation.
2. Resize viewport from 375px (mobile) to 1440px (desktop) to guarantee zero horizontal overflow.
3. Verify that removing mock data displays the empty state cleanly without rendering `undefined` or crashing.

