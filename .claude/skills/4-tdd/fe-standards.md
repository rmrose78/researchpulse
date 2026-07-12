# Frontend Standards — ResearchPulse

Read this before writing any frontend component.

## Stack
- React 19 + TypeScript + Vite 8
- SCSS modules — one `.module.scss` per component, no exceptions
- NO Tailwind — pure SCSS only
- Radix UI for accessible primitives
- Framer Motion for animations
- Jest + React Testing Library for tests

## Component Conventions
- File naming: kebab-case (`search-bar.tsx`, `article-card.tsx`)
- Component naming: PascalCase (`SearchBar`, `ArticleCard`)
- One component per file
- Props interface typed explicitly above component
- Default export for components, named exports for hooks and utils

```tsx
interface SearchBarProps {
  onSearch: (query: string) => void
  isLoading?: boolean
}

export default function SearchBar({ onSearch, isLoading = false }: SearchBarProps) {
  ...
}
```

## SCSS Modules
- One `.module.scss` per component, lives next to the component file
- camelCase class names — no BEM, modules handle scoping
- No inline styles ever
- Every module starts with:

```scss
@use '@/styles/_variables.scss' as *;
@use '@/styles/_mixins.scss' as *;
```

## Mobile-First
Always min-width, never max-width:

```scss
.element {
  padding: 1rem;        // mobile base
  @include desktop {
    padding: 3rem;      // desktop override
  }
}
```

## TypeScript
- Use `interface` for objects that might be extended
- Use `type` for unions and aliases
- Never use `any` — use `unknown` or proper typing
- Type event handlers explicitly:

```tsx
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {}
const handleSubmit = (e: React.FormEvent) => {}
```

## API Calls
- All API calls go through `src/utils/api.ts`
- Never call `fetch` directly in a component
- Use `VITE_API_URL` env variable — never hardcode localhost

```ts
const BASE_URL = import.meta.env.VITE_API_URL

export async function searchArticles(query: string) {
  const res = await fetch(`${BASE_URL}/api/search/?q=${query}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}
```

## Framer Motion
Define variants outside components:

```tsx
const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
} as const
```

Always respect reduced motion:

```tsx
const reduced = useReducedMotion()
<motion.div
  variants={fadeIn}
  initial={reduced ? 'visible' : 'hidden'}
  animate="visible"
>
```

## States Every Async Component Must Handle
- Loading — skeleton or spinner
- Empty — friendly message, not blank
- Error — distinct message with retry action
- Success — the actual content

## Folder Structure
```
src/
  components/
    layout/     # Nav, Footer
    sections/   # SearchBar, ArticleList, ArticleDetail
    ui/         # Button, Card, Modal — reusable primitives
  hooks/        # Custom React hooks
  styles/       # globals.scss, _variables.scss, _mixins.scss
  types/        # Shared TypeScript interfaces
  utils/        # api.ts and pure helper functions
  assets/
```