# Design System & Theming

This document outlines the core design tokens for the Academic Engagement, Student Risk & Academic Support Management System.

## Colors
- **Sidebar (Deep Purple):** Deep Royal Purple (`#4C1D95` to `#5B21B6`). Modern, premium, and well-organized.
- **Background (Light Purple):** Soft canvas (`#F5F3FF` / `purple-50`). Low eye strain and clean modern look.
- **Cards (White):** Pure White (`#FFFFFF`) with subtle purple border (`#E5E0F5`) and soft micro-elevation.
- **Primary Purple:** Academic Purple (`#7C3AED` / `purple-600`). Used for active navigation, primary action buttons, key metrics, and focus rings.
- **Secondary Purple:** Vibrant Violet (`#8B5CF6` / `purple-500`) and Soft Purple (`#EDE9FE` / `purple-100`).
- **Dark Text:** `#1F1B2D` (for headings and primary readability) and `#6B6480` (for secondary labels).
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
