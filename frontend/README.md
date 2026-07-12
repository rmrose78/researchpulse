# rr-dev

Personal portfolio site for Ryan Rose — frontend developer.

## Stack

- Vite 8 + React 19 + TypeScript
- SCSS Modules with Tailwind v4 via `@import "tailwindcss"`
- Framer Motion for animations
- Radix UI for accessible primitives (Dialog, VisuallyHidden)
- Jest + React Testing Library for unit/component tests

## Conventions

- Components: PascalCase (`HeroSection.tsx`)
- Files: kebab-case (`hero-section.module.scss`)
- Path alias: `@/` maps to `src/`
- No inline styles — ever
- SCSS lives next to its component, not in a global folder
- Global styles, variables, and mixins live in `src/styles/`

## Accessibility

Section 508 / WCAG 2.1 AA is first-class throughout. Every interactive element needs a keyboard path. Modals trap focus and return it on close. Animations respect `prefers-reduced-motion`.

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run format` — Prettier
- `npm test` — Jest
- `npm run test:watch` — Jest watch mode

## Structure

src/
components/
layout/ # Nav, Footer
sections/ # Hero, About, Skills, Experience, Testimonials, Contact
ui/ # Button, Modal, Pill, StatCard — reusable primitives
hooks/ # Custom React hooks
styles/ # globals.scss, \_variables.scss, \_mixins.scss
types/ # Shared TypeScript types
utils/ # Pure helper functions
assets/ # Fonts, images
