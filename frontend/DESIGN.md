# Design System & Theming

This document outlines the core design tokens for the Academic Engagement, Student Risk & Academic Support Management System.

## Colors
- **Primary:** Deep Indigo (`indigo-600` / `#4f46e5`). Conveys a professional, trustworthy, and academic feel.
- **Neutral:** Slate scale (`slate-50` to `slate-900`). Used for backgrounds, text, and borders.
- **Semantic:**
  - **Success:** Emerald (`emerald-500` / `#10b981`). Used for passing grades, completed tasks.
  - **Warning:** Amber (`amber-500` / `#f59e0b`). Used for mid-risk, pending actions.
  - **Danger:** Rose (`rose-500` / `#f43f5e`). Used for backlogs, high-risk status.
  - **Info:** Sky (`sky-500` / `#0ea5e9`). Used for informational alerts, guidance.

## Typography
- **Font Family:** System Sans-serif (Inter/Roboto default via Tailwind).
- **Scale:**
  - **Page Title:** `text-2xl font-semibold`
  - **Section Header:** `text-lg font-medium`
  - **Body:** `text-base font-normal text-slate-700`
  - **Caption/Small:** `text-sm font-normal text-slate-500`

## Spacing & Layout
- **Rhythm:** 8px base rhythm.
  - Small gap: `4px` (`gap-1`, `p-1`)
  - Standard gap/padding: `16px` (`gap-4`, `p-4`)
  - Section gap: `32px` (`gap-8`, `py-8`)
- **Container:** Max-width constrained for readability on large screens, standard padding on mobile.

## Shapes & Radii
- **Cards/Dialogs:** `rounded-lg` (8px radius)
- **Inputs/Buttons:** `rounded-md` (6px radius)
- **Badges:** `rounded-full` for pill-shape or `rounded-md` for standard badges.

## Shadows & Elevation
- **Cards:** `shadow-sm` (subtle border and soft shadow)
- **Dropdowns/Dialogs:** `shadow-lg` (higher elevation)

## Components Rules
- **KPI Cards:** Icon (primary color), Label (muted), Big Number (bold), Context line (small, muted/colored).
- **Badges:** Must always have an icon + text label + color. Never rely on color alone for accessibility.
- **Empty/Error States:** Must use illustrations/icons and friendly text. Never a blank screen.
