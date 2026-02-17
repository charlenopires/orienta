# Design System

> Extracted from: https://cdn.dribbble.com/userupload/15513667/file/original-2f3ae1b73522f6bf02d935a432730c70.png?resize=1024x768&vertical=center
> Generated: 2026-02-16 17:31:51

All UI implementation MUST follow the design tokens defined below.

## CSS Custom Properties

```css
:root {

  /* Primary Colors */
  --color-primary-500: #6366F1;
  --color-primary-400: #818CF8;

  /* Secondary Colors */
  --color-secondary-500: #F59E0B;
  --color-secondary-600: #D97706;

  /* Neutral Colors */
  --color-neutral-900: #0F0F23;
  --color-neutral-800: #1E1E3F;
  --color-neutral-700: #2D2D5A;
  --color-neutral-600: #4B4B78;
  --color-neutral-500: #6B7280;
  --color-neutral-400: #9CA3AF;
  --color-neutral-300: #D1D5DB;
  --color-neutral-100: #F3F4F6;
  --color-neutral-50: #FFFFFF;

  /* Semantic Colors */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 20px;
  --spacing-2xl: 24px;
  --spacing-3xl: 32px;

  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

  /* Breakpoints */
  --breakpoint-mobile: 320px;
  --breakpoint-tablet: 768px;
  --breakpoint-desktop: 1024px;
  --breakpoint-wide: 1280px;
}
```

## Color Palette

### Primary Colors

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--color-primary-500` | `#6366F1` | 99, 102, 241 | Interactive elements and accent colors |
| `--color-primary-400` | `#818CF8` | 129, 140, 248 | Hover states for primary elements |

### Secondary Colors

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--color-secondary-500` | `#F59E0B` | 245, 158, 11 | Warning states and secondary accents |
| `--color-secondary-600` | `#D97706` | 217, 119, 6 | Active secondary elements |

### Neutral Colors

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--color-neutral-900` | `#0F0F23` | 15, 15, 35 | Primary background |
| `--color-neutral-800` | `#1E1E3F` | 30, 30, 63 | Card backgrounds |
| `--color-neutral-700` | `#2D2D5A` | 45, 45, 90 | Button backgrounds |
| `--color-neutral-600` | `#4B4B78` | 75, 75, 120 | Borders and dividers |
| `--color-neutral-500` | `#6B7280` | 107, 114, 128 | Secondary text |
| `--color-neutral-400` | `#9CA3AF` | 156, 163, 175 | Placeholder text |
| `--color-neutral-300` | `#D1D5DB` | 209, 213, 219 | Light borders |
| `--color-neutral-100` | `#F3F4F6` | 243, 244, 246 | Light backgrounds |
| `--color-neutral-50` | `#FFFFFF` | 255, 255, 255 | Primary text and icons |

### Semantic Colors

| Role | Hex |
|------|-----|
| success | `#10B981` |
| warning | `#F59E0B` |
| error | `#EF4444` |
| info | `#3B82F6` |

## Typography

### Font Families

| Family | Category | Weights | Usage |
|--------|----------|---------|-------|
| Inter | sans-serif | 400, 500, 600, 700 | Primary UI font for all text elements |

### Type Scale

| Token | Size | Weight | Line Height |
|-------|------|--------|-------------|
| `heading-xl` | 32px | 700 | 1.2 |
| `heading-lg` | 24px | 600 | 1.3 |
| `heading-md` | 20px | 600 | 1.4 |
| `body-lg` | 16px | 500 | 1.5 |
| `body-md` | 14px | 400 | 1.5 |
| `body-sm` | 12px | 400 | 1.4 |
| `caption` | 11px | 400 | 1.3 |

## Spacing Scale

| Token | Value |
|-------|-------|
| `--spacing-xs` | 4px |
| `--spacing-sm` | 8px |
| `--spacing-md` | 12px |
| `--spacing-lg` | 16px |
| `--spacing-xl` | 20px |
| `--spacing-2xl` | 24px |
| `--spacing-3xl` | 32px |

## Border Radius

| Token | Value |
|-------|-------|
| `--radius-sm` | 6px |
| `--radius-md` | 8px |
| `--radius-lg` | 12px |
| `--radius-xl` | 16px |

## Shadows

| Token | Value |
|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0, 0, 0, 0.05)` |
| `--shadow-md` | `0 4px 6px -1px rgba(0, 0, 0, 0.1)` |
| `--shadow-lg` | `0 10px 15px -3px rgba(0, 0, 0, 0.1)` |

## Breakpoints

| Name | Min Width |
|------|-----------|
| mobile | 320px |
| tablet | 768px |
| desktop | 1024px |
| wide | 1280px |

## Components

### Button

Interactive button element

**Variants:** primary, secondary, ghost, outline

**States:** default, hover, active, disabled

### Card

Container for grouped content

**Variants:** default, elevated

**States:** default, hover

### Navigation

Top navigation bar

**Variants:** horizontal

**States:** default

### Table

Data table component (used in student list)

**Variants:** default, compact

**States:** default, loading

### Badge

Status indicator

**Variants:** success, warning, error, neutral

**States:** default

### Avatar

User profile image

**Variants:** small, medium, large

**States:** default, online

### Input

Form input field

**Variants:** text, search

**States:** default, focus, error

### Dropdown

Select dropdown menu

**Variants:** default

**States:** closed, open

### Toggle

Switch toggle component

**Variants:** default

**States:** on, off

### Accordion

Collapsible section component (used in checklist sections and ponderation details)

**Variants:** default

**States:** open, closed

### Sheet

Side panel overlay (used in student form)

**Variants:** default

**States:** open, closed

### Dialog

Modal dialog component (used for confirmations)

**Variants:** default

**States:** open, closed

### Combobox

Searchable select component (used for student selection in evaluation form)

**Variants:** default

**States:** closed, open, searching

