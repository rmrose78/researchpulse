export interface NavItem {
  to: string
  label: string
  end?: boolean
}

// Shared between the desktop nav list (layout.tsx) and the mobile
// hamburger overlay (mobile-nav.tsx) so the link set only lives in one place.
export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Trending', end: true },
  { to: '/search', label: 'Search PubMed' },
  { to: '/reading-list', label: 'Reading List' },
  { to: '/how-it-works', label: 'How It Works' },
]
