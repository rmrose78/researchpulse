# API Endpoints

GET    /health                      ✅ done
GET    /api/search/                 ✅ done
GET    /api/search/{pmid}           ✅ done
POST   /api/reading-list/           ✅ done
GET    /api/reading-list/           ✅ done
DELETE /api/reading-list/{pmid}     ✅ done
GET    /api/trending/               ✅ done — query params: specialty, mode
                                     (trending | most_cited | new_notable),
                                     window_days
GET    /api/trending/availability   ✅ done — same specialty/mode/window_days
                                     params, used to drive fallback messaging
GET    /api/search/{pmid}/summary   — Phase 3
