# ADR-001: Build statica + Nginx come pattern di dockerizzazione FE

## Stato
Accettata — 2026-XX-XX

## Contesto
L'app campione FE è una SPA (Vite + React) che deve essere servita in modo:
- Performante (caching aggressivo degli asset hashati)
- Sicuro (no Node nel runtime, niente codice server-side)
- Compatto (immagine container leggera per pull veloci)

Le opzioni considerate:
1. **Build statica + Nginx** (multi-stage Node builder → Nginx runtime)
2. **Next.js standalone SSR** (Node nel runtime, server.js generato dal build)
3. **Bundle servito da Express** (Node nel runtime, custom server)

## Decisione
**Build statica + Nginx**, multi-stage Dockerfile.

## Conseguenze

### Pro
- Immagine finale ~30 MB (Nginx + statics) vs ~400 MB se tenessimo Node
- Niente runtime JavaScript server-side: meno superficie d'attacco
- Nginx è battle-tested per il serving di asset statici (caching, gzip, brotli, fallback SPA)
- Gestione cache asset hashati di Vite tramite header `Cache-Control: public, immutable`
- Possibile usare lo stesso Nginx come reverse proxy verso `/api/*` (caso del bootcamp con `mock-api`)

### Contro
- No SSR / SSG: contenuti dinamici devono essere fetchati lato client (problemi SEO se la priorità è l'indicizzazione)
- Routing SPA richiede `try_files $uri $uri/ /index.html` esplicito nel `nginx.conf`
- Header CSP / sicurezza vanno configurati in Nginx, non semplici come in un framework full-stack

### Da rivedere
- Se in futuro serve SSR (es. landing page indicizzabile o auth gate server-side), valutare il passaggio a Next.js standalone
- Per micro-frontend o module federation, considerare un orchestrator come Nginx/Module Federation host
