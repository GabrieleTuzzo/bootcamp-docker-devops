# Code Blueprint G2 — Percorso FE

Estensione del blueprint G1 con pipeline CI/CD su GitHub Actions, push immagine su GHCR, e manifest Kubernetes.

## Pre-requisiti

- Tutto il blueprint G1 (incluso, vedi struttura sotto)
- Account GitHub con un Personal Access Token (`write:packages`)
- Repository GitHub creato per pushare il blueprint

## Setup veloce

1. **Crea un repo GitHub vuoto** (es. `bootcamp-docker-devops`)
2. **Inizializza il repo** dal contenuto di questo zip:
   ```bash
   cd <questa-cartella>
   git init
   git add .
   git commit -m "G2: blueprint completo con CI/CD"
   git branch -M main
   git remote add origin https://github.com/<your-user>/bootcamp-docker-devops.git
   git push -u origin main
   ```
3. **Verifica i workflow** nella tab `Actions` del repo GitHub
4. **Verifica l'immagine pushata** nella tab `Packages` del repo

## Struttura

```
g02_fe/
├── docker-compose.yml
├── README.md
├── .gitignore
├── .github/
│   ├── workflows/
│   │   ├── ci.yml        # CI: build statica FE + lint Dockerfile
│   │   └── docker.yml    # Build & push immagine FE su GHCR
│   └── dependabot.yml
├── docs/
│   └── architecture-decision-001.md
├── k8s/
│   ├── deployment.yaml   # Deployment Nginx con probes leggere
│   ├── service.yaml      # Service ClusterIP
│   └── configmap.yaml
└── percorso-fe/
    ├── Dockerfile
    ├── nginx.conf
    ├── .dockerignore
    ├── package.json
    ├── package-lock.json
    ├── vite.config.js
    ├── index.html
    ├── mocks/
    │   └── db.json
    └── src/
        ├── main.jsx
        └── App.jsx
```

## Smoke test E2E (Giorno 2)

```bash
# 1. Modifica banale al frontend
sed -i 's/Lipari Accounts/Lipari Accounts v2/' percorso-fe/src/App.jsx

# 2. Commit e push
git add . && git commit -m "feat: update FE title"
git push origin main

# 3. Verifica del workflow Docker
gh run watch --exit-status

# 4. SHA dell'ultimo commit
SHA=$(git rev-parse --short HEAD)

# 5. Pull dell'immagine appena pushata
docker pull ghcr.io/<your-user>/bootcamp-docker-devops-fe:$SHA

# 6. Run del container
docker run --rm -d --name test-fe -p 8081:80 ghcr.io/<your-user>/bootcamp-docker-devops-fe:$SHA

# 7. Smoke test browser
# Apri http://localhost:8081 — deve mostrare "Lipari Accounts v2"

# 8. Cleanup
docker stop test-fe
```

## Cosa imparare leggendo questo blueprint

- **`.github/workflows/ci.yml`**: la CI per un FE statico è leggera (build + lint del Dockerfile). Il "test" è il `vite build` stesso: se compila, l'output è valido.
- **`.github/workflows/docker.yml`**: stesso pattern del BE — build & push GHCR con metadata-action, cache `type=gha,mode=max,scope=fe`.
- **`scope=fe`** nella cache: separa la cache del FE da quella del BE per evitare interferenze tra immagini diverse nel monorepo.
- **`k8s/deployment.yaml`**: 2 replicas (HA basico per Nginx), probes molto leggere (`initialDelaySeconds: 3` per readiness — Nginx parte istantaneamente).
- **`docs/architecture-decision-001.md`**: ADR sul perché si è scelto "build statica + Nginx" rispetto a Next.js SSR.

## Cosa NON c'è (volutamente)

- **Niente kubectl apply**: il manifest K8s è "modello da leggere".
- **Niente Ingress / TLS / cert-manager**: per esporre fuori dal cluster servirebbe un Ingress Controller — argomento per un corso K8s dedicato.
- **Niente CDN davanti a Nginx**: in produzione vera, davanti a Nginx ci sarebbe CloudFront/Cloudflare/Fastly per cache geografica.

## Avvia il project work

Procedi al `project_work_esercizi_studente.md`, sezione "GIORNO 2", per gli esercizi 🟢 CORE.
