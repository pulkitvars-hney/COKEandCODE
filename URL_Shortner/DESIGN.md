# Design System — Shortly

Last updated: 2026-09-08.

---

## 1. Design Philosophy

Shortly is a URL shortener SaaS. Users create short links, manage them, view analytics, and manage subscriptions. The interface must be invisible — a clear, fast surface for getting work done.

The design system serves **two distinct experiences**:

1. **Marketing / Landing** — public-facing, persuasive, visually richer. First impressions matter here. Can use more expressive typography, subtle depth, and restrained decorative elements.
2. **Authenticated Application** — tool-oriented, information-dense, highly restrained. Every pixel earns its place. No decoration.

Both experiences share the same token foundation and component library. The difference is *how much* of the expressive layer each surface activates.

---

## 2. Principles

- **Functional first.** Every element exists to support a task.
- **Restrained.** No decoration for decoration's sake. Blue is the sole accent.
- **Dense but readable.** Maximize useful content per viewport without sacrificing legibility.
- **Consistent.** Same component, same appearance, same behavior across all surfaces.
- **Accessible.** All text meets WCAG AA contrast. Focus states are always visible. Keyboard navigation is complete.
- **Predictable.** Users should never have to guess what something does or where it leads.
- **Dual-mode by design.** Marketing surfaces may be expressive; application surfaces are not.

---

## 3. Two Experiences

### 3.1 Marketing / Landing Experience

The landing page is the only surface where visual expressiveness is permitted. It must feel polished and trustworthy, but never overwhelming.

**Allowed expressive treatments:**
- Larger typography (hero heading up to `2.5rem`)
- Subtle background depth (very light gradient or soft radial wash on hero section only)
- Slightly elevated cards with soft shadow (in addition to border)
- Decorative illustrations or icons (line art, muted accent colors)
- Animated counters or number highlights (subtle, performant)
- Section transitions (fade-in on scroll, if implemented)

**Not allowed even on landing:**
- Glassmorphism / `backdrop-filter: blur`
- Heavy decorative gradients or blobs
- Floating or pulsing animations
- Neon or saturated accent colors beyond blue
- Oversized typography above `2.5rem`
- Complex multi-column layouts that break on mobile

**Landing surfaces:**
- Hero section
- Pricing section
- How it works / features section
- Footer

### 3.2 Authenticated Application Experience

The application is a tool. It must be information-dense, fast, and completely free of decoration.

**Rules:**
- No decorative gradients, patterns, or background imagery
- No elevated cards with shadows (cards use `1px border` only)
- No animations beyond functional transitions (hover, focus, open/close)
- No oversized typography. Maximum `1.5rem` for any text
- No decorative illustrations in data views
- No color beyond the semantic system (accent, success, warning, danger)

**Application surfaces:**
- Dashboard (URL list, stats, creation form)
- Analytics (charts, breakdowns, recent clicks)
- Subscription (plan cards, billing history)
- Authentication (login, signup)
- Expired / 404 pages

---

## 4. Visual Exploration (Pre-Lock)

Before the final palette is locked, the following exploration directions should be considered:

### Direction A — Neutral Professional (Current)
- Blue accent (`#2563eb` light / `#3b82f6` dark)
- Cool gray backgrounds
- Minimal depth, border-first definition
- Feels like Linear, Vercel, or Notion

### Direction B — Warm Neutral
- Teal or slate-blue accent
- Warm gray backgrounds (`#f8f7f5` light)
- Slightly softer borders
- Feels like Stripe or Figma

### Direction C — High Contrast
- Deeper blacks and whites
- Sharper accent (saturated blue or indigo)
- Stronger borders, more contrast
- Feels like a developer tool (GitHub, Railway)

**After exploration, one direction is selected and this document is updated to reflect the final choice.** The current selection is **Direction A — Neutral Professional**.

---

## 5. Color Palette

### 5.1 Light Mode

