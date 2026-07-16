// Mirrors backend/app/services/specialties.py — six curated clinical
// specialties, each backed by an explicit MeSH-scoped query server-side.
export interface Specialty {
  key: string
  label: string
}

export const SPECIALTIES: Specialty[] = [
  { key: 'cardiology', label: 'Cardiology' },
  { key: 'oncology', label: 'Oncology / Cancer' },
  { key: 'infectious_disease', label: 'Infectious Disease' },
  { key: 'neurology', label: 'Neurology' },
  { key: 'alzheimers_dementia', label: "Alzheimer's & Dementia" },
  { key: 'public_health_policy', label: 'Public Health & Policy' },
]

export const DEFAULT_SPECIALTY = SPECIALTIES[0].key
