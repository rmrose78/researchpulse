# Each specialty maps to an explicit MeSH-scoped PubMed query string.
SPECIALTY_QUERIES: dict[str, str] = {
    "cardiology": '"Cardiovascular Diseases"[Mesh]',
    "oncology": '"Neoplasms"[Mesh]',
    "infectious_disease": '"Communicable Diseases"[Mesh]',
    "neurology": '"Nervous System Diseases"[Mesh]',
    "alzheimers_dementia": '"Alzheimer Disease"[Mesh] OR "Dementia"[Mesh]',
    "public_health_policy": '"Public Health"[Mesh] OR "Health Policy"[Mesh]',
}

SPECIALTY_LABELS: dict[str, str] = {
    "cardiology": "Cardiology",
    "oncology": "Oncology / Cancer",
    "infectious_disease": "Infectious Disease",
    "neurology": "Neurology",
    "alzheimers_dementia": "Alzheimer's & Dementia",
    "public_health_policy": "Public Health & Policy",
}