| Token | Value | Usage |
|---|---|---|
| `--bg-base` | `#f5f6f8` | Page background |
| `--bg-surface` | `#ffffff` | Cards, panels, elevated surfaces |
| `--bg-muted` | `#eef0f4` | Disabled states, subtle fills |
| `--bg-hover` | `#f0f1f4` | Row hover, interactive surface hover |
| `--border` | `#d8dbe3` | Default borders, separators |
| `--border-strong` | `#b0b5c1` | Emphasized borders, input focus |
| `--text-primary` | `#111318` | Headings, primary body text |
| `--text-secondary` | `#555b6a` | Labels, secondary text |
| `--text-muted` | `#8b91a0` | Placeholders, captions |
| `--accent` | `#2563eb` | Links, primary buttons, active indicators |
| `--accent-hover` | `#1d4ed8` | Accent hover |
| `--accent-muted` | `#eff4ff` | Accent background fills (badges, chips) |
| `--success` | `#16a34a` | Success states, active status |
| `--warning` | `#d97706` | Warning states, expiry approaching |
| `--danger` | `#dc2626` | Errors, destructive actions, expired |
| `--danger-muted` | `#fef2f2` | Error background fills |

### 5.2 Dark Mode

| Token | Value | Usage |
|---|---|---|
| `--bg-base` | `#0f1117` | Page background |
| `--bg-surface` | `#1a1d27` | Cards, panels |
| `--bg-muted` | `#242833` | Disabled states, fills |
| `--bg-hover` | `#282c38` | Row hover |
| `--border` | `#2e3345` | Default borders |
| `--border-strong` | `#464d63` | Emphasized borders |
| `--text-primary` | `#e8eaef` | Headings, body |
| `--text-secondary` | `#9ba1b2` | Labels |
| `--text-muted` | `#6b7185` | Placeholders |
| `--accent` | `#3b82f6` | Links, primary buttons |
| `--accent-hover` | `#60a5fa` | Accent hover |
| `--accent-muted` | `#172554` | Accent fills |
| `--success` | `#22c55e` | Success |
| `--warning` | `#f59e0b` | Warning |
| `--danger` | `#ef4444` | Errors |
| `--danger-muted` | `#2a1215` | Error fills |

### 5.3 Rules

- **No purple, violet, or violet-blue gradients.** Blue is the sole accent.
- Accent is used for: links, primary buttons, active nav items, selected states, checkboxes, radio buttons, toggle active track.
- Accent never fills entire backgrounds. It is always local and restrained.
- Semantic colors (success, warning, danger) are never combined with accent in a single element.
- On landing surfaces, accent may appear in decorative elements (illustrations, section backgrounds) at reduced opacity.

---

## 6. Typography

**Font:** Inter (or system stack fallback: `ui-sans-serif, system-ui, -apple-system, sans-serif`)

### 6.1 Application Typography

| Role | Weight | Size | Line height | Usage |
|---|---|---|---|---|
| Page title | 700 | 1.5rem / 24px | 1.3 | Page headings |
| Section title | 600 | 1.125rem / 18px | 1.4 | Card headers, section labels |
| Body | 400 | 0.875rem / 14px | 1.5 | Default text, descriptions |
| Small / Caption | 400 | 0.75rem / 12px | 1.4 | Metadata, timestamps, table cells |
| Label | 500 | 0.8125rem / 13px | 1.4 | Form labels, badges |
| Button | 600 | 0.8125rem / 13px | 1 | Button text |
| Code / Mono | 400 | 0.8125rem / 13px | 1.5 | URLs, codes, technical values |

### 6.2 Landing Typography

| Role | Weight | Size | Line height | Usage |
|---|---|---|---|---|
| Hero heading | 700 | 2.5rem / 40px | 1.15 | Landing hero title |
| Hero subheading | 400 | 1.125rem / 18px | 1.5 | Hero description text |
| Section heading | 700 | 1.75rem / 28px | 1.25 | Landing section titles |
| Feature card title | 600 | 1rem / 16px | 1.4 | Feature card headings |
| Feature card body | 400 | 0.875rem / 14px | 1.5 | Feature descriptions |

### 6.3 Rules

- Never use font sizes above `2.5rem` (landing) or `1.5rem` (application).
- Headings are dark (`--text-primary`). Body is primary. Captions are muted.
- Code/monospace for: short URLs, aliases, API tokens, technical identifiers.
- Text alignment: left-aligned everywhere. Center alignment only for empty states, standalone labels, and landing hero.
- No decorative fonts. No serif fonts. No script fonts.

---

## 7. Morphism and Depth Strategy

### 7.1 What is used

| Treatment | Where | Details |
|---|---|---|
| `1px solid --border` | Cards, inputs, tables, panels | Primary surface definition. Used everywhere. |
| `box-shadow: sm` | Dropdowns, popovers, tooltips | Subtle elevation for floating elements. |
| `box-shadow: md` | Modals, floating panels | Medium elevation for overlay content. |
| Focus ring | All interactive elements | `0 0 0 2px var(--accent-muted), 0 0 0 4px var(--accent)` |

### 7.2 What is NOT used

| Treatment | Why |
|---|---|
| Glassmorphism (`backdrop-filter: blur`) | Reduces readability, adds rendering cost, inconsistent across browsers. Not appropriate for information-dense UIs. |
| Neumorphism | Poor contrast, fails accessibility, decorative. |
| Heavy drop shadows on cards | Cards are defined by borders, not shadows. Shadows are reserved for floating/overlay elements. |
| Inner shadows | Decorative, not functional. |
| Colored shadows | Decorative, not functional. |

### 7.3 Landing-specific depth

On the landing page only, cards may receive a very subtle additional shadow to create visual hierarchy between feature cards and the background:

```css
/* Landing feature cards only */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.03);
```

This shadow is **never** used in the application UI.

---

## 8. Spacing

Base unit: `4px`. All spacing is a multiple of 4.

| Token | Value | Usage |
|---|---|---|
| `--space-1` | `4px` | Inline icon gaps, tight padding |
| `--space-2` | `8px` | Input padding-y, badge padding, small gaps |
| `--space-3` | `12px` | Card padding, row padding, gap between related items |
| `--space-4` | `16px` | Section padding, form field spacing |
| `--space-5` | `20px` | Card internal spacing (horizontal) |
| `--space-6` | `24px` | Section gaps, panel padding |
| `--space-8` | `32px` | Page padding, major section spacing |
| `--space-10` | `40px` | Page vertical rhythm |
| `--space-12` | `48px` | Large section separators |
| `--space-16` | `64px` | Landing section gaps |

### Rules

- Consistent padding inside cards: `24px` horizontal, `20px` vertical.
- Form fields: `12px` vertical, `12px` horizontal. Label above field with `6px` gap.
- Table cells: `12px` vertical, `16px` horizontal.
- Page content area: `24px` to `32px` padding on all sides at desktop. `16px` on mobile.
- Gaps between sibling sections: `32px` (application), `48px`–`64px` (landing).

---

## 9. Border Radius

Minimal. The interface is structured and rectangular.

| Element | Radius |
|---|---|
| Buttons | `6px` |
| Inputs, textareas | `6px` |
| Cards, panels | `8px` |
| Badges, pills | `9999px` |
| Avatars | `50%` |
| Tooltips | `4px` |
| Modals | `10px` |
| Landing feature cards | `10px` (slightly softer for marketing) |

No cards with `24px+` radius in the application. Pill-shaped buttons are not used (pill badges are acceptable). The visual language is angular and structured, not soft.

---

## 10. Shadows

Shadows are minimal and functional. They indicate elevation, not decoration.

| Level | Value | Usage |
|---|---|---|
| None | `none` | Default for most application surfaces |
| Sm | `0 1px 2px rgba(0,0,0,0.06)` | Dropdowns, popovers, tooltips |
| Md | `0 2px 8px rgba(0,0,0,0.08)` | Modals, floating panels |
| Landing | `0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)` | Landing feature cards only |
| Focus ring | `0 0 0 2px var(--accent-muted), 0 0 0 4px var(--accent)` | Focus indication |

### Rules

- No large diffuse shadows in the application.
- No colored shadows anywhere.
- Cards in the application use a `1px` border, not a shadow, for definition.
- Only floating elements (dropdowns, modals, tooltips) use shadows in the application.
- The focus ring is the most prominent shadow in the system.

---

## 11. Motion System

### 11.1 Application Motion

Motion in the application is strictly functional. No decorative animations.

| Property | Duration | Easing | Usage |
|---|---|---|---|
| `opacity` fade | 150ms | `ease-out` | Element appearing/disappearing |
| `transform` slide | 200ms | `ease-out` | Sidebar open/close, dropdown open |
| `background-color` | 100ms | `ease` | Hover state changes |
| `border-color` | 100ms | `ease` | Focus state changes |
| `box-shadow` | 150ms | `ease-out` | Focus ring appearance |

### 11.2 Landing Motion

The landing page may use slightly more expressive motion, but it must be subtle and performant.

| Property | Duration | Easing | Usage |
|---|---|---|---|
| Fade in on scroll | 400ms | `ease-out` | Sections appearing as user scrolls |
| Number counter | 600ms | `ease-out` | Stat counters animating to final value |
| Card hover lift | 200ms | `ease` | Feature cards lifting slightly on hover |

### 11.3 Rules

- No floating, pulsing, bouncing, or spinning decorative animations.
- No `@keyframes` for decorative effects.
- All motion must respect `prefers-reduced-motion: reduce`.
- Animations must not block interaction.
- Loading spinners are functional, not decorative.
- Skeleton pulse is `opacity` only, no shimmer or gradient animation.

---

## 12. Layout

### 12.1 Application Shell

```
┌──────────────────────────────────────────────┐
│ Top bar (height: 48px)                       │
│ Logo · Nav links · User menu                 │
├──────────┬───────────────────────────────────┤
│ Sidebar  │ Content area                      │
│ (240px)  │ (fluid)                           │
│          │                                   │
│          │                                   │
└──────────┴───────────────────────────────────┘
```

- **Top bar:** Sticky. Height `48px`. Background `--bg-surface`. Bottom border `1px solid --border`. Contains hamburger (mobile), logo/brand (mobile), theme toggle, user identifier, logout button.
- **Sidebar:** Fixed width `240px` on desktop. Contains section navigation (Dashboard, Subscription). Background `--bg-surface`. Right border `1px solid --border`. Collapsible to off-canvas on mobile via hamburger.
- **Content area:** Fluid. Padding `16px` mobile, `24px` tablet, `32px` desktop.
- **Mobile:** Sidebar slides in/out as overlay. Content is full-width.

### 12.2 Page Structure

```
┌─────────────────────────────────┐
│ Page header                     │
│ Title · Description · Actions   │
├─────────────────────────────────┤
│ Filters / Toolbar (if needed)   │
├─────────────────────────────────┤
│ Content (table, list, form)     │
│                                 │
│                                 │
├─────────────────────────────────┤
│ Pagination (if needed)          │
└─────────────────────────────────┘
```

- Page headers contain the page title (left) and primary action (right).
- Filter/toolbars sit between the header and content. Background `--bg-surface`, bottom border `1px solid --border`.
- Content fills available space.
- Pagination is inline, right-aligned.

### 12.3 Landing Layout

The landing page uses a different layout structure:

- **Full-width hero** with centered content, max-width `720px` for text
- **Section-based flow** with `48px`–`64px` vertical gaps between sections
- **Feature cards** in a responsive grid: 1 column mobile, 3 columns desktop
- **Pricing cards** in a responsive grid: 1 column mobile, 3 columns desktop
- **Footer** full-width, muted background

---

## 13. Components

### 13.1 Buttons

| Variant | Background | Text | Border | Usage |
|---|---|---|---|---|
| Primary | `--accent` | `#ffffff` | none | Main action (Create, Save, Upgrade) |
| Secondary | `--bg-surface` | `--text-primary` | `--border` | Alternate actions (Cancel, Close) |
| Danger | `--danger` | `#ffffff` | none | Destructive actions (Delete, Revoke) |
| Ghost | transparent | `--text-secondary` | none | Tertiary actions, icon buttons |
| Disabled | `--bg-muted` | `--text-muted` | `--border` | Unavailable actions |

**Sizes:**

| Size | Height | Padding | Font size |
|---|---|---|---|
| Sm | `32px` | `0 12px` | `12px` |
| Md | `36px` | `0 16px` | `13px` |
| Lg | `40px` | `0 20px` | `14px` |

**States:**
- Hover: darken background by `8%` or show border darkening.
- Focus: focus ring.
- Active: slight downward shift (`translateY(1px)`) or background darkening.
- Loading: replace label with spinner, disable interaction.

**Rules:**
- One primary button per section or form.
- Destructive actions require confirmation (modal or inline confirmation).
- Icon buttons: `32x32` or `36x36`, no visible border, icon only.

### 13.2 Inputs and Form Fields

```
Label (optional)
┌──────────────────────────────┐
│ Placeholder or value         │  ← 36px height
└──────────────────────────────┘
Helper text or error (optional)
```

**States:**
- Default: `1px solid --border`, background `--bg-surface`.
- Focus: `1px solid --accent`, ring `0 0 0 3px --accent-muted`.
- Error: `1px solid --danger`, error text below in `--danger`.
- Disabled: `--bg-muted`, `--text-muted`, no interaction.

**Field sizes:**
- Standard: `36px` height.
- Compact: `32px` height (tables, dense forms).

**Textarea:** Same styling, min-height `80px`, resizable vertically.

**Select:** Same as input, with custom chevron icon on right.

**Checkbox / Radio:**
- Custom styled. `16x16` box/circle.
- Border `--border-strong`, checked fill `--accent`, checkmark/icon `#ffffff`.
- Focus ring on the control.

**Toggle:**
- `36x20` track. Off: `--bg-muted`. On: `--accent`.
- Knob: `16x16` white circle, translates on toggle.

### 13.3 Cards and Panels

- Background: `--bg-surface`.
- Border: `1px solid --border`.
- Border radius: `8px`.
- No shadow on default application cards.
- Internal padding: `24px` horizontal, `20px` vertical.
- Hover: border darkens to `--border-strong`. No transform, no shadow increase.

**Card header:** Section title (`600`, `18px`), optional description below (`400`, `14px`, `--text-secondary`), optional action button right-aligned.

**Card sections:** Separated by `1px solid --border` horizontal rule, `0` margin (extends to card edges).

**Landing variant:** Feature cards on the landing page may use the landing shadow (section 7.3) and `10px` border radius.

### 13.4 Tables

Tables are a primary data view for URLs and analytics.

```
┌─────────┬──────────────┬────────┬──────────┬─────────┐
│ Header  │ Header       │ Header │ Header   │ Header  │ ← 52px height
├─────────┼──────────────┼────────┼──────────┼─────────┤
│ Cell    │ Cell         │ Cell   │ Cell     │ Cell    │ ← 44px height
├─────────┼──────────────┼────────┼──────────┼─────────┤
│ Cell    │ Cell         │ Cell   │ Cell     │ Cell    │
└─────────┴──────────────┴────────┴──────────┴─────────┘
```

- Header row: `--bg-muted`, border-bottom `2px solid --border`, text `--text-secondary`, weight `600`, size `12px`, uppercase tracking `0.05em`.
- Data rows: border-bottom `1px solid --border`. Background `--bg-surface`.
- Row hover: background `--bg-hover`.
- Row selected: background `--accent-muted`.
- Cell padding: `12px` vertical, `16px` horizontal.
- Cell text: `14px`, `--text-primary`. Secondary cell text: `--text-secondary`. Monospace values: `13px` monospace.
- Empty state: centered, muted text, optional illustration.
- Overflow: horizontal scroll on small screens with `position: sticky` on action column.

### 13.5 Navigation

**Top bar:**
- Logo (left): Product name or mark, `600` weight.
- Nav links: `14px`, `--text-secondary`. Active: `--text-primary`, bottom `2px solid --accent`.
- User menu (right): Avatar or initials circle, dropdown on click.

**Sidebar:**
- Section headings: `11px`, `600`, uppercase, `--text-muted`, `16px` left padding.
- Nav items: `14px`, `--text-secondary`, `40px` height, `12px` left padding. Left border `2px solid transparent`.
- Active item: `--text-primary`, background `--bg-hover`, left border `--accent`.
- Hover item: background `--bg-hover`.
- Grouped by function: Dashboard, Subscription.

**Breadcrumbs (if used):**
- `12px`, `--text-muted`. Separator: `/` in `--text-muted`. Current item: `--text-primary`, no link.

### 13.6 Badges and Status Indicators

| Badge | Background | Text | Usage |
|---|---|---|---|
| Free | `--bg-muted` | `--text-secondary` | Free plan |
| Pro | `--accent-muted` | `--accent` | Pro plan |
| Active | `rgba(22,163,74,0.1)` | `--success` | Active status |
| Expired | `rgba(220,38,38,0.1)` | `--danger` | Expired links |
| Warning | `rgba(217,119,6,0.1)` | `--warning` | Expiring soon |

- Size: `12px` text, `2px` padding vertical, `8px` horizontal. Border-radius `9999px`.
- No icons inside badges unless absolutely necessary.

### 13.7 Modals

- Centered overlay. Overlay: `rgba(0,0,0,0.4)`.
- Modal container: `--bg-surface`, border `1px solid --border`, radius `10px`, max-width `480px` (or `560px` for complex forms), shadow `--shadow-md`.
- Header: Title (`600`, `18px`). Close button (X) top-right, ghost icon button.
- Body: `24px` padding.
- Footer: Right-aligned buttons. Secondary (Cancel) then Primary (Confirm). Destructive actions: Danger button first.
- Focus traps inside modal. Escape to close.

### 13.8 Toasts / Notifications

- Position: bottom-right, `16px` from edges.
- Width: `360px` max.
- Background: `--bg-surface`, border `1px solid --border`, radius `8px`, shadow `--shadow-sm`.
- Left accent bar: `3px` wide, color by type (success/danger/warning/info).
- Content: title (`600`, `14px`), description (`400`, `13px`, `--text-secondary`). Dismiss button (X).
- Auto-dismiss after 5 seconds for success. Persist for errors.

### 13.9 Empty States

- Centered vertically and horizontally in available space.
- Icon or simple illustration (line art, muted color).
- Heading: `600`, `16px`, `--text-primary`.
- Description: `400`, `14px`, `--text-secondary`, max-width `360px`.
- Optional action button below.

### 13.10 Loading States

- Skeleton screens for content areas: `--bg-muted` rectangles with `4px` radius, animated with a subtle opacity pulse (no shimmer).
- Inline spinners: `16x16` or `20x20`, accent color, used inside buttons or near loading content.
- Page-level loading: centered spinner with optional "Loading..." text.

---

## 14. Surfaces and Views

### 14.1 Authentication

**Login / Signup pages:**
- Centered card layout. Max-width `400px`.
- Card: `--bg-surface`, border, radius `8px`, `32px` internal padding.
- Product name and logo above the card.
- Form: email, password, confirm password (signup), username (signup).
- Submit button: full width, primary.
- Toggle link below: "Already have an account?" / "Don't have an account?".
- Error display: inline field errors (red text below input) and top-level alert (danger badge + message).

**Password requirements (signup):**
- Listed below password field as a checklist. Each rule: muted text when unmet, success color with checkmark when met.

### 14.2 Dashboard

- Welcome heading with user name.
- Summary row: 3 stat cards (Total Links, Active Links, Total Clicks). Each card: number (`700`, `28px`), label (`--text-secondary`, `13px`), subtle icon.
- Recent links table: 5 rows, columns: Short URL, Destination, Clicks, Status, Created. "View All" link to full URL list.
- Quick actions: "Create Link" button prominently placed.

### 14.3 URL Creation

- Form card: destination URL input (full width), optional custom alias input, optional expiry display (for free users: shows 7-day limit; for pro: shows subscription period).
- Alias field: monospace font, prefix display (e.g., `short.ly/`).
- Validation: real-time inline errors. Destination must be valid HTTP(S). Alias must match `[A-Za-z0-9_-]`, 3–30 chars.
- Submit: "Create Short Link" primary button.
- On success: show created URL with copy button, link to details.

### 14.4 URL Listing

- Filter bar: search input (by alias or destination), status filter (All / Active / Expired), plan filter (All / Free / Pro), sort dropdown (Created / Clicks / Expiry).
- Table columns: Short URL (monospace, accent color, clickable), Destination (truncated with ellipsis), Clicks (right-aligned, monospace), Plan (badge), Status (badge), Expires (relative time + date tooltip), Actions (dropdown: Copy, Details, Upgrade to Pro, Delete).
- Bulk actions: select multiple via checkboxes, bulk delete, bulk upgrade.
- Pagination: "Showing X–Y of Z" with prev/next.
- Row click navigates to URL details.

### 14.5 URL Details

- Header: short URL (monospace, large), destination URL (below, muted), copy button, "Open" link.
- Stats row: Total Clicks, Unique Visitors (if available), Created date, Expires date, Plan badge, Status badge.
- Plan info: Free links show "Expires in X days". Pro links show "Active until [date]" with subscription reference.
- Upgrade CTA: If Free and user has Pro subscription, show "Upgrade to Pro" button. If no Pro subscription, link to subscription page.
- Analytics chart: time-series of clicks over selected period (7d, 30d, 90d).
- Referrers table: Top referrers with click counts.
- Actions section: Edit destination (if applicable), Delete (danger, with confirmation).

### 14.6 Redirect Experience

- Expired link: clean page with "This link has expired" message, product branding, link back to home. No decorative elements.
- Not found: "Link not found" page. Same clean style.
- Valid redirect: 302, no user-facing page. Analytics recorded server-side.

### 14.7 Analytics

- Date range selector: predefined (7d, 30d, 90d) and custom range picker.
- Summary cards: Total Clicks, Unique Visitors, Top Referrer, Top Country.
- Charts: click-over-time line chart, referrer bar chart, country/device breakdown.
- All charts: `--accent` for primary data, `--bg-muted` for grid lines, `--text-muted` for axis labels.
- Data tables below charts for detailed breakdowns.
- Empty state when no analytics data.

### 14.8 Subscriptions

- Current plan display: card showing plan name, status, period, expiration.
- Free plan card: shows limits (7 links, 7-day expiry), "Upgrade to Pro" CTA.
- Pro plan card: shows benefits (unlimited links, extended expiry), subscription status, "Manage" or "Cancel" actions.
- Plan comparison table: columns for Free and Pro, rows for features (max links, link duration, analytics, custom aliases).
- Upgrade flow: confirmation modal with plan summary, no payment yet (placeholder for Stripe integration).

### 14.9 Settings

- Profile section: username (read-only), email, display name, avatar.
- Password change: current password, new password, confirm new password.
- Account section: account creation date, subscription status, link to subscription management.
- Danger zone: delete account (requires typing username to confirm).
- Form layout: stacked labels above inputs, save button per section.

---

## 15. URL History Treatment

URLs are the core data object. Their presentation must be consistent and clear.

### 15.1 Short URL Display

- Always monospace font.
- Accent color when clickable.
- Truncated with ellipsis if too long for container.
- Copy button adjacent (icon button, ghost variant).

### 15.2 Destination Display

- Truncated with ellipsis after ~60 characters.
- Secondary text color (`--text-secondary`).
- Full URL on hover (title attribute) or click-to-expand.

### 15.3 Status Display

| Status | Badge | Meaning |
|---|---|---|
| Active | Green badge | Link is live and redirecting |
| Expired | Red badge | Link has passed its expiry date |
| Expiring Soon | Amber badge | Link expires within 48 hours |

### 15.4 Click Count

- Right-aligned in tables.
- Monospace font.
- Formatted with locale-appropriate thousands separators.

### 15.5 Expiry Display

- Relative time ("in 3 days", "2 hours ago") with absolute date on hover (tooltip).
- Warning color when within 48 hours of expiry.
- Danger color when expired.

### 15.6 Plan Display

- Badge: "Free" (muted) or "Pro" (accent).
- Shown in table rows and detail views.

---

## 16. Responsive Breakpoints

| Breakpoint | Width | Behavior |
|---|---|---|
| Mobile | `< 640px` | Single column, no sidebar, hamburger nav, stacked forms, full-width cards |
| Tablet | `640px – 1023px` | Collapsed sidebar (off-canvas), 2-column grids where applicable |
| Desktop | `≥ 1024px` | Full sidebar (`240px`), multi-column layouts, full table views |

### Rules

- Forms are single-column on all sizes. Two-column form layouts only for wide screens with related field groups.
- Tables scroll horizontally on mobile. Priority columns (Short URL, Actions) are sticky.
- Modals are full-width on mobile with `16px` margin.
- Page padding: `16px` mobile, `24px` tablet, `32px` desktop.
- Landing hero: text reduces from `2.5rem` to `1.75rem` on mobile.

---

## 17. States and Feedback

### Interactive States

| State | Behavior |
|---|---|
| Default | Standard appearance |
| Hover | Background darkens slightly, cursor pointer |
| Focus-visible | Focus ring (blue ring), shown on keyboard nav |
| Active/Pressed | Slight downward shift or background darken |
| Disabled | `--bg-muted`, `--text-muted`, `pointer-events: none` |
| Loading | Spinner replaces content, interaction disabled |

### Validation States

| State | Input border | Text color | Background |
|---|---|---|---|
| Default | `--border` | `--text-primary` | `--bg-surface` |
| Success | `--success` | `--text-primary` | `--bg-surface` |
| Error | `--danger` | `--danger` | `--bg-surface` |
| Warning | `--warning` | `--text-primary` | `--bg-surface` |

### Status Indicators

| Status | Color | Badge |
|---|---|---|
| Active | `--success` | Green-tinted badge |
| Expired | `--danger` | Red-tinted badge |
| Expiring soon | `--warning` | Amber-tinted badge |
| Free | muted | Gray badge |
| Pro | accent | Blue-tinted badge |

---

## 18. Accessibility

- All interactive elements have visible focus indicators.
- Color is never the sole indicator of status. Icons or text labels accompany color.
- All images have `alt` text. Decorative images use `alt=""`.
- Form fields have associated labels (not placeholder-only).
- Error messages are linked to inputs via `aria-describedby`.
- Modals trap focus and return focus on close.
- Tables use proper `<th>` with `scope` attributes.
- Skip-to-content link at the top of every page.
- Minimum touch target: `44x44px` on mobile.
- Contrast ratios: text on background ≥ `4.5:1`. Large text ≥ `3:1`.
- All animations respect `prefers-reduced-motion: reduce`.

---

## 19. Iconography

- Use a consistent icon library (Lucide, Heroicons outline, or similar).
- Icon size: `16x16` inline with text. `20x20` in buttons. `24x24` in navigation.
- Color: matches surrounding text. In buttons: matches button text color.
- No filled icons except for active states (e.g., filled heart for favorited).
- Icons in tables/actions are `16x16`.

---

## 20. Grid and Layout System

- Use CSS Grid and Flexbox. No external layout framework.
- Content max-width: `1200px`.
- Sidebar: `240px` fixed.
- Content area: `calc(100% - 240px - 64px)` (sidebar + padding).
- Cards in grid: `gap: 16px` to `24px`.
- Form field groups: `gap: 16px` between fields, `24px` between groups.

---

## 21. Design Tokens Summary

All tokens are defined as CSS custom properties in `index.css`. They are referenced throughout components via `var(--token-name)`.

### Core Tokens

| Category | Tokens |
|---|---|
| Background | `--bg-base`, `--bg-surface`, `--bg-muted`, `--bg-hover` |
| Border | `--border`, `--border-strong` |
| Text | `--text-primary`, `--text-secondary`, `--text-muted` |
| Accent | `--accent`, `--accent-hover`, `--accent-muted` |
| Semantic | `--success`, `--warning`, `--danger`, `--danger-muted` |

### Tailwind Theme

| Token | Value | Usage |
|---|---|---|
| `--font-sans` | `'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif` | Body font |
| `--font-mono` | `ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace` | Code/monospace font |
| `--color-brand` | `#2563eb` | Tailwind brand color |
| `--color-brand-hover` | `#1d4ed8` | Tailwind brand hover |

---

## 22. What This System Avoids

This is as important as what it includes.

- **No purple, violet, or violet-blue.** Not as accent, not in gradients, not in backgrounds.
- **No glassmorphism.** No `backdrop-filter: blur()` on content surfaces.
- **No decorative blobs, gradients, or patterns** on application backgrounds. Pages are solid `--bg-base`. Landing hero may use a very subtle radial gradient.
- **No oversized marketing typography in the application.** No `3rem+` headings anywhere. Landing hero maximum `2.5rem`.
- **No excessive rounded corners.** Application cards and buttons are `6px`–`10px`, not `16px`–`24px`.
- **No excessive shadows.** Only floating elements get shadows in the application. Cards use borders.
- **No gradient-heavy backgrounds.** Solid colors only in the application. Gradient use on landing is restricted to hero background wash.
- **No fake dashboard metrics** or placeholder content in production views.
- **No unnecessary animations.** Only functional transitions (hover, focus, open/close). No floating, no pulse-glow, no decorative motion.
- **Not every section is a card.** Use cards for grouped, elevated content. Lists, tables, and forms are not wrapped in cards unless they are islands of content.
- **No excessive empty space.** Dense, information-rich layouts in the application. White space is functional, not decorative.

---

## 23. Migration Notes

The current frontend uses a Neutral Modern design system with:

- Blue (`#2563eb`) accent
- Border-first card definition
- No glassmorphism or decorative gradients
- Minimal shadows
- Functional motion only

All components have been updated to use the shared UI primitives (`Button`, `Input`, `Card`, `Badge`, `Table`, `Modal`, `Skeleton`, `PageHeader`, `EmptyState`). The old Neo-Brutalist / Spotify-green aesthetic has been fully removed.

### Remaining work

- `ExpiredPage.jsx` still uses old neo-brutalist CSS classes (`card-neo`, `btn-neo-primary`, `shadow-neo-sm`). Needs reskin.
- `CopyButton.jsx` and `ThemeToggle.jsx` use old class patterns. Need reskin.
- `Modal.jsx` and `PageHeader.jsx` are defined but not imported by any component. Consider integration or removal.
- `AnalyticsPanel` renders inline `<table>` instead of using the `Table` compound component. Consider migrating.

---

*This document is the source of truth for frontend design decisions. When in conflict with existing code, this document wins. Update this file when design decisions change.*
